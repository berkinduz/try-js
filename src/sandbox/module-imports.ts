import { parser } from "@lezer/javascript";

const ESM_SH_BASE = "https://esm.sh/";
import { REACT_VERSION } from "../utils/runtime-versions.ts";
export { REACT_VERSION };

/** Matches bare npm specifiers: lodash, react, @scope/pkg, lodash/fp */
export function parsePackageSpecifier(specifier: string): {
  name: string; version?: string; path: string;
} | null {
  const match = specifier.match(/^(@[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+|[a-zA-Z0-9][a-zA-Z0-9._-]*)(?:@([a-zA-Z0-9.*+~^=|-]+))?(\/[^\s?#]*)?$/);
  return match ? { name: match[1], version: match[2], path: match[3] ?? "" } : null;
}

export function moduleSpecifiers(code: string): { from: number; to: number; value: string }[] {
  const imports: { from: number; to: number; value: string }[] = [];
  parser.configure({ dialect: "ts jsx" }).parse(code).iterate({
    enter(node) {
      if (!["ImportDeclaration", "ExportDeclaration", "DynamicImport"].includes(node.name)) return;
      const literal = node.node.getChild("String");
      if (!literal) return;
      const raw = code.slice(literal.from, literal.to);
      // Package names do not contain escapes. Leave unusual literals to the browser.
      if (raw.includes("\\")) return;
      imports.push({ from: literal.from, to: literal.to, value: raw.slice(1, -1) });
    },
  });
  return imports;
}

/**
 * Detect whether code contains import statements.
 * Checks static imports, side-effect imports, and dynamic imports.
 */
export function hasImports(code: string): boolean {
  let isModule = false;
  parser.parse(code).iterate({
    enter(node) {
      if (["ImportDeclaration", "ExportDeclaration", "DynamicImport"].includes(node.name)) {
        isModule = true;
      }
      if (node.name === "AwaitExpression") {
        let parent = node.node.parent;
        while (parent && !/Function|Method/.test(parent.name)) parent = parent.parent;
        if (!parent) isModule = true;
      }
    },
  });
  return isModule;
}

/**
 * Rewrite bare import specifiers to esm.sh URLs.
 * Skips relative paths (./  ../) and URLs (http:// https://).
 *
 * Handles:
 *   import foo from 'lodash'           -> import foo from 'https://esm.sh/lodash'
 *   import { x } from 'react'          -> import { x } from 'https://esm.sh/react'
 *   import 'normalize.css'             -> import 'https://esm.sh/normalize.css'
 *   const m = await import('lodash')   -> const m = await import('https://esm.sh/lodash')
 */
export interface ImportRewrite {
  from: number;
  to: number;
  replacement: string;
}

export function rewriteImportsWithMapping(code: string, reactPreview = false): { code: string; changes: ImportRewrite[] } {
  const changes: ImportRewrite[] = [];
  for (const specifier of moduleSpecifiers(code)) {
    const pkg = parsePackageSpecifier(specifier.value);
    if (!pkg) continue;
    // React packages in a preview must use one runtime, including transitive dependencies.
    if (reactPreview && (pkg.name === "react" || pkg.name === "react-dom")) {
      if (pkg.version && pkg.version !== REACT_VERSION && pkg.version !== "19") {
        throw new Error(`React preview uses React ${REACT_VERSION}. Import from "${pkg.name}${pkg.path}" to use the shared runtime.`);
      }
      const mapped = pkg.name + pkg.path;
      changes.push({ ...specifier, replacement: JSON.stringify(mapped) });
      continue;
    }
    const url = new URL(ESM_SH_BASE + specifier.value);
    if (reactPreview) url.searchParams.set("external", "react,react-dom");
    changes.push({ ...specifier, replacement: JSON.stringify(url.href) });
  }
  let result = code;
  for (const change of [...changes].reverse()) {
    result = result.slice(0, change.from) + change.replacement + result.slice(change.to);
  }
  return { code: result, changes };
}

export function rewriteImports(code: string, reactPreview = false): string {
  return rewriteImportsWithMapping(code, reactPreview).code;
}
