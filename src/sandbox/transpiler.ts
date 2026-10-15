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
