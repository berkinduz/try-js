import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import { signal, computed } from "@preact/signals";
import * as library from "../src/utils/library.ts";
import * as playground from "../src/utils/playground.ts";
import { editorState } from "./helpers/editor-state.ts";

function workflow(initial: [string, string][] = [], sessionInitial: [string, string][] = []) {
  const state = editorState("", "/", initial, sessionInitial);
  const events: { name: string; props: Record<string, unknown> }[] = [];
  const exports: Record<string, any> = {};
  const modules: Record<string, unknown> = {
    "@preact/signals": { signal, computed }, "./editor": state.editor,
    "../utils/library": library, "../utils/playground": playground,
    "../utils/analytics": { trackEvent(name: string, props: Record<string, unknown>) { events.push({ name, props }); } },
  };
  vm.runInNewContext(transform(readFileSync(new URL("../src/state/playgrounds.ts", import.meta.url), "utf8"), { transforms: ["typescript", "imports"] }).code, {
    exports, window: state.browser, require: (id: string) => { assert.ok(id in modules, `Unexpected import: ${id}`); return modules[id]; },
  });
  return { ...state, library: exports, events };
}

test("named Save updates one record, survives reload and distinguishes edited drafts", () => {
  const state = workflow();
  state.editor.setCode("console.log('one')");
  const first = state.library.savePlaygroundAs("Experiment");
  assert.equal(state.library.hasUnsavedChanges.value, false);
  state.editor.setCode("console.log('two')");
  assert.equal(state.library.hasUnsavedChanges.value, true);
  const second = state.library.updateSavedPlayground();
  assert.equal(first.id, second.id);
  assert.ok(second.updatedAt > first.updatedAt);
  assert.equal(library.readLibrary(state.storage).length, 1);
  assert.equal(state.library.hasUnsavedChanges.value, false);
  state.editor.setCode("console.log('unsaved')"); state.editor.saveDraft();
  const reloaded = workflow([...state.values], [...state.sessions]);
  assert.equal(reloaded.library.activePlayground.value.id, first.id);
  assert.equal(reloaded.library.hasUnsavedChanges.value, true);
  assert.equal(reloaded.editor.code.value, "console.log('unsaved')");
  reloaded.library.updateSavedPlayground();
  assert.equal(library.readLibrary(reloaded.storage)[0].state.code, "console.log('unsaved')");
});

test("renaming preserves dirty code while saving a copy keeps the original record", () => {
  const { editor, library: actions, storage } = workflow();
  editor.setCode("// saved version");
  const first = actions.savePlaygroundAs("Original");
  editor.setCode("// current edit");
  actions.renameSavedPlayground(first.id, "Renamed");
  assert.equal(actions.activePlayground.value.name, "Renamed");
  assert.equal(actions.savedElsewhere.value, false);
  assert.equal(actions.hasUnsavedChanges.value, true);
  assert.equal(library.readLibrary(storage)[0].state.code, "// saved version");
  const copy = actions.savePlaygroundAs("My copy");
  assert.notEqual(copy.id, first.id);
  assert.equal(library.readLibrary(storage).length, 2);
  assert.equal(actions.activePlayground.value.name, "My copy");
  actions.openSavedPlayground(first.id);
  assert.equal(editor.code.value, "// saved version");
  assert.equal(actions.activePlayground.value.name, "Renamed");
});

test("another tab cannot silently overwrite a saved version, including after Rename", () => {
  const { editor, library: actions, storage, dispatch, events } = workflow();
  editor.setCode("// original"); const entry = actions.savePlaygroundAs("Original");
  editor.setCode("// this tab");
  const external = { ...entry, updatedAt: entry.updatedAt + 100, state: { ...entry.state, code: "// other tab" } };
  library.writeLibrary(storage, [external]);
  dispatch("storage", { key: library.LIBRARY_KEY });
  assert.equal(actions.savedElsewhere.value, true);
  assert.throws(() => actions.updateSavedPlayground(), /another tab/);
  actions.renameSavedPlayground(entry.id, "Renamed");
  assert.equal(actions.savedElsewhere.value, true);
  assert.throws(() => actions.updateSavedPlayground(), /another tab/);
  assert.equal(library.readLibrary(storage)[0].state.code, "// other tab");
  assert.equal(events.filter(event => event.name === "playground_saved").length, 1);
  actions.savePlaygroundAs("Safe copy");
  assert.equal(actions.savedElsewhere.value, false);
  assert.equal(library.readLibrary(storage).length, 2);
});

test("corrupt or unavailable storage cannot report a successful save or destroy previous records", () => {
  const state = workflow([[library.LIBRARY_KEY, "broken JSON"]]);
  state.editor.setCode("// keep this code");
  assert.match(state.library.libraryError.value, /could not be read/);
  assert.throws(() => state.library.savePlaygroundAs("Experiment"));
  assert.equal(state.values.get(library.LIBRARY_KEY), "broken JSON");
  assert.equal(state.events.length, 0);
  assert.equal(state.editor.activeSavedPlayground.value, null);
  const blocked = workflow(); blocked.editor.setCode("// keep this too");
  blocked.storage.setItem = () => { throw new Error("Quota exceeded"); };
  assert.throws(() => blocked.library.savePlaygroundAs("Experiment"), /storage is full/);
  assert.equal(blocked.events.length, 0);
  assert.equal(blocked.library.savedPlaygrounds.value.length, 0);
  assert.equal(blocked.editor.code.value, "// keep this too");
});

test("delete and Undo preserve records even if an imported copy reuses the removed ID", () => {
  const { editor, library: actions, storage } = workflow();
  editor.setCode("// original"); const entry = actions.savePlaygroundAs("Original");
  const removed = actions.removeSavedPlayground(entry.id);
  assert.equal(editor.activeSavedPlayground.value, null);
  assert.equal(editor.code.value, "// original");
  actions.importPlaygrounds([entry]);
  const restored = actions.restoreSavedPlayground(removed);
  assert.notEqual(restored.id, entry.id);
  assert.equal(library.readLibrary(storage).length, 2);
  assert.equal(restored.state.code, "// original");
});

test("reopening earlier saved work emits bounded reuse data without names or code", () => {
  const entry = { id: "test", name: "Private name", updatedAt: 1, state: { mode: "js" as const, language: "javascript" as const, code: "// private code" } };
  const { library: actions, events } = workflow([[library.LIBRARY_KEY, library.exportBackup([entry])]]);
  actions.openLibrary(); actions.openSavedPlayground(entry.id);
  assert.equal(events[0].name, "playground_library_opened");
  assert.equal(events[0].props.has_saved_playgrounds, true);
  assert.equal(events[1].name, "playground_opened");
  assert.equal(events[1].props.saved_before_page_load, true);
  assert.deepEqual(Object.keys(events[1].props).sort(), ["saved_before_page_load", "surface"]);
  assert.doesNotMatch(JSON.stringify(events), /Private name|private code/);
});
