import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import * as policy from "../src/utils/analytics-policy.ts";

function analytics(hostname = "tryjs.app") {
  const delivered: string[] = [];
  const vercel: string[] = [];
  const listeners = new Map<string, () => void>();
  const deadlines = new Map<number, () => void>();
  let timeoutId = 0;
  const script = {
    getAttribute() { return "tryjs.app,www.tryjs.app"; },
    addEventListener(type: string, callback: () => void) { listeners.set(type, callback); },
    removeEventListener(type: string) { listeners.delete(type); },
  };
  const browser = {
    location: { hostname }, umami: undefined as { track: (name: string) => void | Promise<unknown> } | undefined,
    setTimeout(callback: () => void) { const id = ++timeoutId; deadlines.set(id, callback); return id; },
    clearTimeout(id: number) { deadlines.delete(id); },
    localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
  };
  const exports: Record<string, any> = {};
  const modules: Record<string, unknown> = {
    "@vercel/analytics": { track(name: string) { vercel.push(name); } }, "./analytics-policy": policy,
  };
  vm.runInNewContext(transform(readFileSync(new URL("../src/utils/analytics.ts", import.meta.url), "utf8"), { transforms: ["typescript", "imports"] }).code, {
    exports, window: browser, document: { getElementById: () => script }, require: (id: string) => modules[id],
  });
  return { api: exports, delivered, vercel, browser, listeners, deadlines,
    ready() { browser.umami = { track(name: string) { delivered.push(name); } }; listeners.get("load")?.(); } };
}

test("startup and early events wait for the deferred tracker and are delivered once in order", () => {
  const state = analytics();
  state.api.initializeAnalytics(); state.api.trackEvent("first_meaningful_edit", { surface: "javascript" });
  assert.equal(state.delivered.length, 0);
  assert.equal(state.deadlines.size, 1);
  state.ready(); state.api.trackEvent("playground_saved", { action: "create" });
  assert.deepEqual(state.delivered, ["visitor_classified", "first_meaningful_edit", "playground_saved"]);
  assert.deepEqual(state.vercel, state.delivered);
  assert.equal(state.deadlines.size, 0);
  assert.equal(state.listeners.size, 0);
});

test("blocked tracker has bounded memory and clears listeners after one deadline or error", () => {
  const state = analytics();
  for (let i = 0; i < 100; i++) state.api.trackEvent(`event_${i}`);
  assert.equal(state.deadlines.size, 1);
  state.ready(); assert.equal(state.delivered.length, 50);
  for (const outcome of ["timeout", "error"]) {
    const blocked = analytics(); blocked.api.trackEvent("startup");
    if (outcome === "timeout") [...blocked.deadlines.values()][0]();
    else blocked.listeners.get("error")?.();
    assert.equal(blocked.deadlines.size, 0); assert.equal(blocked.listeners.size, 0);
    blocked.ready(); assert.equal(blocked.delivered.length, 0);
  }
});

test("local and preview checks do not pollute the production Umami report", () => {
  const state = analytics("localhost");
  state.ready(); state.api.trackEvent("playground_saved");
  assert.equal(state.delivered.length, 0);
  assert.equal(state.deadlines.size, 0);
});

test("synchronous and asynchronous tracker failures never interrupt editing", async () => {
  const state = analytics(); state.ready();
  state.browser.umami!.track = () => { throw new Error("Blocked"); };
  assert.doesNotThrow(() => state.api.trackEvent("playground_saved"));
  state.browser.umami!.track = () => Promise.reject(new Error("Network blocked"));
  state.api.trackEvent("playground_opened");
  await new Promise(resolve => setImmediate(resolve));
});
