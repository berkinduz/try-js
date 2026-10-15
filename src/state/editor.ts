import { signal, computed, batch } from "@preact/signals";
import {
  DEFAULT_JS_CODE,
  DEFAULT_TS_CODE,
  DEFAULT_WEB_HTML,
  DEFAULT_WEB_CSS,
  DEFAULT_WEB_JS,
  DEFAULT_REACT_CODE,
  DEFAULT_REACT_CSS,
} from "../utils/constants";
import { preloadTypeScript } from "../sandbox/type-checker";
import type { SyntaxThemeId } from "../components/Editor/themes";
import {
  SYNTAX_THEMES,
  getUiModeForSyntax,
  DEFAULT_DARK_SYNTAX,
  DEFAULT_LIGHT_SYNTAX,
} from "../components/Editor/themes";
import { decodeFromHash } from "../utils/share";
import { trackEvent } from "../utils/analytics";
import { readLocal, writeLocal } from "../utils/storage";
import { parsePlayground, playgroundPath, playgroundText } from "../utils/playground";
import type { AppMode, Language, PlaygroundState } from "../utils/playground";

export type { Language, AppMode } from "../utils/playground";
export type Theme = "light" | "dark";
export type WebTab = "html" | "css" | "js";

// Check URL hash for shared code (takes priority over localStorage)
const sharedState = decodeFromHash(window.location.hash);
const isEmbed = window.location.pathname.replace(/\/+$/, "") === "/embed";

const getStoredCode = (lang: Language): string => {
  const stored = isEmbed ? null : readLocal(`jspark:code:${lang}`);
  return stored ?? (lang === "javascript" ? DEFAULT_JS_CODE : DEFAULT_TS_CODE);
};

const getStoredLanguage = (): Language => {
  if (sharedState) return sharedState.language;
  const stored = isEmbed ? null : readLocal("jspark:language");
  return stored === "typescript" ? "typescript" : "javascript";
};

const validSyntaxIds = new Set(SYNTAX_THEMES.map((t) => t.id));
const getStoredSyntaxTheme = (): SyntaxThemeId => {
  const stored = readLocal("jspark:syntaxTheme");
  if (stored && validSyntaxIds.has(stored as SyntaxThemeId)) return stored as SyntaxThemeId;
  return "one-dark";
};

export const language = signal<Language>(getStoredLanguage());
export const code = signal<string>(
  sharedState && (sharedState.mode === "js" || !sharedState.mode)
    ? sharedState.code
    : getStoredCode(getStoredLanguage()),
);
export const draftStorageUnavailable = signal(false);
export const syntaxTheme = signal<SyntaxThemeId>(getStoredSyntaxTheme());

// Keep embed hashes so reload and back/forward can reopen the selected example.
if (sharedState && !isEmbed) {
  history.replaceState(null, "", playgroundPath(sharedState) + window.location.search);
}

/** Site UI theme (light/dark) derived from syntax theme so they stay in sync. */
export const theme = computed<Theme>(() => getUiModeForSyntax(syntaxTheme.value));

export const fileExtension = computed(() =>
  language.value === "typescript" ? ".ts" : ".js"
);

export function setLanguage(lang: Language) {
  if (lang === language.value) return;
  trackEvent("language_switch", { language: lang });
  // Save current code for current language
  if (!isEmbed) writeLocal(`jspark:code:${language.value}`, code.value);
  // Switch language
  language.value = lang;
  if (!isEmbed) writeLocal("jspark:language", lang);
  // Load code for new language
  code.value = getStoredCode(lang);
  // Pre-load TS compiler so type-checking is fast when the user runs code
  if (lang === "typescript") preloadTypeScript();
}

// If the user starts in TypeScript mode, preload the compiler immediately
if (getStoredLanguage() === "typescript") preloadTypeScript();

export function setCode(newCode: string) {
  code.value = newCode;
}

/** Toggle between light and dark: switches to default syntax theme for the other mode. */
export function toggleTheme() {
  const nextSyntax =
    theme.value === "dark" ? DEFAULT_LIGHT_SYNTAX : DEFAULT_DARK_SYNTAX;
  setSyntaxTheme(nextSyntax);
}

export function setSyntaxTheme(id: SyntaxThemeId) {
  trackEvent("theme_change", { theme: id });
  syntaxTheme.value = id;
  writeLocal("jspark:syntaxTheme", id);
  document.documentElement.setAttribute("data-theme", getUiModeForSyntax(id));
}

// Initialize site theme from stored syntax theme
document.documentElement.setAttribute(
  "data-theme",
  getUiModeForSyntax(getStoredSyntaxTheme())
);

/* ============================================
   Web Mode State
   ============================================ */

const getStoredMode = (): AppMode => {
  if (sharedState) return sharedState.mode ?? "js";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/react") return "react";
  if (path === "/web") return "web";
  return "js";
};

const getStoredWebCode = (tab: WebTab): string => {
  if (sharedState && "mode" in sharedState && sharedState.mode === "web") {
    if (tab === "html") return sharedState.html;
    if (tab === "css") return sharedState.css;
    return sharedState.webJs;
  }
  const stored = isEmbed ? null : readLocal(`jspark:web:${tab}`);
  if (stored !== null) return stored;
  if (tab === "html") return DEFAULT_WEB_HTML;
  if (tab === "css") return DEFAULT_WEB_CSS;
  return DEFAULT_WEB_JS;
};

export const mode = signal<AppMode>(getStoredMode());
export const webHtml = signal<string>(getStoredWebCode("html"));
export const webCss = signal<string>(getStoredWebCode("css"));
export const webJs = signal<string>(getStoredWebCode("js"));
export const webActiveTab = signal<WebTab>("html");

const getStoredReactCode = (): string => {
  if (sharedState?.mode === "react") return sharedState.code;
  const stored = isEmbed ? null : readLocal("jspark:react:code");
  return stored ?? DEFAULT_REACT_CODE;
};

const getStoredReactCss = (): string => {
  if (sharedState?.mode === "react") return sharedState.css;
  const stored = isEmbed ? null : readLocal("jspark:react:css");
  return stored ?? DEFAULT_REACT_CSS;
};

export const reactCode = signal<string>(getStoredReactCode());
export const reactCss = signal<string>(getStoredReactCss());
export const embedVersion = signal(0);

export function setReactCode(newCode: string) {
  reactCode.value = newCode;
}

export function setReactCss(newCss: string) {
  reactCss.value = newCss;
}

export function setMode(m: AppMode) {
  saveDraft();
  trackEvent("mode_switch", { mode: m });
  mode.value = m;
  if (!isEmbed) writeLocal("jspark:mode", m);
}

export function setWebCode(tab: WebTab, newCode: string) {
  if (tab === "html") webHtml.value = newCode;
  else if (tab === "css") webCss.value = newCode;
  else webJs.value = newCode;
}

export function setWebActiveTab(tab: WebTab) {
  webActiveTab.value = tab;
}

export function getWebCode(tab: WebTab): string {
  if (tab === "html") return webHtml.value;
  if (tab === "css") return webCss.value;
  return webJs.value;
}

export function capturePlayground(): PlaygroundState {
  if (mode.value === "web") {
    return { mode: "web", language: "javascript", code: "", html: webHtml.value, css: webCss.value, webJs: webJs.value };
  }
  if (mode.value === "react") {
    return { mode: "react", language: "javascript", code: reactCode.value, css: reactCss.value };
  }
  return { mode: "js", language: language.value, code: code.value };
}

/** Flush synchronously before navigation; a debounce must never lose the latest keystrokes. */
export function saveDraft(): boolean {
  if (isEmbed) return true;
  if (mode.value === "web") {
    const writes = [
      writeLocal("jspark:web:html", webHtml.value),
      writeLocal("jspark:web:css", webCss.value),
      writeLocal("jspark:web:js", webJs.value),
    ];
    const saved = writes.every(Boolean);
    draftStorageUnavailable.value = !saved;
    return saved;
  }
  if (mode.value === "react") {
    const writes = [writeLocal("jspark:react:code", reactCode.value), writeLocal("jspark:react:css", reactCss.value)];
    const saved = writes.every(Boolean);
    draftStorageUnavailable.value = !saved;
    return saved;
  }
  const saved = writeLocal(`jspark:code:${language.value}`, code.value);
  draftStorageUnavailable.value = !saved;
  return saved;
}

export const PREVIOUS_PLAYGROUND_KEY = "jspark:previous-playground:v1";

function samePlayground(first: PlaygroundState, second: PlaygroundState): boolean {
  return JSON.stringify(parsePlayground(first, Infinity)) === JSON.stringify(parsePlayground(second, Infinity));
}

/** Assign a validated playground inside the caller's batch, without navigation or storage writes. */
function setPlaygroundState(next: PlaygroundState): void {
  if (next.mode === "web") {
    webHtml.value = next.html;
    webCss.value = next.css;
    webJs.value = next.webJs;
    webActiveTab.value = "html";
  } else if (next.mode === "react") {
    reactCode.value = next.code;
    reactCss.value = next.css;
  } else {
    language.value = next.language;
    code.value = next.code;
    if (next.language === "typescript") preloadTypeScript();
  }
  mode.value = next.mode ?? "js";
}

export function applyPlayground(value: PlaygroundState, allowLargeRecovery = false): void {
  const next = allowLargeRecovery ? parsePlayground(value, Infinity) : parsePlayground(value);
  if (!next) throw new Error("This file does not contain a supported playground.");
  const previous = capturePlayground();
  if (!allowLargeRecovery && playgroundText(previous).trim() && !parsePlayground(previous)) {
    throw new Error("The current playground is too large for draft recovery. Copy its code before opening another playground.");
  }
  if (playgroundText(previous).trim() && !samePlayground(previous, next)) {
    writeLocal(PREVIOUS_PLAYGROUND_KEY, JSON.stringify(previous));
  }
  saveDraft();
  batch(() => {
    setPlaygroundState(next);
    if (next.mode === "js") writeLocal("jspark:language", next.language);
    history.pushState(null, "", playgroundPath(next));
  });
  saveDraft();
}

/** Recovery is not an import: an existing local draft must remain recoverable at its original size. */
export function restorePreviousDraft(): void {
  const previous = parsePlayground(JSON.parse(readLocal(PREVIOUS_PLAYGROUND_KEY) ?? "null"), Infinity);
  if (!previous) throw new Error("The previous draft could not be restored.");
  applyPlayground(previous, true);
}

// Opening a shared link keeps a recovery copy of the existing draft, before autosave runs.
if (sharedState && !isEmbed) {
  const oldDraft: PlaygroundState = sharedState.mode === "web"
    ? { mode: "web", language: "javascript", code: "", html: readLocal("jspark:web:html") ?? "", css: readLocal("jspark:web:css") ?? "", webJs: readLocal("jspark:web:js") ?? "" }
    : sharedState.mode === "react"
      ? { mode: "react", language: "javascript", code: readLocal("jspark:react:code") ?? "", css: readLocal("jspark:react:css") ?? "" }
      : { mode: "js", language: sharedState.language, code: getStoredCode(sharedState.language) };
  if (playgroundText(oldDraft).trim() && !samePlayground(oldDraft, sharedState)) {
    writeLocal(PREVIOUS_PLAYGROUND_KEY, JSON.stringify(oldDraft));
  }
}

window.addEventListener("pagehide", saveDraft);
window.addEventListener("popstate", () => {
  // Embedded examples follow hashchange; the /embed path does not identify their mode.
  if (isEmbed) return;
  saveDraft();
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  mode.value = path === "/react" ? "react" : path === "/web" ? "web" : "js";
});

if (isEmbed) {
  window.addEventListener("hashchange", () => {
    const next = decodeFromHash(window.location.hash);
    if (!next) return;
    batch(() => {
      setPlaygroundState(next);
      ++embedVersion.value;
    });
  });
}
