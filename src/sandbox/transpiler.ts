import { transform } from "sucrase";
import type { TransformResult } from "sucrase";
import type { Language } from "../state/editor";
import type { SourcePosition } from "./source-location.ts";

export interface TranspileResult {
  code: string;
  error: null;
  sourceMap?: TransformResult["sourceMap"];
}

export interface TranspileError {
  code: null;
  error: string;
  location?: SourcePosition;
}

function errorPosition(error: unknown): SourcePosition | undefined {
  const loc = (error as { loc?: { line: number; column: number } })?.loc;
  return loc ? { line: loc.line, column: loc.column } : undefined;
}

/** Browsers often omit eval/module syntax-error coordinates. Only use a parser location
 * after the browser has rejected the JavaScript, so new browser syntax still works. */
export function syntaxErrorPosition(source: string): SourcePosition | undefined {
  try {
    transform(source, { transforms: [], disableESTransforms: true });
  } catch (error) {
    return errorPosition(error);
  }
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
      filePath: "playground.ts",
      sourceMapOptions: { compiledFilename: "playground.js" },
    });
    return { code: result.code, sourceMap: result.sourceMap, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { code: null, error: message.replace(/^Error transforming playground\.ts: /, ""), location: errorPosition(e) };
  }
}

/** Transpile JSX code (for React playground). */
export function transpileJsx(source: string): TranspileResult | TranspileError {
  try {
    const result = transform(source, {
      transforms: ["jsx"],
      jsxRuntime: "automatic",
      production: true,
      disableESTransforms: false,
    });
    return { code: result.code, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { code: null, error: message };
  }
}

export { REACT_VERSION, hasImports, rewriteImports, moduleSpecifiers, parsePackageSpecifier } from "./module-imports.ts";
