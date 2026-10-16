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
import { readLocal, writeLocal, readSession, writeSession } from "../utils/storage";
import { parsePlayground, playgroundPath, playgroundText, playgroundSurface, samePlayground } from "../utils/playground";
import type { AppMode, Language, PlaygroundState, PlaygroundSurface } from "../utils/playground";
import { parseSavedPlayground, readLibrary } from "../utils/library";
import type { SavedPlayground } from "../utils/library";

export type { Language, AppMode } from "../utils/playground";
export type Theme = "light" | "dark";
export type WebTab = "html" | "css" | "js";

// Check URL hash for shared code (takes priority over localStorage)
const sharedState = decodeFromHash(window.location.hash);
const isEmbed = window.location.pathname.replace(/\/+$/, "") === "/embed";
export const ACTIVE_PLAYGROUNDS_KEY = "tryjs:active-playgrounds:v1";
export const SAVED_WORKSPACE_KEY = "tryjs:saved-workspace:v1";
export const PREVIOUS_PLAYGROUND_KEY = "jspark:previous-playground:v1";
const surfaces: PlaygroundSurface[] = ["javascript", "typescript", "web", "react"];
let sharedRecovery: PlaygroundState | null = null;

function readPreviousPlayground(): PlaygroundState | null {
  if (isEmbed) return null;
  try { return parsePlayground(JSON.parse(readLocal(PREVIOUS_PLAYGROUND_KEY) ?? "null"), Infinity); }
  catch { return null; }
}

export const previousPlayground = signal<PlaygroundState | null>(readPreviousPlayground());

interface SavedWorkspace {
  saved: SavedPlayground;
  working: PlaygroundState;
  returnSurface: PlaygroundSurface;
}

function scratchPlayground(surface: PlaygroundSurface): PlaygroundState {
  if (surface === "web") return {
    mode: "web", language: "javascript", code: "",
    html: readLocal("jspark:web:html") ?? DEFAULT_WEB_HTML,
    css: readLocal("jspark:web:css") ?? DEFAULT_WEB_CSS,
    webJs: readLocal("jspark:web:js") ?? DEFAULT_WEB_JS,
  };
  if (surface === "react") return {
    mode: "react", language: "javascript",
    code: readLocal("jspark:react:code") ?? DEFAULT_REACT_CODE,
    css: readLocal("jspark:react:css") ?? DEFAULT_REACT_CSS,
  };
  return { mode: "js", language: surface, code: readLocal(`jspark:code:${surface}`) ?? (surface === "typescript" ? DEFAULT_TS_CODE : DEFAULT_JS_CODE) };
}

function readSavedWorkspace(): SavedWorkspace | null {
  if (isEmbed) return null;
  try {
    const raw = JSON.parse(readSession(SAVED_WORKSPACE_KEY) ?? "null");
    const saved = parseSavedPlayground(raw?.saved);
    const working = parsePlayground(raw?.working, Infinity);
    if (saved && working && playgroundSurface(saved.state) === playgroundSurface(working) && surfaces.includes(raw.returnSurface)) {
      if (sharedState && playgroundSurface(sharedState) === playgroundSurface(working)) {
        // A shared link must never inherit a local record's identity or erase its edits.
        sharedRecovery = working;
        writeSession(SAVED_WORKSPACE_KEY, "null");
        return null;
      }
      return { saved, working, returnSurface: raw.returnSurface };
    }
    // Preserve the current record and edits when upgrading the old per-surface metadata.
    if (raw === null && !sharedState) {
      const path = window.location.pathname.replace(/\/+$/, "");
      const surface = path === "/react" ? "react" : path === "/web" ? "web"
        : readLocal("jspark:language") === "typescript" ? "typescript" : "javascript";
      const previous = JSON.parse(readSession(ACTIVE_PLAYGROUNDS_KEY) ?? "null")?.[surface];
      const entry = previous && readLibrary(window.localStorage).find(item => item.id === previous.id && playgroundSurface(item.state) === surface);
      writeSession(ACTIVE_PLAYGROUNDS_KEY, "{}");
      if (entry && typeof previous.updatedAt === "number") {
        return { saved: { ...entry, updatedAt: previous.updatedAt }, working: scratchPlayground(surface), returnSurface: surface };
      }
    }
  } catch { /* Invalid tab metadata must not affect the normal editor or named saves. */ }
  return null;
}

const savedWorkspace = signal<SavedWorkspace | null>(readSavedWorkspace());

const getStoredCode = (lang: Language): string => {
  const working = savedWorkspace.value?.working;
  if (working && playgroundSurface(working) === lang) return working.code;
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
  saveDraft();
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
  const working = savedWorkspace.value?.working;
  if (working?.mode === "web") return tab === "html" ? working.html : tab === "css" ? working.css : working.webJs;
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
  if (savedWorkspace.value?.working.mode === "react") return savedWorkspace.value.working.code;
  const stored = isEmbed ? null : readLocal("jspark:react:code");
  return stored ?? DEFAULT_REACT_CODE;
};

const getStoredReactCss = (): string => {
  if (sharedState?.mode === "react") return sharedState.css;
  if (savedWorkspace.value?.working.mode === "react") return savedWorkspace.value.working.css;
  const stored = isEmbed ? null : readLocal("jspark:react:css");
  return stored ?? DEFAULT_REACT_CSS;
};

export const reactCode = signal<string>(getStoredReactCode());
export const reactCss = signal<string>(getStoredReactCss());
export const playgroundVersion = signal(0);

export const currentSurface = computed<PlaygroundSurface>(() => mode.value === "js" ? language.value : mode.value);
export const openedSavedPlayground = computed(() => savedWorkspace.value?.saved ?? null);
export const activeSavedPlayground = computed(() => {
  const workspace = savedWorkspace.value;
  return workspace && playgroundSurface(workspace.working) === currentSurface.value ? workspace.saved : null;
});

export function setActiveSavedPlayground(entry: SavedPlayground | null): void {
  if (isEmbed) return;
  const previous = savedWorkspace.value;
  savedWorkspace.value = entry ? {
    saved: entry,
    working: previous && playgroundSurface(entry.state) !== currentSurface.value && playgroundSurface(entry.state) === playgroundSurface(previous.working)
      ? previous.working : capturePlayground(),
    returnSurface: previous?.returnSurface ?? currentSurface.value,
  } : null;
  persistWorkspace();
}

export function captureSavedPlayground(): PlaygroundState | null {
  const workspace = savedWorkspace.value;
  return workspace ? activeSavedPlayground.value ? capturePlayground() : workspace.working : null;
}

function persistWorkspace(): boolean {
  return writeSession(SAVED_WORKSPACE_KEY, JSON.stringify(savedWorkspace.peek()));
}

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
  if (activeSavedPlayground.value) {
    savedWorkspace.value = { ...savedWorkspace.peek()!, working: capturePlayground() };
    const saved = persistWorkspace();
    draftStorageUnavailable.value = !saved;
    return saved;
  }
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

/** Release the named editor without writing its code into any normal draft. */
function releaseSavedWorkspace(): PlaygroundSurface | undefined {
  const workspace = savedWorkspace.value;
  if (!workspace) return;
  const surface = playgroundSurface(workspace.working);
  const previousMode = mode.value;
  const previousLanguage = language.value;
  if (surface === "web" || surface === "react" || surface === previousLanguage) {
    setPlaygroundState(scratchPlayground(surface));
    mode.value = previousMode;
    // JS and TS share one signal; keep the visible language when the saved editor is paused.
    if (surface !== "web" && surface !== "react") language.value = previousLanguage;
  }
  setActiveSavedPlayground(null);
  return workspace.returnSurface;
}

export function openNamedPlayground(entry: SavedPlayground): void {
  if (isEmbed) return;
  if (!saveDraft()) throw new Error("Autosave is unavailable. Download your current playground before opening another one.");
  batch(() => {
    const returnSurface = releaseSavedWorkspace() ?? currentSurface.value;
    savedWorkspace.value = { saved: entry, working: entry.state, returnSurface };
    setPlaygroundState(entry.state);
    if (entry.state.mode === "js") writeLocal("jspark:language", entry.state.language);
    history.pushState(null, "", playgroundPath(entry.state));
    ++playgroundVersion.value;
  });
  saveDraft();
}

export function closeNamedPlayground(): void {
  if (!savedWorkspace.value || isEmbed) return;
  batch(() => {
    const returnSurface = releaseSavedWorkspace()!;
    const previous = scratchPlayground(returnSurface);
    setPlaygroundState(previous);
    if (previous.mode === "js") writeLocal("jspark:language", previous.language);
    history.pushState(null, "", playgroundPath(previous));
    ++playgroundVersion.value;
  });
  saveDraft();
}

export function applyPlayground(value: PlaygroundState, allowLargeRecovery = false): void {
  const next = allowLargeRecovery ? parsePlayground(value, Infinity) : parsePlayground(value);
  if (!next) throw new Error("This file does not contain a supported playground.");
  const workspace = savedWorkspace.value;
  if (workspace && !activeSavedPlayground.value && playgroundSurface(workspace.working) === playgroundSurface(next) &&
    !samePlayground(workspace.working, workspace.saved.state)) {
    throw new Error("Save or close your open playground before replacing its code.");
  }
  const previous = capturePlayground();
  if (!allowLargeRecovery && playgroundText(previous).trim() && !parsePlayground(previous)) {
    throw new Error("The current playground is too large for draft recovery. Copy its code before opening another playground.");
  }
  if (playgroundText(previous).trim() && !samePlayground(previous, next)) {
    writeLocal(PREVIOUS_PLAYGROUND_KEY, JSON.stringify(previous));
    previousPlayground.value = previous;
  }
  saveDraft();
  batch(() => {
    if (workspace && playgroundSurface(workspace.working) === playgroundSurface(next)) releaseSavedWorkspace();
    setPlaygroundState(next);
    if (next.mode === "js") writeLocal("jspark:language", next.language);
    history.pushState(null, "", playgroundPath(next));
    ++playgroundVersion.value;
  });
  saveDraft();
}

/** Start from this mode's original defaults, keeping all named saves and the previous draft. */
export function startNewPlayground(): void {
  const next: PlaygroundState = mode.value === "react"
    ? { mode: "react", language: "javascript", code: DEFAULT_REACT_CODE, css: DEFAULT_REACT_CSS }
    : mode.value === "web"
      ? { mode: "web", language: "javascript", code: "", html: DEFAULT_WEB_HTML, css: DEFAULT_WEB_CSS, webJs: DEFAULT_WEB_JS }
      : { mode: "js", language: language.value, code: language.value === "typescript" ? DEFAULT_TS_CODE : DEFAULT_JS_CODE };
  applyPlayground(next);
}

/** Recovery is not an import: an existing local draft must remain recoverable at its original size. */
export function restorePreviousDraft(): void {
  const previous = parsePlayground(JSON.parse(readLocal(PREVIOUS_PLAYGROUND_KEY) ?? "null"), Infinity);
  if (!previous) throw new Error("The previous draft could not be restored.");
  applyPlayground(previous, true);
}

// Opening a shared link keeps a recovery copy of the existing draft, before autosave runs.
if (sharedState && !isEmbed) {
  const oldDraft: PlaygroundState = sharedRecovery ?? (sharedState.mode === "web"
    ? { mode: "web", language: "javascript", code: "", html: readLocal("jspark:web:html") ?? "", css: readLocal("jspark:web:css") ?? "", webJs: readLocal("jspark:web:js") ?? "" }
    : sharedState.mode === "react"
      ? { mode: "react", language: "javascript", code: readLocal("jspark:react:code") ?? "", css: readLocal("jspark:react:css") ?? "" }
      : { mode: "js", language: sharedState.language, code: getStoredCode(sharedState.language) });
  if (playgroundText(oldDraft).trim() && !samePlayground(oldDraft, sharedState)) {
    writeLocal(PREVIOUS_PLAYGROUND_KEY, JSON.stringify(oldDraft));
    previousPlayground.value = oldDraft;
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
      ++playgroundVersion.value;
    });
  });
}
