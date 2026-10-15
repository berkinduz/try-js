import test from "node:test";
import assert from "node:assert/strict";
import { exportBackup, LIBRARY_KEY, mergePlaygrounds, newSavedPlayground, parseBackup, readLibrary, writeLibrary } from "../src/utils/library.ts";

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
const snapshot = { mode: "react" as const, code: "export default () => <h1>Hi</h1>", language: "javascript" as const, css: "h1{color:blue}" };

test("saved React playgrounds survive reload and export/import without losing CSS", () => {
  const storage = memoryStorage();
  const entry = newSavedPlayground("My counter", snapshot);
  writeLibrary(storage, [entry]);
  assert.deepEqual(readLibrary(storage), [entry]);
  assert.deepEqual(parseBackup(exportBackup(readLibrary(storage))), [entry]);
});

test("backup imports add copies instead of overwriting an existing saved ID", () => {
  const original = newSavedPlayground("Original", snapshot);
  const merged = mergePlaygrounds([original], [{ ...original, name: "Imported", state: { ...snapshot, css: "" } }]);
  assert.equal(merged.length, 2);
  assert.notEqual(merged[0].id, original.id);
  assert.deepEqual(merged[1], original);
});

test("malformed backups and unsupported versions cannot replace existing work", () => {
  const storage = memoryStorage();
  const original = newSavedPlayground("Keep me", snapshot);
  writeLibrary(storage, [original]);
  assert.throws(() => parseBackup('{"format":"tryjs-playgrounds","version":2,"playgrounds":[]}'), /backup/);
  const invalid = exportBackup([{ ...original, state: { mode: "react", code: "", language: "javascript", css: 42 as unknown as string } }]);
  assert.throws(() => parseBackup(invalid), /invalid/);
  assert.deepEqual(readLibrary(storage), [original]);
  storage.setItem(LIBRARY_KEY, "broken");
  assert.throws(() => readLibrary(storage), /valid JSON/);
  assert.equal(storage.getItem(LIBRARY_KEY), "broken");
});

test("quota failures never report a successful save or corrupt the previous library", () => {
  const original = newSavedPlayground("Keep me", snapshot);
  const oldText = exportBackup([original]);
  const fullStorage = { getItem: () => oldText, setItem() { throw new Error("QuotaExceededError"); } };
  assert.throws(() => writeLibrary(fullStorage, [newSavedPlayground("New", snapshot)]), /storage is full/);
  assert.deepEqual(readLibrary(fullStorage), [original]);
});

test("library size and file count limits reject the whole operation", () => {
  const entries = Array.from({ length: 50 }, (_, index) => newSavedPlayground(`Example ${index}`, snapshot));
  assert.throws(() => mergePlaygrounds(entries, [newSavedPlayground("Too many", snapshot)]), /Nothing was imported/);
  assert.throws(() => parseBackup(" ".repeat(2_000_001)), /too large/);
  const storage = memoryStorage();
  writeLibrary(storage, entries);
  assert.throws(() => writeLibrary(storage, [...entries, newSavedPlayground("Too many", snapshot)]), /50 saved/);
  assert.equal(readLibrary(storage).length, 50);
});

test("Unicode backups use the same byte budget for export and re-import", () => {
  const large = { mode: "js" as const, language: "javascript" as const, code: "界".repeat(300_000) };
  const entries = [newSavedPlayground("一", large), newSavedPlayground("二", large), newSavedPlayground("三", large)];
  assert.throws(() => exportBackup(entries), /full/);
  const text = exportBackup(entries.slice(0, 2));
  assert.deepEqual(parseBackup(text), entries.slice(0, 2));
});
