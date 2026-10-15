import test from "node:test";
import assert from "node:assert/strict";
import { buildReactDocument } from "../src/sandbox/react-document.ts";
import { moduleSpecifiers } from "../src/sandbox/module-imports.ts";

/** Execute the actual generated loader with network/renderer boundaries replaced, not user code. */
async function preparedImports(metadata: unknown, offline = false) {
  const document = buildReactDocument('import {a} from "example@1.0.0"; import {b} from "example@1.0.0/sub"; export default function App(){return a+b}', "", 1, "");
  const script = document.match(/<script type="module">([\s\S]*?)<\/script>/)![1]
    .replace(/^import[^\n]+\n/gm, "")
    .replace("await import(moduleUrl)", "await readModule(moduleUrl)");
  let blob: Blob;
  let calls = 0;
  const errors: unknown[] = [];
  class PreviewURL extends URL {
    static createObjectURL(value: Blob) { blob = value; return "blob:test"; }
    static revokeObjectURL() {}
  }
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  await new AsyncFunction("React", "createRoot", "fetch", "URL", "document", "window", "console", "readModule", script)(
    { Component: class {}, createElement: () => ({}) },
    () => ({ render() {} }),
    async () => { calls++; if (offline) throw new Error("offline"); return new Response(JSON.stringify(metadata)); },
    PreviewURL, { getElementById: () => ({}) }, {}, { error: (error: unknown) => errors.push(error) },
    async () => ({ default: function App() {} }),
  );
  assert.deepEqual(errors, []);
  assert.equal(calls, 1, "package metadata is shared across subpath imports");
  return moduleSpecifiers(await blob!.text()).map((specifier) => new URL(specifier.value));
}

test("independent packages use cached ordinary builds and keep distinct subpaths", async () => {
  const imports = await preparedImports({});
  assert.deepEqual(imports.map((url) => url.pathname), ["/example@1.0.0", "/example@1.0.0/sub"]);
  assert.ok(imports.every((url) => !url.searchParams.has("external")));
});

test("React-only peers share React without requesting an unnecessary ReactDOM build", async () => {
  const imports = await preparedImports({ peerDependencies: { react: ">=18" } });
  assert.ok(imports.every((url) => url.searchParams.get("external") === "react"));
});

test("transitive dependencies or unavailable metadata keep both framework packages external", async () => {
  for (const imports of [
    await preparedImports({ dependencies: { "some-component": "1.0.0" } }),
    await preparedImports({}, true),
  ]) assert.ok(imports.every((url) => url.searchParams.get("external") === "react,react-dom"));
});
