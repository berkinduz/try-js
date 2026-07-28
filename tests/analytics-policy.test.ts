import test from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_STORAGE_KEYS,
  classifyVisitor,
  isMeaningfulEdit,
  claimSessionEvent,
  claimProInterest,
  claimProLandingView,
  hasSessionEvent,
} from "../src/utils/analytics-policy.ts";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("classifyVisitor marks a first visit without creating an identifier", () => {
  const durableStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();

  assert.equal(classifyVisitor(durableStorage, sessionStorage), "new");
  assert.equal(
    durableStorage.getItem(ANALYTICS_STORAGE_KEYS.returningVisitor),
    "1",
  );
  assert.equal(
    sessionStorage.getItem(ANALYTICS_STORAGE_KEYS.sessionVisitorType),
    "new",
  );
});

test("classifyVisitor keeps a first browser session classified as new", () => {
  const durableStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();

  assert.equal(classifyVisitor(durableStorage, sessionStorage), "new");
  assert.equal(classifyVisitor(durableStorage, sessionStorage), "new");
});

test("classifyVisitor recognizes a returning browser in a later session", () => {
  const durableStorage = new MemoryStorage();
  durableStorage.setItem(ANALYTICS_STORAGE_KEYS.returningVisitor, "1");

  assert.equal(
    classifyVisitor(durableStorage, new MemoryStorage()),
    "returning",
  );
});

test("classifyVisitor degrades safely when storage is unavailable", () => {
  const blockedStorage = {
    getItem(): string | null {
      throw new Error("blocked");
    },
    setItem(): void {
      throw new Error("blocked");
    },
  };

  assert.equal(classifyVisitor(blockedStorage, blockedStorage), "new");
});

test("isMeaningfulEdit ignores no-op and whitespace-only changes", () => {
  assert.equal(isMeaningfulEdit("const answer = 42;", "const answer = 42;"), false);
  assert.equal(isMeaningfulEdit("", "   \n"), false);
  assert.equal(isMeaningfulEdit("  const answer = 42;  ", "const answer = 42;"), false);
});

test("isMeaningfulEdit accepts user changes to non-whitespace content", () => {
  assert.equal(isMeaningfulEdit("const answer = 42;", "const answer = 43;"), true);
  assert.equal(isMeaningfulEdit("", "console.log('hello')"), true);
  assert.equal(isMeaningfulEdit("console.log('hello')", ""), true);
});

test("claimSessionEvent allows one event per session key", () => {
  const storage = new MemoryStorage();

  assert.equal(hasSessionEvent(storage, "activation_edit"), false);
  assert.equal(claimSessionEvent(storage, "activation_edit:js"), true);
  assert.equal(claimSessionEvent(storage, "activation_edit:js"), false);
  assert.equal(claimSessionEvent(storage, "activation_edit:web"), true);
  assert.equal(claimSessionEvent(storage, "activation_edit"), true);
  assert.equal(hasSessionEvent(storage, "activation_edit"), true);
});

test("session claims remain visible when storage writes are blocked", () => {
  const readOnlyStorage = {
    getItem(): string | null {
      return null;
    },
    setItem(): void {
      throw new Error("blocked");
    },
  };

  assert.equal(claimSessionEvent(readOnlyStorage, "write_blocked"), true);
  assert.equal(hasSessionEvent(readOnlyStorage, "write_blocked"), true);
  assert.equal(claimSessionEvent(readOnlyStorage, "write_blocked"), false);
});

test("claimProInterest deduplicates each demand signal per tab session", () => {
  const storage = new MemoryStorage();

  assert.equal(
    claimProInterest(storage, "for_teachers_page", "early_access"),
    true,
  );
  assert.equal(
    claimProInterest(storage, "for_teachers_page", "early_access"),
    false,
  );
  assert.equal(claimProInterest(storage, "web_preview", "pricing"), true);
});

test("claimProLandingView provides a session-level conversion denominator", () => {
  const storage = new MemoryStorage();

  assert.equal(claimProLandingView(storage), true);
  assert.equal(claimProLandingView(storage), false);
});
