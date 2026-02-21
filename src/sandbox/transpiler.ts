import { transform } from "sucrase";
import type { Language } from "../state/editor";

export interface TranspileResult {
  code: string;
  error: null;
}

export interface TranspileError {
  code: null;
  error: string;
}

export function transpile(
  source: string,
  lang: Language
): TranspileResult | TranspileError {
  if (lang === "javascript") {
    return { code: source, error: null };
  }

  try {
    const result = transform(source, {
      transforms: ["typescript"],
      disableESTransforms: true,
    });
    return { code: result.code, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { code: null, error: message };
  }
}

// --- NPM import support ---

const ESM_SH_BASE = "https://esm.sh/";

/** Matches bare npm specifiers: lodash, react, @scope/pkg, lodash/fp */
const BARE_SPECIFIER_RE = /^[a-zA-Z@][a-zA-Z0-9._\-/]*$/;

/**
 * Detect whether code contains import statements.
 * Checks static imports, side-effect imports, and dynamic imports.
 */
export function hasImports(code: string): boolean {
  return /\bimport\s+/.test(code) || /\bimport\s*\(/.test(code);
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
export function rewriteImports(code: string): string {
  // Static imports: from 'specifier' or from "specifier"
  let result = code.replace(
    /(\bfrom\s+)(["'])([^"']+)\2/g,
    (_match, prefix, quote, specifier) => {
      if (BARE_SPECIFIER_RE.test(specifier)) {
        return `${prefix}${quote}${ESM_SH_BASE}${specifier}${quote}`;
      }
      return _match;
    }
  );

  // Side-effect imports: import 'specifier' (not preceded by "from")
  // Match: import + quote + specifier + quote (but NOT import { or import X)
  result = result.replace(
    /(\bimport\s+)(["'])([^"']+)\2/g,
    (_match, prefix, quote, specifier) => {
      if (BARE_SPECIFIER_RE.test(specifier)) {
        return `${prefix}${quote}${ESM_SH_BASE}${specifier}${quote}`;
      }
      return _match;
    }
  );

  // Dynamic imports: import('specifier') or import("specifier")
  result = result.replace(
    /(\bimport\s*\(\s*)(["'])([^"']+)\2(\s*\))/g,
    (_match, prefix, quote, specifier, suffix) => {
      if (BARE_SPECIFIER_RE.test(specifier)) {
        return `${prefix}${quote}${ESM_SH_BASE}${specifier}${quote}${suffix}`;
      }
      return _match;
    }
  );

  return result;
}
