import { parsePlayground } from "./playground.ts";
import type { PlaygroundState } from "./playground.ts";

export const LIBRARY_KEY = "tryjs:playgrounds:v1";
export const MAX_SAVED_PLAYGROUNDS = 50;
export const MAX_BACKUP_BYTES = 2_000_000;
type LibraryStorage = Pick<Storage, "getItem" | "setItem">;

export interface SavedPlayground {
  id: string;
  name: string;
  updatedAt: number;
  state: PlaygroundState;
}

export function newSavedPlayground(name: string, state: PlaygroundState): SavedPlayground {
  const parsed = parsePlayground(state);
  if (!parsed) throw new Error("This playground is too large to save. Copy its code before leaving this page.");
  return {
    id: crypto.randomUUID(), name: name.trim().slice(0, 80) || "Untitled playground",
    updatedAt: Date.now(), state: parsed,
  };
}

function validateEntry(value: unknown): SavedPlayground | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Record<string, unknown>;
  const state = parsePlayground(entry.state);
  if (!state || typeof entry.id !== "string" || !entry.id || entry.id.length > 100) return null;
  if (typeof entry.name !== "string" || !entry.name.trim() || entry.name.length > 80) return null;
  if (typeof entry.updatedAt !== "number" || !Number.isFinite(entry.updatedAt) || Math.abs(entry.updatedAt) > 8.64e15) return null;
  return { id: entry.id, name: entry.name.trim(), updatedAt: entry.updatedAt, state };
}

export function parseBackup(text: string): SavedPlayground[] {
  if (text.length > MAX_BACKUP_BYTES || new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error("This backup is too large. Import a file smaller than 2 MB.");
  let value: Record<string, unknown>;
  try { value = JSON.parse(text); }
  catch { throw new Error("This file is not valid JSON."); }
  if (!value || value.format !== "tryjs-playgrounds" || value.version !== 1 || !Array.isArray(value.playgrounds)) {
    throw new Error("Choose a TryJS playground backup (.json).");
  }
  if (value.playgrounds.length > MAX_SAVED_PLAYGROUNDS) throw new Error("A backup can contain up to 50 playgrounds.");
  const entries = value.playgrounds.map(validateEntry);
  if (entries.some((entry) => !entry)) throw new Error("This backup contains an invalid playground. Nothing was imported.");
  const valid = entries as SavedPlayground[];
  if (new Set(valid.map((entry) => entry.id)).size !== valid.length) throw new Error("This backup contains duplicate playground IDs.");
  return valid;
}

export function exportBackup(entries: SavedPlayground[]): string {
  const text = JSON.stringify({ format: "tryjs-playgrounds", version: 1, playgrounds: entries }, null, 2);
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error("Your saved playgrounds are full. Export individual playgrounds or remove an old copy.");
  return text;
}

export function readLibrary(storage: LibraryStorage): SavedPlayground[] {
  const text = storage.getItem(LIBRARY_KEY);
  return text === null ? [] : parseBackup(text);
}

export function writeLibrary(storage: LibraryStorage, entries: SavedPlayground[]): void {
  if (entries.length > MAX_SAVED_PLAYGROUNDS) throw new Error("You have 50 saved playgrounds. Export a backup and remove an old copy to save more.");
  const text = exportBackup(entries);
  parseBackup(text);
  try { storage.setItem(LIBRARY_KEY, text); }
  catch { throw new Error("Browser storage is full or unavailable. Export a JSON backup to keep your work."); }
}

/** Imports add copies; an imported ID can never overwrite an existing saved playground. */
export function mergePlaygrounds(current: SavedPlayground[], incoming: SavedPlayground[]): SavedPlayground[] {
  const ids = new Set(current.map((entry) => entry.id));
  const added = incoming.map((entry) => {
    let id = entry.id;
    while (ids.has(id)) id = crypto.randomUUID();
    ids.add(id);
    return { ...entry, id };
  });
  const merged = [...added, ...current];
  if (merged.length > MAX_SAVED_PLAYGROUNDS) throw new Error("Import would exceed 50 saved playgrounds. Nothing was imported.");
  return merged;
}
