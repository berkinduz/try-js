import { signal, computed } from "@preact/signals";
import { DEFAULT_JS_CODE, DEFAULT_TS_CODE } from "../utils/constants";
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
