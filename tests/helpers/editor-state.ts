import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import { signal, computed, batch } from "@preact/signals";
import * as constants from "../../src/utils/constants.ts";
import * as sharing from "../../src/utils/share.ts";
import * as playground from "../../src/utils/playground.ts";
import * as library from "../../src/utils/library.ts";

/** Run the real state module with only browser APIs and unrelated visual services substituted. */
export function editorState(hash = "", pathname = "/", initial: [string, string][] = [], sessionInitial: [string, string][] = []) {
  const values = new Map(initial);
  const sessions = new Map(sessionInitial);
  const sessionStorage = { getItem: (key: string) => sessions.get(key) ?? null, setItem: (key: string, value: string) => { sessions.set(key, value); } };
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const exports: Record<string, any> = {};
  const location = { hash, pathname, search: "" };
  const listeners = new Map<string, ((event?: unknown) => void)[]>();
  const modules: Record<string, unknown> = {
    "@preact/signals": { signal, computed, batch }, "../utils/constants": constants,
    "../sandbox/type-checker": { preloadTypeScript() {} },
    "../components/Editor/themes": { SYNTAX_THEMES: [{ id: "one-dark" }], getUiModeForSyntax: () => "dark" },
    "../utils/share": sharing, "../utils/playground": playground, "../utils/library": library,
    "../utils/storage": {
      readSession: sessionStorage.getItem, writeSession: (key: string, value: string) => {
        try { sessionStorage.setItem(key, value); return true; } catch { return false; }
      },
      readLocal: storage.getItem, writeLocal: (key: string, value: string) => {
        try { storage.setItem(key, value); return true; } catch { return false; }
      },
    },
    "../utils/analytics": { trackEvent() {} },
    "../utils/example-context": { clearGalleryExample() {} },
  };
  const history = {
    replaceState(_: unknown, __: string, path: string) { location.pathname = path; location.hash = ""; },
    pushState(_: unknown, __: string, path: string) { location.pathname = path; },
  };
  const browser = { location, localStorage: storage, sessionStorage, addEventListener(type: string, listener: (event?: unknown) => void) {
    listeners.set(type, [...(listeners.get(type) ?? []), listener]);
  } };
  vm.runInNewContext(transform(readFileSync(new URL("../../src/state/editor.ts", import.meta.url), "utf8"), { transforms: ["typescript", "imports"] }).code, {
    exports, require: (id: string) => { assert.ok(id in modules, `Unexpected import: ${id}`); return modules[id]; },
    window: browser, history, localStorage: storage, document: { documentElement: { setAttribute() {} } },
  });
  const dispatch = (type: string, event?: unknown) => { for (const listener of listeners.get(type) ?? []) listener(event); };
  const navigate = (nextHash: string, nextPath = location.pathname) => {
    const previousHash = location.hash;
    location.hash = nextHash;
    location.pathname = nextPath;
    dispatch("popstate");
    if (previousHash !== nextHash) dispatch("hashchange");
  };
  return { editor: exports, values, sessions, storage, browser, location, navigate, dispatch };
}
