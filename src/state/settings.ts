import { signal } from "@preact/signals";
import { AUTO_RUN_DELAY, DEFAULT_SPLIT_RATIO } from "../utils/constants";
import { trackEvent } from "../utils/analytics";
import { readLocal, writeLocal } from "../utils/storage";

export type EditorFontId = "geist-mono" | "fira-code" | "jetbrains-mono";

export const EDITOR_FONTS: { id: EditorFontId; label: string; fontFamily: string }[] = [
  { id: "geist-mono", label: "Geist Mono", fontFamily: '"Geist Mono", monospace' },
  { id: "fira-code", label: "Fira Code", fontFamily: '"Fira Code", monospace' },
  { id: "jetbrains-mono", label: "JetBrains Mono", fontFamily: '"JetBrains Mono", monospace' },
];

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const stored = readLocal(`jspark:${key}`);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: unknown) {
  writeLocal(`jspark:${key}`, JSON.stringify(value));
}

const validEditorFontIds = new Set(EDITOR_FONTS.map((f) => f.id));
function loadEditorFont(): EditorFontId {
  let stored = readLocal("jspark:editorFont");
  try { stored = JSON.parse(stored ?? "null") ?? stored; } catch { /* Legacy unquoted font IDs. */ }
  if (stored && validEditorFontIds.has(stored as EditorFontId)) return stored as EditorFontId;
  return "geist-mono";
}

export const autoRunDelay = signal<number>(loadSetting("autoRunDelay", AUTO_RUN_DELAY));
export const fontSize = signal<number>(loadSetting("fontSize", 14));
export const tabSize = signal<number>(loadSetting("tabSize", 2));
export const wordWrap = signal<boolean>(loadSetting("wordWrap", false));
export const splitRatio = signal<number>(loadSetting("splitRatio", DEFAULT_SPLIT_RATIO));
export const editorFont = signal<EditorFontId>(loadEditorFont());
export const vimEnabled = signal(loadSetting<boolean>("vimEnabled", false) === true);

export function setVimEnabled(enabled: boolean) {
  vimEnabled.value = enabled;
  saveSetting("vimEnabled", enabled);
  trackEvent("editor_keymap_change", { keymap: enabled ? "vim" : "standard" });
}

function applyEditorFontToDocument() {
  const font = EDITOR_FONTS.find((f) => f.id === editorFont.value);
  if (font) document.documentElement.style.setProperty("--editor-font", font.fontFamily);
}
if (typeof document !== "undefined") applyEditorFontToDocument();

export function setFontSize(val: number) {
  fontSize.value = val;
  saveSetting("fontSize", val);
}

export function setSplitRatio(val: number) {
  splitRatio.value = val;
  saveSetting("splitRatio", val);
}

export function setEditorFont(id: EditorFontId) {
  trackEvent("font_change", { font: id });
  editorFont.value = id;
  writeLocal("jspark:editorFont", id);
  const font = EDITOR_FONTS.find((f) => f.id === id);
  if (font) document.documentElement.style.setProperty("--editor-font", font.fontFamily);
}
