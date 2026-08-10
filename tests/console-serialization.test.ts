import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {
  SANDBOX_BOOTSTRAP,
  SANDBOX_BOOTSTRAP_MODULE,
} from "../src/sandbox/sandbox-bootstrap.ts";

function serialize(bootstrap: string, expression: string): unknown {
  const context = vm.createContext({
    console: {
      log() {},
      warn() {},
      error() {},
      info() {},
      table() {},
      clear() {},
      time() {},
      timeEnd() {},
    },
    parent: { postMessage() {} },
    performance: { now: () => 0 },
    window: { addEventListener() {} },
  });

  vm.runInContext(bootstrap, context);
  const result = vm.runInContext(
    `window.__jspark_serialize(${expression}, 0)`,
    context,
  );

  return JSON.parse(JSON.stringify(result));
}

const bootstraps = [
  ["eval sandbox", SANDBOX_BOOTSTRAP],
  ["module sandbox", SANDBOX_BOOTSTRAP_MODULE],
] as const;

for (const [name, bootstrap] of bootstraps) {
  test(`${name} preserves Map and Set entries for console rendering`, () => {
    assert.deepEqual(
      serialize(bootstrap, `new Map([["name", "karan dangol"]])`),
      {
        type: "map",
        size: 1,
        entries: [
          {
            key: { type: "string", value: "name" },
            value: { type: "string", value: "karan dangol" },
          },
        ],
      },
    );

    assert.deepEqual(serialize(bootstrap, `new Set(["alpha", "beta"])`), {
      type: "set",
      size: 2,
      items: [
        { type: "string", value: "alpha" },
        { type: "string", value: "beta" },
      ],
    });
  });
}
