import test from "node:test";
import assert from "node:assert/strict";
import LZString from "lz-string";
import { decodeFromHash, encodeToHash, generateEmbedCode, shareUrl } from "../src/utils/share.ts";
import { parsePlayground } from "../src/utils/playground.ts";
import type { PlaygroundState } from "../src/utils/playground.ts";

const states: PlaygroundState[] = [
  { mode: "js", code: 'console.log("hello 世界 + & #");', language: "javascript" },
  { mode: "js", code: 'const answer: number = 42;', language: "typescript" },
  { mode: "web", code: "", language: "javascript", html: "<h1>Hi</h1>", css: "", webJs: "console.log(42)" },
  { mode: "react", code: "export default () => <h1>Hello</h1>", language: "javascript", css: "h1{color:red}" },
];

for (const state of states) {
  test(`share round-trip preserves ${state.mode}/${state.language} including empty tabs`, () => {
    assert.deepEqual(decodeFromHash(encodeToHash(state)), state);
    const url = shareUrl(state, "https://tryjs.app");
    assert.equal(new URL(url).pathname, state.mode === "web" ? "/web" : state.mode === "react" ? "/react" : "/");
    assert.match(generateEmbedCode(state), /https:\/\/tryjs.app\/embed#/);
  });
}

test("legacy share URLs and an intentionally empty document still open", () => {
  const compressed = LZString.compressToEncodedURIComponent("const old = 42;");
  assert.deepEqual(decodeFromHash(`#code=${compressed}&lang=ts`), { mode: "js", language: "typescript", code: "const old = 42;" });
  assert.deepEqual(decodeFromHash('#mode=web&html=&css=&wjs='), { mode: "web", code: "", language: "javascript", html: "", css: "", webJs: "" });
  assert.deepEqual(decodeFromHash(encodeToHash({ code: "", language: "javascript" })), { mode: "js", code: "", language: "javascript" });
});

test("unknown share versions, modes, corrupted data and oversized state fail closed", () => {
  assert.equal(decodeFromHash('#v=999&code=x'), null);
  assert.equal(decodeFromHash('#mode=unknown&code=x'), null);
  assert.equal(decodeFromHash('#code=%invalid'), null);
  assert.equal(parsePlayground({ mode: "react", code: "x", css: 42 }), null);
  assert.equal(parsePlayground({ code: "x".repeat(500_001), language: "javascript" }), null);
});
