import { signal, computed } from "@preact/signals";
import {
  activeSavedPlayground, applyPlayground, capturePlayground, currentSurface, saveDraft,
  setActiveSavedPlayground,
} from "./editor";
import {
  LIBRARY_KEY, mergePlaygrounds, newSavedPlayground, readLibrary, writeLibrary,
} from "../utils/library";
import type { SavedPlayground } from "../utils/library";
import { playgroundSurface, playgroundText, samePlayground } from "../utils/playground";
import { trackEvent } from "../utils/analytics";

export type PlaygroundDialog =
  | { kind: "browse" }
  | { kind: "save" | "copy" }
  | { kind: "rename"; id: string };

export const playgroundDialog = signal<PlaygroundDialog | null>(null);
export const savedPlaygrounds = signal<SavedPlayground[]>([]);
export const libraryError = signal("");
const pageOpenedAt = Date.now();
const isEmbed = window.location.pathname.replace(/\/+$/, "") === "/embed";

export const activePlayground = computed(() => savedPlaygrounds.value.find(entry =>
  entry.id === activeSavedPlayground.value?.id && playgroundSurface(entry.state) === currentSurface.value) ?? null);
export const savedElsewhere = computed(() => Boolean(activePlayground.value &&
  activePlayground.value.updatedAt !== activeSavedPlayground.value?.updatedAt));
export const hasUnsavedChanges = computed(() => Boolean(activePlayground.value &&
  !samePlayground(capturePlayground(), activePlayground.value.state)));
export const canSavePlayground = computed(() => Boolean(activePlayground.value || playgroundText(capturePlayground()).trim()));

export function refreshPlaygrounds(): boolean {
  if (isEmbed) return false;
  try {
    savedPlaygrounds.value = readLibrary(window.localStorage).sort((a, b) => b.updatedAt - a.updatedAt);
    libraryError.value = "";
    return true;
  } catch {
    libraryError.value = "Saved playgrounds could not be read. Export your current code as a backup before making changes.";
    return false;
  }
}

function changeLibrary(action: (entries: SavedPlayground[]) => SavedPlayground[]): SavedPlayground[] {
  if (isEmbed) throw new Error("Open this playground in TryJS to save it.");
  const next = action(readLibrary(window.localStorage));
  writeLibrary(window.localStorage, next);
  savedPlaygrounds.value = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
  libraryError.value = "";
  return next;
}

function validName(name: string): string {
  const value = name.trim();
  if (!value) throw new Error("Enter a name for this playground.");
  if (value.length > 80) throw new Error("Use a name with 80 characters or fewer.");
  return value;
}

export function openLibrary(): void {
  const readable = refreshPlaygrounds();
  playgroundDialog.value = { kind: "browse" };
  if (readable) trackEvent("playground_library_opened", { has_saved_playgrounds: savedPlaygrounds.value.length > 0 });
}

export function savePlaygroundAs(name: string): SavedPlayground {
  const state = capturePlayground();
  if (!playgroundText(state).trim()) throw new Error("Add some code before saving a playground.");
  const entry = newSavedPlayground(validName(name), state);
  changeLibrary(entries => [entry, ...entries]);
  setActiveSavedPlayground(entry);
  saveDraft();
  trackEvent("playground_saved", { surface: playgroundSurface(state), action: "create" });
  return entry;
}

export function updateSavedPlayground(): SavedPlayground {
  const active = activeSavedPlayground.value;
  if (!active) throw new Error("Save this playground with a name first.");
  const state = capturePlayground();
  let saved!: SavedPlayground;
  changeLibrary(entries => {
    const current = entries.find(entry => entry.id === active.id);
    if (!current || playgroundSurface(current.state) !== playgroundSurface(state)) {
      throw new Error("This saved playground is no longer available. Save a copy to keep your code.");
    }
    if (current.updatedAt !== active.updatedAt) {
      throw new Error("This playground was changed in another tab. Save a copy to keep both versions.");
    }
    saved = { ...newSavedPlayground(current.name, state), id: current.id, updatedAt: Math.max(Date.now(), current.updatedAt + 1) };
    return entries.map(entry => entry.id === current.id ? saved : entry);
  });
  setActiveSavedPlayground(saved);
  saveDraft();
  trackEvent("playground_saved", { surface: playgroundSurface(state), action: "update" });
  return saved;
}

export function openSavedPlayground(id: string): SavedPlayground {
  const entry = readLibrary(window.localStorage).find(item => item.id === id);
  if (!entry) throw new Error("This playground is no longer saved in this browser.");
  applyPlayground(entry.state);
  setActiveSavedPlayground(entry);
  refreshPlaygrounds();
  playgroundDialog.value = null;
  trackEvent("playground_opened", {
    surface: playgroundSurface(entry.state), saved_before_page_load: entry.updatedAt < pageOpenedAt,
  });
  return entry;
}

export function renameSavedPlayground(id: string, name: string): void {
  const value = validName(name);
  const active = activeSavedPlayground.value;
  let renamed!: SavedPlayground;
  let previousVersion = 0;
  changeLibrary(entries => {
    const current = entries.find(entry => entry.id === id);
    if (!current) throw new Error("This playground is no longer saved in this browser.");
    previousVersion = current.updatedAt;
    renamed = { ...current, name: value, updatedAt: Math.max(Date.now(), current.updatedAt + 1) };
    return entries.map(entry => entry.id === id ? renamed : entry);
  });
  // Renaming changes metadata, never the edited code or its conflict baseline.
  if (active?.id === id && active.updatedAt === previousVersion) setActiveSavedPlayground(renamed);
}

export function duplicateSavedPlayground(id: string): SavedPlayground {
  let copy!: SavedPlayground;
  changeLibrary(entries => {
    const original = entries.find(entry => entry.id === id);
    if (!original) throw new Error("This playground is no longer saved in this browser.");
    copy = newSavedPlayground(`${original.name.slice(0, 75)} copy`, original.state);
    return [copy, ...entries];
  });
  return copy;
}

export function removeSavedPlayground(id: string): SavedPlayground {
  let removed!: SavedPlayground;
  changeLibrary(entries => {
    const entry = entries.find(item => item.id === id);
    if (!entry) throw new Error("This playground is no longer saved in this browser.");
    removed = entry;
    return entries.filter(item => item.id !== id);
  });
  if (activeSavedPlayground.value?.id === id) setActiveSavedPlayground(null);
  return removed;
}

export function restoreSavedPlayground(entry: SavedPlayground): SavedPlayground {
  let restored!: SavedPlayground;
  changeLibrary(entries => {
    const merged = mergePlaygrounds(entries, [entry]);
    restored = merged[0];
    return merged;
  });
  return restored;
}

export function importPlaygrounds(incoming: SavedPlayground[]): void {
  changeLibrary(entries => mergePlaygrounds(entries, incoming));
  trackEvent("playground_backup_imported");
}

refreshPlaygrounds();
window.addEventListener("storage", (event: StorageEvent) => {
  if (event.key === LIBRARY_KEY || event.key === null) refreshPlaygrounds();
});
