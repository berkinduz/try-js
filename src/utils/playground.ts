export type Language = "javascript" | "typescript";
export type AppMode = "js" | "web" | "react";

export type PlaygroundState =
  | { mode?: "js"; code: string; language: Language }
  | {
      mode: "web"; code: string; language: "javascript";
      html: string; css: string; webJs: string;
    }
  | { mode: "react"; code: string; language: "javascript"; css: string };

export const MAX_PLAYGROUND_CHARS = 500_000;

/** Copy only supported fields; imported data never becomes application state unchecked. */
export function parsePlayground(value: unknown, maxChars = MAX_PLAYGROUND_CHARS): PlaygroundState | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  let state: PlaygroundState;
  if (input.mode === "web") {
    if ([input.html, input.css, input.webJs].some((part) => typeof part !== "string")) return null;
    state = {
      mode: "web", code: "", language: "javascript",
      html: input.html as string, css: input.css as string, webJs: input.webJs as string,
    };
  } else if (input.mode === "react") {
    if (typeof input.code !== "string" || typeof input.css !== "string") return null;
    state = { mode: "react", code: input.code, language: "javascript", css: input.css };
  } else {
    if (input.mode !== undefined && input.mode !== "js") return null;
    if (typeof input.code !== "string") return null;
    if (input.language !== "javascript" && input.language !== "typescript") return null;
    state = { mode: "js", code: input.code, language: input.language };
  }
  return playgroundText(state).length <= maxChars ? state : null;
}

export function playgroundText(state: PlaygroundState): string {
  if (state.mode === "web") return state.html + state.css + state.webJs;
  if (state.mode === "react") return state.code + state.css;
  return state.code;
}

export function playgroundPath(state: PlaygroundState): string {
  return state.mode === "web" ? "/web" : state.mode === "react" ? "/react" : "/";
}

export function playgroundLabel(state: PlaygroundState): string {
  if (state.mode === "web") return "HTML / CSS / JS";
  if (state.mode === "react") return "React";
  return state.language === "typescript" ? "TypeScript" : "JavaScript";
}
