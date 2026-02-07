import { signal } from "@preact/signals";
import { AUTO_RUN_DELAY, DEFAULT_SPLIT_RATIO } from "../utils/constants";

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`jspark:${key}`);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: unknown) {
  localStorage.setItem(`jspark:${key}`, JSON.stringify(value));
}

export const autoRun = signal<boolean>(loadSetting("autoRun", true));
export const autoRunDelay = signal<number>(loadSetting("autoRunDelay", AUTO_RUN_DELAY));
export const fontSize = signal<number>(loadSetting("fontSize", 14));
export const tabSize = signal<number>(loadSetting("tabSize", 2));
export const wordWrap = signal<boolean>(loadSetting("wordWrap", false));
export const splitRatio = signal<number>(loadSetting("splitRatio", DEFAULT_SPLIT_RATIO));

export function setAutoRun(val: boolean) {
  autoRun.value = val;
  saveSetting("autoRun", val);
}

export function setFontSize(val: number) {
  fontSize.value = val;
  saveSetting("fontSize", val);
}

export function setSplitRatio(val: number) {
  splitRatio.value = val;
  saveSetting("splitRatio", val);
}
