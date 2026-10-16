import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { consoleEntryText } from "../src/utils/console-copy.ts";
import type { ConsoleEntry, ErrorEntry } from "../src/state/console.ts";
import type { SerializedValue } from "../src/utils/format.ts";
import { SANDBOX_BOOTSTRAP, SANDBOX_BOOTSTRAP_MODULE } from "../src/sandbox/sandbox-bootstrap.ts";

function row(args: SerializedValue[], method: ConsoleEntry["method"] = "log"): ConsoleEntry {
  return { id: 1, kind: "console", method, args, timestamp: 0 };
}

test("copy preserves raw string whitespace, newlines and multiple arguments in order", () => {
  assert.equal(consoleEntryText(row([{ type: "string", value: '  "hello"\nworld  ' }])), '  "hello"\nworld  ');
  assert.equal(consoleEntryText(row([
    { type: "string", value: "values:" }, { type: "number", value: 42 },
    { type: "boolean", value: false }, { type: "null" }, { type: "undefined" },
    { type: "bigint", value: "9007199254740993" }, { type: "number", value: NaN },
    { type: "number", value: Infinity }, { type: "function", name: "add" },
    { type: "symbol", description: "id" },
  ])), "values: 42 false null undefined 9007199254740993n NaN Infinity [Function: add] Symbol(id)");
  assert.equal(consoleEntryText(row([])), "");
});

test("objects, arrays and tables copy their captured data, including extra table arguments", () => {
  const object = '{\n  "name": "Ada",\n  "active": true\n}';
  const array = '[\n  {\n    "name": "Ada"\n  }\n]';
  assert.equal(consoleEntryText(row([
    { type: "object", value: object, preview: "{ name, active }" },
    { type: "array", value: array, length: 1 },
  ])), `${object} ${array}`);
  assert.equal(consoleEntryText(row([
    { type: "array", value: array, length: 1 },
    { type: "array", value: '["name"]', length: 1 },
  ], "table")), `${array} ["name"]`);
});

test("copy leaves incomplete representations and serialization placeholders intact", () => {
  for (const captured of ["[Object]", "[Array]", '[1, 2, …]', '{"partial":', '"date snapshot"']) {
    assert.equal(consoleEntryText(row([{ type: "object", value: captured, preview: "{}" }])), captured);
  }
  assert.equal(consoleEntryText(row([
    { type: "circular" }, { type: "string", value: "[Max depth]" },
  ])), "[Circular] [Max depth]");
  assert.equal(consoleEntryText(row([
    // A toJSON method can return undefined even though the model expects a string.
    { type: "object", value: undefined as unknown as string, preview: "{ toJSON }" },
  ])), "[Value unavailable]");
});

test("partially captured collections report unavailable entries instead of appearing empty", () => {
  assert.equal(consoleEntryText(row([
    { type: "map", size: 2, entries: [] }, { type: "set", size: 1 },
    { type: "map", size: 0 }, { type: "set", size: 0 },
  ])), "Map(2) { [Entries unavailable] } Set(1) { [Entries unavailable] } Map(0) {} Set(0) {}");
});

test("logged errors include their stack and preserve messages absent from a custom stack", () => {
  assert.equal(consoleEntryText(row([
    { type: "error", message: "boom", stack: "TypeError: boom\n    at user-code:2:3" },
  ], "error")), "TypeError: boom\n    at user-code:2:3");
  assert.equal(consoleEntryText(row([
    { type: "error", message: "boom", stack: "custom trace" },
  ])), "boom\ncustom trace");
});

test("runtime errors include mapped editor coordinates and their original stack", () => {
  const error: ErrorEntry = {
    id: 1, kind: "error", errorType: "error", timestamp: 0,
    message: "Uncaught Error: boom", stack: "Error: boom\n    at generated:12:8",
    lineno: 12, colno: 8,
    location: { line: 2, column: 3, source: { code: "\nthrow new Error('boom');", language: "javascript", version: 0 } },
  };
  assert.equal(consoleEntryText(error), "Uncaught Error: boom (line 2, column 3)\nError: boom\n    at generated:12:8");
  assert.equal(consoleEntryText({ ...error, location: undefined }), "Uncaught Error: boom (line 12, column 8)\nError: boom\n    at generated:12:8");
  assert.equal(consoleEntryText({ ...error, location: undefined, lineno: undefined, colno: undefined, stack: undefined }), "Uncaught Error: boom");
});

for (const [name, bootstrap] of [["eval", SANDBOX_BOOTSTRAP], ["module", SANDBOX_BOOTSTRAP_MODULE]] as const) {
  test(`${name} sandbox snapshots copy nested collections and retain unavailable object/array data`, () => {
    const context = vm.createContext({
      console: {}, parent: { postMessage() {} }, performance: { now: () => 0 },
      window: { addEventListener() {} },
    });
    vm.runInContext(bootstrap, context);
    const serialized = vm.runInContext(`[
      new Map([["name", "Ada"], [42, new Set(["alpha", 7n])]]),
      new Set([new Map([["ok", true]])]),
      (() => { const circular = {}; circular.self = circular; return circular; })(),
      [1n]
    ].map(value => window.__jspark_serialize(value, 0))`, context) as SerializedValue[];
    assert.equal(consoleEntryText(row(serialized)),
      'Map(2) { "name" => "Ada", 42 => Set(2) { "alpha", 7n } } Set(1) { Map(1) { "ok" => true } } [Object] [Array]');
  });
}
