import test from "node:test";
import assert from "node:assert/strict";
import { hasImports, rewriteImports, transpileJsx, REACT_VERSION } from "../src/sandbox/transpiler.ts";
import { buildReactDocument } from "../src/sandbox/react-document.ts";
import { buildWebDocument } from "../src/sandbox/web-document.ts";

test("versioned packages, scoped subpaths, exports and dynamic imports resolve through esm.sh", () => {
  const source = 'import _ from "lodash@4.17.21";\nexport { x } from "@scope/pkg@1.2.3/path";\nconst z = await import("zod@4.1.0");';
  const rewritten = rewriteImports(source);
  assert.match(rewritten, /https:\/\/esm.sh\/lodash@4.17.21/);
  assert.match(rewritten, /https:\/\/esm.sh\/@scope\/pkg@1.2.3\/path/);
  assert.match(rewritten, /import\("https:\/\/esm.sh\/zod@4.1.0"\)/);
});

test("import rewriting leaves strings, comments, relative paths and URLs intact", () => {
  const source = `const text = "from 'lodash'";\n// import fake from 'fake';\nimport x from "https://example.com/module.js";\nimport y from "./local.js";`;
  assert.equal(rewriteImports(source), source);
  assert.equal(hasImports('const text = "import fake from fake"; // import z from z'), false);
  assert.equal(hasImports('const url = "https://example.com";\nimport x from "zod";'), true);
});

test("top-level await and exports use module execution without confusing async functions", () => {
  assert.equal(hasImports('const n = await Promise.resolve(42); console.log(n);'), true);
  assert.equal(hasImports('export const n = 42;'), true);
  assert.equal(hasImports('async function f() { await Promise.resolve(42); }'), false);
});

test("React JSX keeps normal static imports and a default export", () => {
  const result = transpileJsx('import { z } from "zod"; export default function App(){return <div>{z.string().parse("ok")}</div>}');
  assert.equal(result.error, null);
  assert.match(result.code!, /import.*from "zod"/);
  assert.match(result.code!, /export default function App/);
  assert.doesNotMatch(result.code!, /require\(/);
});

test("React preview uses one pinned runtime and resolves external package imports", () => {
  const rewritten = rewriteImports('import {useState} from "react"; import {z} from "zod@4.1.0";', true);
  assert.match(rewritten, /from "react"/);
  assert.match(rewritten, /esm.sh\/zod@4.1.0\?external=react%2Creact-dom/);
  const document = buildReactDocument('export default function App(){return <div>Hello</div>}', 'body{color:red}', 7, 'var generation=__TRYJS_GENERATION__;');
  assert.ok(document.includes(`https://esm.sh/react@${REACT_VERSION}`));
  assert.match(document, /type="importmap"/);
  assert.match(document, /await import\(moduleUrl\)/);
  assert.match(document, /useEffect/);
  assert.match(document, /var generation=7/);
  assert.doesNotMatch(document, /require\(id\)|__modules/);
});

test("React source cannot terminate the surrounding script or inject an error document", () => {
  const source = 'export default function App(){return <div>{"</script><img src=x>"}</div>}';
  const document = buildReactDocument(source, '', 1, '');
  assert.equal((document.match(/<\/script>/g) ?? []).length, 3);
  assert.ok(document.includes('\\u003c/script'));
  assert.throws(() => rewriteImports('import React from "react@18"', true), /shared runtime/);
});

test("Web previews support module imports while preserving classic inline-handler globals", () => {
  const module = buildWebDocument('<div></div>', '', 'import dayjs from "dayjs@1.11.13"; console.log(dayjs());', 1, '');
  assert.match(module, /<script type="module">import dayjs from "https:\/\/esm.sh\/dayjs@1.11.13"/);
  const classic = buildWebDocument('<button onclick="go()">Go</button>', '', 'function go(){console.log("ok")}', 1, '');
  assert.doesNotMatch(classic, /type="module"/);
});
