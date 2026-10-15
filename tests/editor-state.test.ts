import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import { signal, computed, batch } from "@preact/signals";
import * as constants from "../src/utils/constants.ts";
import * as sharing from "../src/utils/share.ts";
import * as playground from "../src/utils/playground.ts";

/** Run the real state module with only browser APIs and unrelated visual services substituted. */
function editorState(hash = "", pathname = "/", initial: [string, string][] = []) {
  const values = new Map(initial);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const exports: Record<string, any> = {};
  const location = { hash, pathname, search: "" };
  const listeners = new Map<string, (() => void)[]>();
  const modules: Record<string, unknown> = {
    "@preact/signals": { signal, computed, batch }, "../utils/constants": constants,
    "../sandbox/type-checker": { preloadTypeScript() {} },
    "../components/Editor/themes": { SYNTAX_THEMES: [{ id: "one-dark" }], getUiModeForSyntax: () => "dark" },
    "../utils/share": sharing, "../utils/playground": playground,
    "../utils/storage": { readLocal: storage.getItem, writeLocal: (key: string, value: string) => { storage.setItem(key, value); return true; } },
    "../utils/analytics": { trackEvent() {} },
  };
  const history = {
    replaceState(_: unknown, __: string, path: string) { location.pathname = path; location.hash = ""; },
    pushState(_: unknown, __: string, path: string) { location.pathname = path; },
  };
  vm.runInNewContext(transform(readFileSync(new URL("../src/state/editor.ts", import.meta.url), "utf8"), { transforms: ["typescript", "imports"] }).code, {
    exports, require: (id: string) => { assert.ok(id in modules, `Unexpected import: ${id}`); return modules[id]; },
    window: { location, addEventListener(type: string, listener: () => void) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    } }, history, localStorage: storage, document: { documentElement: { setAttribute() {} } },
  });
  const dispatch = (type: string) => { for (const listener of listeners.get(type) ?? []) listener(); };
  const navigate = (nextHash: string, nextPath = location.pathname) => {
    const previousHash = location.hash;
    location.hash = nextHash;
    location.pathname = nextPath;
    dispatch("popstate");
    if (previousHash !== nextHash) dispatch("hashchange");
  };
  return { editor: exports, values, location, navigate, dispatch };
}

test("switching language after opening a shared link preserves edits and the other language draft", () => {
  const hash = sharing.encodeToHash({ code: 'console.log("shared")', language: "javascript" });
  const { editor, values } = editorState(hash, "/", [["jspark:code:typescript", "const saved: number = 123;"]]);
  editor.setCode('console.log("edited")');
  editor.setLanguage("typescript");
  assert.equal(editor.code.value, "const saved: number = 123;");
  editor.setLanguage("javascript");
  assert.equal(editor.code.value, 'console.log("edited")');
  assert.equal(values.get("jspark:code:javascript"), 'console.log("edited")');
});

test("root URL stays in JS mode even when the previous visit used React", () => {
  assert.equal(editorState("", "/", [["jspark:mode", "react"]]).editor.mode.value, "js");
  assert.equal(editorState("", "/react").editor.mode.value, "react");
});

test("React shared links restore component and CSS, and embeds never save over local drafts", () => {
  const hash = sharing.encodeToHash({ mode: "react", code: "export default () => <h1>Hi</h1>", css: "h1{color:red}", language: "javascript" });
  const { editor, location } = editorState(hash);
  assert.equal(editor.mode.value, "react");
  assert.equal(editor.reactCss.value, "h1{color:red}");
  assert.equal(location.pathname, "/react");
  const embedded = editorState(hash, "/embed", [["jspark:react:code", "private draft"]]);
  embedded.editor.saveDraft();
  assert.equal(embedded.values.get("jspark:react:code"), "private draft");
});

test("opening another playground flushes fresh edits and offers the previous draft for recovery", () => {
  const { editor, values, location } = editorState();
  editor.setCode("const fresh = 42;");
  editor.applyPlayground({ mode: "web", language: "javascript", code: "", html: "<h1>Web</h1>", css: "", webJs: "" });
  assert.equal(values.get("jspark:code:javascript"), "const fresh = 42;");
  assert.equal(JSON.parse(values.get(editor.PREVIOUS_PLAYGROUND_KEY)!).code, "const fresh = 42;");
  assert.equal(editor.webHtml.value, "<h1>Web</h1>");
  assert.equal(location.pathname, "/web");
});

test("reopening identical code does not overwrite an earlier recovery draft due to key order", () => {
  const recovery = JSON.stringify({ mode: "js", code: "const original = 1;", language: "javascript" });
  const { editor, values } = editorState("", "/", [["jspark:previous-playground:v1", recovery]]);
  editor.setCode("const same = 42;");
  editor.applyPlayground({ mode: "js", code: "const same = 42;", language: "javascript" });
  assert.equal(values.get(editor.PREVIOUS_PLAYGROUND_KEY), recovery);
});

test("opening a saved playground cannot discard a current draft larger than the recovery limit", () => {
  const { editor } = editorState();
  const large = "x".repeat(500_001);
  editor.setCode(large);
  assert.throws(() => editor.applyPlayground({ mode: "js", code: "const next = 42;", language: "javascript" }), /Copy its code/);
  assert.equal(editor.code.value, large);
});

test("a pre-existing large draft remains recoverable after opening an external shared link", () => {
  const large = "x".repeat(500_001);
  const hash = sharing.encodeToHash({ mode: "js", code: "const shared = 42;", language: "javascript" });
  const { editor } = editorState(hash, "/", [["jspark:code:javascript", large]]);
  editor.restorePreviousDraft();
  assert.equal(editor.code.value, large);
});

test("an embedded share keeps its URL so reload and history can reopen the example", () => {
  const hash = sharing.encodeToHash({ mode: "react", code: "export default () => <h1>Hi</h1>", css: "", language: "javascript" });
  const { editor, location } = editorState(hash, "/embed");
  assert.equal(location.hash, hash);
  assert.equal(location.pathname, "/embed");
  assert.equal(editor.mode.value, "react");
});

test("same-document embed navigation loads every mode and supports back and forward without changing local drafts", () => {
  const states: playground.PlaygroundState[] = [
    { mode: "js", language: "typescript", code: "const first: number = 1;" },
    { mode: "react", language: "javascript", code: "export default () => <h1>Next</h1>", css: "h1{color:green}" },
    { mode: "web", language: "javascript", code: "", html: "<h1>Web</h1>", css: "", webJs: "" },
    { mode: "js", language: "javascript", code: "" },
  ];
  const initial: [string, string][] = [
    ["jspark:code:javascript", "private JS"], ["jspark:code:typescript", "private TS"],
    ["jspark:language", "typescript"], ["jspark:mode", "react"],
    ["jspark:web:html", "private HTML"], ["jspark:web:css", "private CSS"], ["jspark:web:js", "private web JS"],
    ["jspark:react:code", "private React"], ["jspark:react:css", "private React CSS"],
    ["jspark:previous-playground:v1", "private recovery"],
  ];
  const { editor, location, values, navigate, dispatch } = editorState(sharing.encodeToHash(states[0]), "/embed/", initial);
  location.search = "?example=1";
  let revision = editor.embedVersion.value;
  for (const state of [...states.slice(1), states[2], states[3], states[0]]) {
    const hash = sharing.encodeToHash(state);
    navigate(hash);
    assert.deepEqual(JSON.parse(JSON.stringify(editor.capturePlayground())), state);
    assert.equal(editor.embedVersion.value, ++revision, "one fresh editor/sandbox lifetime per navigation");
    assert.equal(location.pathname, "/embed/");
    assert.equal(location.hash, hash);
    assert.equal(location.search, "?example=1");
    editor.saveDraft();
    dispatch("pagehide");
  }
  assert.deepEqual([...values], initial);
});

test("same-mode embed navigation starts a new lifetime even when the code is identical", () => {
  const state = { mode: "react" as const, language: "javascript" as const, code: "export default () => null;", css: "" };
  const { editor, navigate } = editorState(sharing.encodeToHash(state), "/embed");
  navigate(sharing.encodeToHash({ ...state, css: "body{color:red}" }));
  assert.equal(editor.reactCode.value, state.code);
  assert.equal(editor.reactCss.value, "body{color:red}");
  assert.equal(editor.embedVersion.value, 1);
});

test("invalid or empty embed hashes preserve edits, mode and the current sandbox lifetime", () => {
  const state = { mode: "react" as const, language: "javascript" as const, code: "export default () => null;", css: "" };
  const { editor, navigate } = editorState(sharing.encodeToHash(state), "/embed");
  editor.setReactCode("export default () => <h1>Fresh edit</h1>");
  for (const hash of ["#v=999&code=x", "#code=%invalid", "#about", ""]) {
    navigate(hash);
    assert.equal(editor.mode.value, "react");
    assert.equal(editor.reactCode.value, "export default () => <h1>Fresh edit</h1>");
    assert.equal(editor.embedVersion.value, 0);
  }
});

test("regular page history still saves fresh drafts and follows the destination mode", () => {
  const { editor, values, navigate, dispatch } = editorState();
  editor.setCode("const fresh = 42;");
  navigate("", "/react");
  assert.equal(values.get("jspark:code:javascript"), "const fresh = 42;");
  assert.equal(editor.mode.value, "react");
  editor.setReactCode("export default () => <h1>Saved</h1>");
  dispatch("pagehide");
  assert.equal(values.get("jspark:react:code"), "export default () => <h1>Saved</h1>");
  navigate("", "/web");
  assert.equal(editor.mode.value, "web");
  navigate("", "/");
  assert.equal(editor.mode.value, "js");
  assert.equal(editor.code.value, "const fresh = 42;");
});
