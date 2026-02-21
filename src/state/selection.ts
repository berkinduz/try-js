import { signal } from "@preact/signals";

export const selectedText = signal<string>("");

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function setSelection(text: string, _coords?: unknown) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    selectedText.value = text;
  }, 80);
}

export function clearSelection() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  selectedText.value = "";
}
