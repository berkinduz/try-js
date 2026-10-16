import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { transpile } from "../src/sandbox/transpiler.ts";
import { prepareExecution } from "../src/sandbox/execution-source.ts";
import { isCurrentLocation, sourceLocation, sourceOffset } from "../src/sandbox/source-location.ts";

function prepare(source: string, language: "javascript" | "typescript" = "javascript", id = 7) {
  const result = transpile(source, language);
  assert.equal(result.error, null);
  if (result.error !== null) throw new Error(result.error);
  return prepareExecution(source, result, id);
}

function run(source: string, language: "javascript" | "typescript" = "javascript") {
  const execution = prepare(source, language);
  const output: unknown[] = [];
  const context = vm.createContext({
    code: execution.code, performance: { now: () => 0 },
    window: { __jspark_serialize: (value: unknown) => value },
    parent: { postMessage: (entry: unknown) => output.push(entry) },
  });
  let location;
  try { vm.runInContext("eval(code)", context); }
  catch (error) { location = execution.locate(error as Error); }
  return { location, output: JSON.parse(JSON.stringify(output)) };
}

function atToken(source: string, token: string, language: "javascript" | "typescript" = "javascript") {
  const execution = prepare(source, language);
  const offset = execution.code.indexOf(token);
  assert.notEqual(offset, -1);
  const before = execution.code.slice(0, offset);
  const line = before.split("\n").length;
  const column = offset - before.lastIndexOf("\n");
  return execution.locate({ stack: `Error: test\n    at tryjs-run-7.js:${line}:${column}` });
}

test("eval runtime frames map timing and nested function calls back to the source", () => {
  const source = "const first = 1;\nfunction fail() {\n  missing(first);\n}\nfail();";
  assert.deepEqual(run(source).location, { line: 3, column: 3 });
});

test("last expression errors keep their line, indentation and lexical scope", () => {
  assert.deepEqual(run("const first = 1;\n\n   missing(first);\n// trailing comment\n").location, { line: 3, column: 4 });
  assert.deepEqual(run("const first = 2;\nfirst + 3;").output, [{ source: "jspark", type: "result", value: 5 }]);
});

test("multiline IIFEs and arrays still evaluate without splitting a continuation", () => {
  assert.equal(run("(() => {\n  return 2;\n})();").location, undefined);
  assert.equal(run("[\n  1, 2\n].map(x => x * 2);").location, undefined);
});

test("TS column maps account for erased types on the same line", () => {
  const source = "const first: number = 1; missing(first);";
  assert.deepEqual(run(source, "typescript").location, { line: 1, column: source.indexOf("missing") + 1 });
});

test("TS generated enum code does not shift a later error column", () => {
  const source = "enum Choice { One, Two }; missing(Choice.One);";
  assert.deepEqual(run(source, "typescript").location, { line: 1, column: source.indexOf("missing") + 1 });
});

test("last expression after TS removal maps to its original column", () => {
  const source = "const first: number = 1;\n  (first as number) + missing();";
  // V8 reports the start of this binary expression, rather than its missing identifier.
  assert.deepEqual(run(source, "typescript").location, { line: 2, column: 3 });
  const generated = transpile(source, "typescript").code!;
  const column = generated.split("\n")[1].indexOf("missing") + 1;
  assert.deepEqual(prepare(source, "typescript").locate({ stack: `Error\n    at tryjs-run-7-expression.js:2:${column}` }),
    { line: 2, column: source.split("\n")[1].indexOf("missing") + 1 });
});

test("static and dynamic npm rewrites on one line compose with TS and result capture", () => {
  for (const source of [
    'import a from "one"; import b from "@scope/two@1.0.0"; missing(a, b);',
    'const value: number = 1; const pkg = await import("one"); missing(value);',
    'import a from "one";\n  missing(a);',
    'import "one"; const html = "</script>"; missing(html);',
  ]) {
    const line = source.slice(0, source.indexOf("missing")).split("\n").length;
    const column = source.split("\n")[line - 1].indexOf("missing") + 1;
    assert.deepEqual(atToken(source, "missing", "typescript"), { line, column }, source);
  }
});

test("V8 and Firefox async stack frames are mapped, preferring the stack to eval event columns", () => {
  const execution = prepare("setTimeout(() => {\n  missing();\n}, 10);");
  for (const stack of [
    "Error: async\n    at eval (tryjs-run-7.js:3:3)",
    "callback@tryjs-run-7.js:3:3\n@about:srcdoc:120:2",
  ]) assert.deepEqual(execution.locate({ stack, filename: "tryjs-run-7.js", lineno: 1, colno: 1 }), { line: 2, column: 3 });
});

test("an npm stack maps the nearest user call site, and dependency-only stacks have no jump", () => {
  const execution = prepare('import { parse } from "example";\nparse(null);');
  assert.deepEqual(execution.locate({ stack: "Error: package\n    at https://esm.sh/example.js:4:8\n    at tryjs-run-7.js:3:23" }), { line: 2, column: 1 });
  assert.equal(execution.locate({ stack: "Error: package\n    at https://esm.sh/example.js:4:8" }), undefined);
});

test("browser syntax errors can use parser locations without pre-validating valid new JavaScript", () => {
  assert.deepEqual(prepare("const value = ;").locate({ errorName: "SyntaxError" }), { line: 1, column: 15 });
  const result = transpile("const value: = 1;", "typescript");
  assert.notEqual(result.error, null);
  assert.deepEqual(result.error !== null && result.location, { line: 1, column: 14 });
  assert.equal(prepare("JSON.parse('invalid');").locate({ errorName: "SyntaxError" }), undefined);
});

test("generated wrappers, import URLs, unknown scripts and absent coordinates never become links", () => {
  const execution = prepare("const value = 1;\nmissing();");
  for (const error of [
    { stack: "Error\n    at tryjs-run-7.js:3:1" }, // result wrapper
    { stack: "Error\n    at tryjs-run-6-expression.js:2:1" }, // another run
    { stack: "Error\n    at about:srcdoc:2:1" },
    { stack: "Error\n    at tryjs-run-7.js:999:1" },
    { filename: "tryjs-run-7.js", lineno: 0, colno: 0 },
    { filename: "tryjs-run-7.js" },
    {},
  ]) assert.equal(execution.locate(error), undefined);
  const module = prepare('import "one"; missing();');
  assert.equal(module.locate({ stack: "Error\n    at tryjs-run-7.js:2:15" }), undefined);
});

test("coordinates validate UTF-16 columns, CRLF, EOF and range bounds", () => {
  assert.equal(sourceOffset("// 🚀\r\nmissing();", { line: 2, column: 1 }), 7);
  assert.equal(sourceOffset("// 🚀", { line: 1, column: 6 }), 5);
  assert.equal(sourceOffset("x\n", { line: 2, column: 1 }), 2);
  for (const position of [{ line: 0, column: 1 }, { line: 1, column: 0 }, { line: 2, column: 1 }, { line: 1, column: 3 }, { line: 1, column: NaN }]) {
    assert.equal(sourceOffset("x", position), null);
  }
});

test("a source location belongs only to the same code, language and document lifetime", () => {
  const source = { code: "missing();", language: "javascript" as const, version: 3 };
  const location = { source, line: 1, column: 1 };
  assert.equal(isCurrentLocation(location, { ...source }), true);
  for (const current of [null, { ...source, code: "fixed();" }, { ...source, language: "typescript" as const }, { ...source, version: 4 }]) {
    assert.equal(isCurrentLocation(location, current), false);
  }
  assert.equal(isCurrentLocation({ ...location, line: 20 }, source), false);
  assert.equal(sourceLocation(source, { line: 20, column: 1 }), undefined);
  assert.equal(sourceLocation(source), undefined);
});

test("VM-only line separators cannot cause a jump to a different visible editor line", () => {
  for (const separator of ["\r", "\u2028", "\u2029"]) {
    const source = `const value = 1;${separator}missing();\n// a different visible line`;
    assert.equal(run(source).location, undefined);
    assert.equal(sourceLocation({ code: source, language: "javascript", version: 1 }, { line: 2, column: 1 }), undefined);
  }
});
