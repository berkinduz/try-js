import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { Language } from "../state/editor";

const MAX_URL_LENGTH = 4000;

export interface SharedState {
  code: string;
  language: Language;
}

/**
 * Encode code + language into a URL-safe hash fragment.
 * Format: #code=<lz-compressed>&lang=js|ts
 */
export function encodeToHash(state: SharedState): string {
  const compressed = compressToEncodedURIComponent(state.code);
  const lang = state.language === "typescript" ? "ts" : "js";
  return `#code=${compressed}&lang=${lang}`;
}

/**
 * Decode a hash fragment back into code + language.
 * Returns null if hash is empty or malformed.
 */
export function decodeFromHash(hash: string): SharedState | null {
  if (!hash || hash.length < 2) return null;
  const params = new URLSearchParams(hash.slice(1));
  const compressed = params.get("code");
  const lang = params.get("lang");
  if (!compressed) return null;

  const code = decompressFromEncodedURIComponent(compressed);
  if (code === null || code === "") return null;

  const language: Language = lang === "ts" ? "typescript" : "javascript";
  return { code, language };
}

/**
 * Build a shareable URL and copy it to the clipboard.
 * Returns { ok, warning? } where warning is set if URL is too long.
 */
export async function shareToClipboard(state: SharedState): Promise<{
  ok: boolean;
  warning?: string;
}> {
  const hash = encodeToHash(state);
  const url = `${window.location.origin}${window.location.pathname}${hash}`;

  await navigator.clipboard.writeText(url);

  if (url.length > MAX_URL_LENGTH) {
    return {
      ok: true,
      warning: `URL is ${url.length} chars. Some services may truncate long URLs.`,
    };
  }

  return { ok: true };
}

/**
 * Generate an embeddable iframe snippet for the given code.
 */
export function generateEmbedCode(state: SharedState): string {
  const hash = encodeToHash(state);
  const url = `https://tryjs.app/?embed=1${hash}`;
  return `<iframe src="${url}" width="100%" height="400" style="border:0;border-radius:8px;" loading="lazy"></iframe>`;
}
