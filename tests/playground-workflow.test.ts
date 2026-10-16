import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import { signal, computed } from "@preact/signals";
import * as library from "../src/utils/library.ts";
import * as playground from "../src/utils/playground.ts";
import { editorState } from "./helpers/editor-state.ts";

function workflow(initial: [string, string][] = [], sessionInitial: [string, string][] = [], pathname = "/") {
  const state = editorState("", pathname, initial, sessionInitial);
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
  assert.equal(editor.activeSavedPlayground.value.id, entry.id);
  assert.equal(actions.savedElsewhere.value, true);
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

function savedFixtures() {
  return [
    { id: "a", name: "A", updatedAt: 1, state: { mode: "js" as const, language: "javascript" as const, code: "console.log('A')" } },
    { id: "b", name: "B", updatedAt: 2, state: { mode: "js" as const, language: "javascript" as const, code: "console.log('B')" } },
    { id: "typed", name: "Typed", updatedAt: 3, state: { mode: "js" as const, language: "typescript" as const, code: "const typed: number = 7;" } },
    { id: "web", name: "Web", updatedAt: 4, state: { mode: "web" as const, language: "javascript" as const, code: "", html: "<h1>Saved</h1>", css: "h1{color:red}", webJs: "console.log('web')" } },
    { id: "react", name: "React", updatedAt: 5, state: { mode: "react" as const, language: "javascript" as const, code: "export default () => <h1>Saved</h1>", css: "h1{color:blue}" } },
  ];
}

test("A to B to Close restores fresh original code without changing saved copies", () => {
  const fixtures = savedFixtures();
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(fixtures)]]);
  state.editor.setCode("console.log('my current code')");
  state.library.openSavedPlayground("a");
  assert.equal(state.values.get("jspark:code:javascript"), "console.log('my current code')");
  state.library.openSavedPlayground("b");
  assert.equal(state.editor.code.value, "console.log('B')");
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.code.value, "console.log('my current code')");
  assert.equal(state.editor.activeSavedPlayground.value, null);
  assert.deepEqual(library.readLibrary(state.storage), fixtures);
});

test("a clean original editor is still empty after opening and closing saved code", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())]]);
  state.library.openSavedPlayground("a");
  state.library.openSavedPlayground("b");
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.code.value, "");
});

test("opening different saved modes restores every untouched normal draft and the starting surface", () => {
  const drafts: [string, string][] = [
    ["jspark:code:javascript", "// my JS"], ["jspark:code:typescript", "// my TS"],
    ["jspark:web:html", "<h1>My HTML</h1>"], ["jspark:web:css", "/* my CSS */"], ["jspark:web:js", "// my web JS"],
    ["jspark:react:code", "// my React"], ["jspark:react:css", "/* my React CSS */"],
  ];
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ...drafts]);
  for (const id of ["a", "typed", "web", "react", "web", "b"]) {
    state.library.openSavedPlayground(id);
    state.editor.saveDraft();
    for (const [key, value] of drafts) assert.equal(state.values.get(key), value, key);
  }
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.currentSurface.value, "javascript");
  assert.equal(state.editor.code.value, "// my JS");
  state.editor.setMode("web");
  assert.equal(state.editor.webHtml.value, "<h1>My HTML</h1>");
  assert.equal(state.editor.webCss.value, "/* my CSS */");
  assert.equal(state.editor.webJs.value, "// my web JS");
  state.editor.setMode("react");
  assert.equal(state.editor.reactCode.value, "// my React");
  assert.equal(state.editor.reactCss.value, "/* my React CSS */");
});

test("dirty Close and Open ask for a decision without discarding or overwriting code", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ["jspark:code:javascript", "// scratch"]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// experimental changes");
  state.library.requestPlaygroundTransition({ kind: "close" });
  assert.equal(state.library.playgroundDialog.value.kind, "confirm");
  assert.equal(state.editor.code.value, "// experimental changes");
  assert.throws(() => state.library.completePlaygroundTransition({ kind: "close" }), /Save your changes/);
  state.library.playgroundDialog.value = null; // Keep editing.
  state.library.requestPlaygroundTransition({ kind: "open", id: "b" });
  assert.equal(state.library.playgroundDialog.value.next.id, "b");
  assert.equal(state.editor.activeSavedPlayground.value.id, "a");
  assert.throws(() => state.library.openSavedPlayground("b"), /Save your changes/);
  state.library.completePlaygroundTransition({ kind: "close" }, true);
  assert.equal(state.editor.code.value, "// scratch");
  assert.equal(library.readLibrary(state.storage).find(entry => entry.id === "a")!.state.code, "console.log('A')");
});

test("Save and Open updates the current record once and keeps the original return point", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ["jspark:code:javascript", "// scratch"]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// saved changes");
  state.library.requestPlaygroundTransition({ kind: "open", id: "b" });
  state.library.updateSavedPlayground();
  state.library.completePlaygroundTransition(state.library.playgroundDialog.value.next);
  assert.equal(state.editor.activeSavedPlayground.value.id, "b");
  assert.equal(library.readLibrary(state.storage).find(entry => entry.id === "a")!.state.code, "// saved changes");
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.code.value, "// scratch");
  assert.equal(library.readLibrary(state.storage).length, 5);
});

test("dirty saved code and its original return point survive immediate refresh in every mode", () => {
  for (const fixture of savedFixtures()) {
    const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ["jspark:code:javascript", "// scratch"]]);
    state.library.openSavedPlayground(fixture.id);
    if (fixture.state.mode === "react") state.editor.setReactCss("body{color:green}");
    else if (fixture.state.mode === "web") state.editor.webHtml.value = "<h1>Fresh edit</h1>";
    else state.editor.setCode("// fresh edit");
    state.dispatch("pagehide");
    const reloaded = workflow([...state.values], [...state.sessions], state.location.pathname);
    assert.equal(reloaded.editor.activeSavedPlayground.value.id, fixture.id);
    assert.equal(reloaded.library.hasUnsavedChanges.value, true);
    assert.equal(reloaded.values.get("jspark:code:javascript"), "// scratch");
    reloaded.library.completePlaygroundTransition({ kind: "close" }, true);
    assert.equal(reloaded.editor.currentSurface.value, "javascript");
    assert.equal(reloaded.editor.code.value, "// scratch");
  }
});

test("opening another mode cannot lose a paused saved editor's changes", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ["jspark:code:javascript", "// JS scratch"]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// pending A");
  state.editor.setLanguage("typescript");
  state.editor.setCode("// fresh TS scratch");
  state.library.requestPlaygroundTransition({ kind: "open", id: "react" });
  assert.equal(state.library.playgroundDialog.value.kind, "confirm");
  state.library.updateSavedPlayground();
  assert.equal(library.readLibrary(state.storage).find(entry => entry.id === "a")!.state.code, "// pending A");
  state.library.completePlaygroundTransition(state.library.playgroundDialog.value.next);
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.code.value, "// JS scratch");
  state.editor.setLanguage("typescript");
  assert.equal(state.editor.code.value, "// fresh TS scratch");
});

test("a removed open record still keeps code, copy protection and a way back", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())], ["jspark:code:javascript", "// scratch"]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// keep my edit");
  state.library.removeSavedPlayground("a");
  assert.equal(state.editor.activeSavedPlayground.value.name, "A");
  assert.equal(state.library.savedElsewhere.value, true);
  assert.throws(() => state.library.updateSavedPlayground(), /no longer available/);
  const copy = state.library.savePlaygroundAs("A copy");
  assert.equal(copy.state.code, "// keep my edit");
  state.library.completePlaygroundTransition({ kind: "close" });
  assert.equal(state.editor.code.value, "// scratch");
});

test("saving normal code in another mode does not replace a paused editor's unsaved work", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// pending saved edit");
  state.editor.setLanguage("typescript");
  state.editor.setCode("const quick: number = 12;");
  const typed = state.library.savePlaygroundAs("New typed code");
  assert.equal(typed.state.code, "const quick: number = 12;");
  assert.equal(state.editor.openedSavedPlayground.value.id, "a");
  state.editor.setLanguage("javascript");
  assert.equal(state.editor.code.value, "// pending saved edit");
  state.library.requestPlaygroundTransition({ kind: "open", id: typed.id });
  assert.equal(state.library.playgroundDialog.value.kind, "confirm");
});

test("recovering earlier code asks before discarding changes to an open saved playground", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())]]);
  state.editor.setCode("// earlier code");
  state.editor.applyPlayground({ mode: "js", language: "javascript", code: "// example" });
  state.library.openSavedPlayground("a");
  state.editor.setCode("// pending saved edit");
  state.library.requestPlaygroundTransition({ kind: "recover" });
  assert.equal(state.library.playgroundDialog.value.kind, "confirm");
  assert.equal(state.editor.code.value, "// pending saved edit");
  state.library.updateSavedPlayground();
  state.library.completePlaygroundTransition({ kind: "recover" });
  assert.equal(state.editor.code.value, "// earlier code");
  assert.equal(library.readLibrary(state.storage).find(entry => entry.id === "a")!.state.code, "// pending saved edit");
});

test("loading an example cannot overwrite a dirty saved editor paused in another mode", () => {
  const state = workflow([[library.LIBRARY_KEY, library.exportBackup(savedFixtures())]]);
  state.library.openSavedPlayground("a");
  state.editor.setCode("// pending saved edit");
  state.editor.setLanguage("typescript");
  state.editor.setCode("// current typed code");
  assert.throws(() => state.editor.applyPlayground({ mode: "js", language: "javascript", code: "// example" }), /Save or close/);
  assert.equal(state.editor.code.value, "// current typed code");
  state.editor.setLanguage("javascript");
  assert.equal(state.editor.code.value, "// pending saved edit");
});
