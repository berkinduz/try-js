import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { PREVIEW_CONSOLE_FORMATTER } from "../src/sandbox/preview-console-formatter.ts";

const previewBridges = [
  ["Web preview", "src/components/WebPreview/WebPreview.tsx", "tryjs-web"],
  ["React preview", "src/components/ReactPreview/ReactPreview.tsx", "tryjs-react"],
] as const;

function readBootstrap(path: string): string {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const match = source.match(/const CONSOLE_BOOTSTRAP = `([\s\S]*?)`;\n/);
  assert.ok(match, `Could not find CONSOLE_BOOTSTRAP in ${path}`);
  return match[1]
    .replace("${PREVIEW_CONSOLE_FORMATTER}", PREVIEW_CONSOLE_FORMATTER)
    .replace(/__TRYJS_GENERATION__/g, "1");
}

function captureConsoleArgs(
  bootstrap: string,
  source: string,
  expression: string,
): string[] {
  const messages: unknown[] = [];
  const context = vm.createContext({
    console: {
      log() {},
      warn() {},
      error() {},
      info() {},
    },
    parent: {
      postMessage(message: unknown) {
        messages.push(message);
      },
    },
    setTimeout() {},
    window: { addEventListener() {} },
  });

  vm.runInContext(bootstrap, context);
  vm.runInContext(expression, context);

  const message = messages.find(
    (candidate) =>
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as { source?: string }).source === source &&
      (candidate as { type?: string }).type === "console",
  ) as { args?: string[] } | undefined;

  assert.ok(message, `No console message received from ${source}`);
  return Array.from(message?.args ?? []);
}

for (const [name, path, source] of previewBridges) {
  test(`${name} preserves existing JSON formatting for ordinary object arguments`, () => {
    const args = captureConsoleArgs(
      readBootstrap(path),
      source,
      `console.log(
        { plain: { ok: true } },
        new Date("2020-01-02T03:04:05.000Z"),
        { toJSON: function() { return { custom: "value" }; } },
        new Map([
          ["date", new Date("2020-01-02T03:04:05.000Z")],
          ["custom", { toJSON: function() { return { nested: true }; } }]
        ])
      )`,
    );

    assert.deepEqual(args, [
      '{\n  "plain": {\n    "ok": true\n  }\n}',
      '"2020-01-02T03:04:05.000Z"',
      '{\n  "custom": "value"\n}',
      'Map(2) { "date" => "2020-01-02T03:04:05.000Z", "custom" => { "nested": true } }',
    ]);
  });

  test(`${name} preserves Map and Set type, size, entries, and multiple arguments`, () => {
    const args = captureConsoleArgs(
      readBootstrap(path),
      source,
      `console.log(
        "collections",
        new Map([
          ["name", "karan dangol"],
          [42, { active: true, profile: { role: "teacher" } }]
        ]),
        new Set(["alpha", 7, { nested: { ok: true } }]),
        new Map(),
        new Set()
      )`,
    );

    assert.deepEqual(args, [
      "collections",
      'Map(2) { "name" => "karan dangol", 42 => { "active": true, "profile": { "role": "teacher" } } }',
      'Set(3) { "alpha", 7, { "nested": { "ok": true } } }',
      "Map(0) {}",
      "Set(0) {}",
    ]);
  });

  test(`${name} formats nested collections safely at circular and depth boundaries`, () => {
    const args = captureConsoleArgs(
      readBootstrap(path),
      source,
      `var circular = new Map();
       circular.set("self", circular);
       var deep = new Set([{ one: { two: { three: { four: true } } } }]);
       console.log(circular, new Map([["nested", new Set([new Map([["ok", true]])])]]), deep)`,
    );

    assert.deepEqual(args, [
      'Map(1) { "self" => [Circular] }',
      'Map(1) { "nested" => Set(1) { Map(1) { "ok" => true } } }',
      'Set(1) { { "one": { "two": { "three": [Max Depth] } } } }',
    ]);
  });

  test(`${name} bounds recursive toJSON chains inside collections`, () => {
    const args = captureConsoleArgs(
      readBootstrap(path),
      source,
      `function endless() { return { toJSON: endless }; }
       console.log(new Map([
         ["finite", { toJSON: function() { return { done: true }; } }],
         ["unbounded", endless()]
       ]))`,
    );

    assert.deepEqual(args, [
      'Map(2) { "finite" => { "done": true }, "unbounded" => [Max Depth] }',
    ]);
  });
}
