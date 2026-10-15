import test from "node:test";
import assert from "node:assert/strict";
import { readLocal, writeLocal } from "../src/utils/storage.ts";

test("blocked storage keeps fresh drafts available in this session without claiming persistence", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); },
  } });
  try {
    assert.equal(writeLocal("test:blocked-draft", "latest edit"), false);
    assert.equal(readLocal("test:blocked-draft"), "latest edit");
    assert.equal(readLocal("test:missing-draft"), null);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("a successful write clears the temporary copy and allows fresh reads from other tabs", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let blocked = true;
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) { if (blocked) throw new Error("full"); values.set(key, value); },
  } });
  try {
    assert.equal(writeLocal("test:recovered-draft", "temporary"), false);
    blocked = false;
    assert.equal(writeLocal("test:recovered-draft", "persisted"), true);
    values.set("test:recovered-draft", "changed in another tab");
    assert.equal(readLocal("test:recovered-draft"), "changed in another tab");
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
