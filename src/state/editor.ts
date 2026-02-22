import { signal, computed } from "@preact/signals";
import {
  DEFAULT_JS_CODE,
  DEFAULT_TS_CODE,
  DEFAULT_WEB_HTML,
  DEFAULT_WEB_CSS,
  DEFAULT_WEB_JS,
} from "../utils/constants";
import type { SyntaxThemeId } from "../components/Editor/themes";
import {
  SYNTAX_THEMES,
  getUiModeForSyntax,
  DEFAULT_DARK_SYNTAX,
  DEFAULT_LIGHT_SYNTAX,
} from "../components/Editor/themes";
import { decodeFromHash } from "../utils/share";

export type Language = "javascript" | "typescript";
export type Theme = "light" | "dark";
export type AppMode = "js" | "web";
export type WebTab = "html" | "css" | "js";

// Check URL hash for shared code (takes priority over localStorage)
const sharedState = decodeFromHash(window.location.hash);

const getStoredCode = (lang: Language): string => {
  if (sharedState) return sharedState.code;
  const stored = localStorage.getItem(`jspark:code:${lang}`);
  return stored ?? (lang === "javascript" ? DEFAULT_JS_CODE : DEFAULT_TS_CODE);
};

const getStoredLanguage = (): Language => {
  if (sharedState) return sharedState.language;
  const stored = localStorage.getItem("jspark:language");
  return stored === "typescript" ? "typescript" : "javascript";
};

const validSyntaxIds = new Set(SYNTAX_THEMES.map((t) => t.id));
const getStoredSyntaxTheme = (): SyntaxThemeId => {
  const stored = localStorage.getItem("jspark:syntaxTheme");
  if (stored && validSyntaxIds.has(stored as SyntaxThemeId)) return stored as SyntaxThemeId;
  return "one-dark";
};

export const language = signal<Language>(getStoredLanguage());
export const code = signal<string>(getStoredCode(getStoredLanguage()));
export const syntaxTheme = signal<SyntaxThemeId>(getStoredSyntaxTheme());

// Clean URL hash after loading shared code
if (sharedState) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

/** Site UI theme (light/dark) derived from syntax theme so they stay in sync. */
export const theme = computed<Theme>(() => getUiModeForSyntax(syntaxTheme.value));

export const fileExtension = computed(() =>
  language.value === "typescript" ? ".ts" : ".js"
);

export function setLanguage(lang: Language) {
  // Save current code for current language
  localStorage.setItem(`jspark:code:${language.value}`, code.value);
  // Switch language
  language.value = lang;
  localStorage.setItem("jspark:language", lang);
  // Load code for new language
  code.value = getStoredCode(lang);
}

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
  syntaxTheme.value = id;
  localStorage.setItem("jspark:syntaxTheme", id);
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
  if (sharedState && "mode" in sharedState && sharedState.mode === "web") return "web";
  const stored = localStorage.getItem("jspark:mode");
  return stored === "web" ? "web" : "js";
};

const getStoredWebCode = (tab: WebTab): string => {
  if (sharedState && "mode" in sharedState && sharedState.mode === "web") {
    if (tab === "html") return (sharedState as any).html ?? DEFAULT_WEB_HTML;
    if (tab === "css") return (sharedState as any).css ?? DEFAULT_WEB_CSS;
    return (sharedState as any).webJs ?? DEFAULT_WEB_JS;
  }
  const stored = localStorage.getItem(`jspark:web:${tab}`);
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

export function setMode(m: AppMode) {
  mode.value = m;
  localStorage.setItem("jspark:mode", m);
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
