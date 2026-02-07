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
