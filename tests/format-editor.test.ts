import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import { signal, effect } from "@preact/signals";
import * as stateModule from "@codemirror/state";
import * as commands from "@codemirror/commands";
import * as viewModule from "@codemirror/view";
import { formatCode, formatErrorMessage } from "../src/utils/code-format.ts";

function harness(source = "const answer={value:42}", formatter = formatCode) {
  const editor = {
    mode: signal("js"), language: signal("javascript"), code: signal(source), playgroundVersion: signal(0),
    webActiveTab: signal("html"), reactActiveTab: signal("jsx"), reactCode: signal(source), reactCss: signal(""),
    getWebCode: () => "",
  };
  const messages: { message: string; type: string }[] = [];
  const exports: Record<string, any> = {};
  const modules: Record<string, unknown> = {
    "@preact/signals": { signal, effect }, "@codemirror/state": stateModule,
    "@codemirror/commands": commands, "@codemirror/view": viewModule,
    "../../state/editor": editor, "../../utils/code-format": { formatCode: formatter, formatErrorMessage },
    "../Toast/Toast": { showToast: (message: string, type = "success") => messages.push({ message, type }) },
  };
  vm.runInNewContext(transform(readFileSync(new URL("../src/components/Editor/formatting.ts", import.meta.url), "utf8"), {
    transforms: ["typescript", "imports"],
  }).code, { exports, navigator: { platform: "MacIntel" }, requestAnimationFrame(callback: () => void) { callback(); }, require(id: string) {
    assert.ok(id in modules, `Unexpected import: ${id}`); return modules[id];
  } });
  const view: any = {
    state: stateModule.EditorState.create({ doc: source, extensions: [
      commands.history(), exports.formatDocumentIdentity, exports.formatLanguage.of("javascript"),
    ] }),
    dom: { isConnected: true }, scrollDOM: { scrollTop: 180, scrollLeft: 20 }, focus() {},
  };
  view.dispatch = (...specs: any[]) => {
    view.state = specs.length === 1 && specs[0] instanceof stateModule.Transaction
      ? specs[0].state : view.state.update(...specs).state;
    editor.code.value = view.state.doc.toString();
  };
  return { editor, view, messages, formatting: exports };
}

test("formatting is one isolated Undo, preserves selection/scroll, and keeps later typing separate", async () => {
  const { view, formatting } = harness();
  view.dispatch({ changes: { from: view.state.doc.length, insert: ";" }, userEvent: "input.type" });
  const before = view.state.doc.toString();
  const from = before.indexOf("answer");
  view.dispatch({ selection: { anchor: from + 6, head: from } });
  await formatting.formatEditor(view);
  const formatted = view.state.doc.toString();
  assert.equal(formatted.slice(view.state.selection.main.from, view.state.selection.main.to), "answer");
  assert.ok(view.state.selection.main.anchor > view.state.selection.main.head);
  assert.equal(view.scrollDOM.scrollTop, 180);
  assert.equal(view.scrollDOM.scrollLeft, 20);
  view.dispatch({ changes: { from: view.state.doc.length, insert: "// later" }, userEvent: "input.type" });
  assert.equal(commands.undo(view), true);
  assert.equal(view.state.doc.toString(), formatted);
  assert.equal(commands.undo(view), true);
  assert.equal(view.state.doc.toString(), before);
  assert.equal(view.state.selection.main.anchor, from + 6);
  assert.equal(commands.undo(view), true);
  assert.equal(view.state.doc.toString(), "const answer={value:42}");
});

test("already formatted and invalid documents do not add history or mutate the document", async () => {
  for (const source of ["const a = 1;\n", "const a = ;"]) {
    const { view, formatting, messages } = harness(source);
    const state = view.state;
    await formatting.formatEditor(view);
    assert.equal(view.state, state);
    assert.equal(commands.undoDepth(view.state), 0);
    assert.equal(messages[0].type, source.includes("= ;") ? "error" : "success");
    assert.equal(formatting.formatting.value, false);
  }
});

test("late results cannot overwrite edits, selection, a replaced document, or navigation away and back", async () => {
  const changes: ((context: ReturnType<typeof harness>) => void)[] = [
    ({ view }) => view.dispatch({ changes: { from: 0, insert: "// newer\n" }, userEvent: "input.type" }),
    ({ view }) => { view.dispatch({ changes: { from: 0, insert: "x" }, userEvent: "input.type" }); commands.undo(view); },
    ({ view }) => view.dispatch({ selection: { anchor: 5 } }),
    ({ view, formatting }) => { view.state = stateModule.EditorState.create({ doc: view.state.doc, extensions: [
      commands.history(), formatting.formatDocumentIdentity, formatting.formatLanguage.of("javascript"),
    ] }); },
    ({ editor }) => { editor.language.value = "typescript"; editor.language.value = "javascript"; },
    ({ editor }) => { editor.mode.value = "web"; editor.mode.value = "js"; },
    ({ editor }) => { editor.playgroundVersion.value++; },
    ({ view }) => { view.dom.isConnected = false; },
    ({ editor }) => { editor.mode.value = "react"; editor.reactActiveTab.value = "css"; editor.reactActiveTab.value = "jsx"; },
  ];
  for (const change of changes) {
    let finish!: (value: Awaited<ReturnType<typeof formatCode>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof formatCode>>>((resolve) => { finish = resolve; });
    let calls = 0;
    const context = harness(undefined, async () => { calls++; return pending; });
    const request = context.formatting.formatEditor(context.view);
    await context.formatting.formatEditor(context.view); // Repeated shortcuts share the in-flight operation.
    assert.equal(calls, 1);
    change(context);
    const state = context.view.state;
    finish({ formatted: "const answer = { value: 42 };\n", positions: [0, 0] });
    await request;
    assert.equal(context.view.state, state);
    assert.match(context.messages[0].message, /Formatting skipped/);
    assert.equal(context.formatting.formatting.value, false);
  }
});

test("the shortcut handles macOS Option characters, excludes other modifiers and IME input", () => {
  const { formatting } = harness();
  const event = { key: "Ï", code: "KeyF", altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, isComposing: false };
  assert.equal(formatting.isFormatShortcut(event), true);
  for (const changed of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: false }, { altKey: false }, { isComposing: true }, { code: "KeyG", key: "G" }]) {
    assert.equal(formatting.isFormatShortcut({ ...event, ...changed }), false);
  }
});
