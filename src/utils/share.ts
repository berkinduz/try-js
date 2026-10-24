import LZString from "lz-string";
import { parsePlayground, playgroundPath } from "./playground.ts";
import type { PlaygroundState } from "./playground.ts";

const { compressToEncodedURIComponent: compress, decompressFromEncodedURIComponent: decompress } = LZString;
const MAX_URL_LENGTH = 4000;
const MAX_HASH_LENGTH = 100_000;
export type SharedState = PlaygroundState;

/** Versioned URLs remain compatible with existing JS/TS and Web links. */
export function encodeToHash(value: SharedState): string {
  const state = parsePlayground(value);
  if (!state) throw new Error("This playground is too large to share. Copy the code or split it into smaller examples.");
  const params = new URLSearchParams({ v: "2" });
  if (state.mode === "web") {
    params.set("mode", "web");
    params.set("html", compress(state.html));
    params.set("css", compress(state.css));
    params.set("wjs", compress(state.webJs));
  } else {
    if (state.mode === "react") {
      params.set("mode", "react");
      params.set("css", compress(state.css));
    }
    params.set("code", compress(state.code));
    params.set("lang", state.language === "typescript" ? "ts" : "js");
  }
  const hash = `#${params}`;
  if (hash.length > MAX_HASH_LENGTH) {
    throw new Error("This playground is too large for a link. Export a JSON backup instead.");
  }
  return hash;
}

export function decodeFromHash(hash: string): SharedState | null {
  if (!hash || hash.length < 2 || hash.length > MAX_HASH_LENGTH) return null;
  try {
    const params = new URLSearchParams(hash.slice(1));
    if (params.has("v") && params.get("v") !== "2") return null;
    const read = (key: string): string | null => {
      const compressed = params.get(key);
      return compressed ? decompress(compressed) : "";
    };
    const mode = params.get("mode");
    if (mode === "web") {
      return parsePlayground({ mode, html: read("html"), css: read("css"), webJs: read("wjs") });
    }
    if (mode !== null && mode !== "js" && mode !== "react") return null;
    if (!params.has("code")) return null;
    return parsePlayground({
      mode: mode ?? "js", code: read("code"),
      language: params.get("lang") === "ts" ? "typescript" : "javascript",
      ...(mode === "react" ? { css: read("css") } : {}),
    });
  } catch {
    return null;
  }
}

export function shareUrl(state: SharedState, origin: string): string {
  return `${origin}${playgroundPath(state)}${encodeToHash(state)}`;
}

export async function shareToClipboard(state: SharedState): Promise<{ ok: boolean; warning?: string }> {
  const url = shareUrl(state, window.location.origin);
  await navigator.clipboard.writeText(url);
  return url.length > MAX_URL_LENGTH
    ? { ok: true, warning: `Link copied (${url.length} characters). Some services may shorten long links; a JSON backup keeps the full playground.` }
    : { ok: true };
}

export function generateEmbedCode(state: SharedState, origin = "https://tryjs.app"): string {
  const url = `${origin}/embed${encodeToHash(state)}`;
  return `<iframe src="${url}" width="100%" height="400" style="border:0;border-radius:8px;" loading="lazy" title="TryJS code playground" sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox"></iframe>`;
}
