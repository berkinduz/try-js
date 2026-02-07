import { signal, computed } from "@preact/signals";
import { DEFAULT_JS_CODE, DEFAULT_TS_CODE } from "../utils/constants";

export type Language = "javascript" | "typescript";
export type Theme = "light" | "dark";

const getInitialTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getStoredCode = (lang: Language): string => {
  const stored = localStorage.getItem(`jspark:code:${lang}`);
  return stored ?? (lang === "javascript" ? DEFAULT_JS_CODE : DEFAULT_TS_CODE);
};

const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem("jspark:language");
  return stored === "typescript" ? "typescript" : "javascript";
};

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("jspark:theme");
  if (stored === "light" || stored === "dark") return stored;
  return getInitialTheme();
};

export const language = signal<Language>(getStoredLanguage());
export const code = signal<string>(getStoredCode(getStoredLanguage()));
export const theme = signal<Theme>(getStoredTheme());

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

export function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("jspark:theme", theme.value);
  document.documentElement.setAttribute("data-theme", theme.value);
}

// Initialize theme attribute
document.documentElement.setAttribute("data-theme", getStoredTheme());
