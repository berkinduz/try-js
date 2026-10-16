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
  test(`${name} forwards the error's source identity and name for location mapping`, () => {
    const messages: Record<string, unknown>[] = [];
    const listeners = new Map<string, (event: unknown) => void>();
    const context = vm.createContext({
      console: {}, performance: { now: () => 0 },
      parent: { postMessage: (message: Record<string, unknown>) => messages.push(message) },
      window: { addEventListener: (type: string, listener: (event: unknown) => void) => listeners.set(type, listener) },
    });
    vm.runInContext(bootstrap, context);
    vm.runInContext('window.onerror("Uncaught Error: boom", "tryjs-run-7.js", 4, 9, new Error("boom"))', context);
    const error = messages.find(message => message.type === "error")!;
    assert.equal(error.filename, "tryjs-run-7.js");
    assert.equal(error.errorName, "Error");
    assert.equal(error.lineno, 4);
    assert.equal(error.colno, 9);
    assert.match(error.stack as string, /Error: boom/);
    messages.length = 0;
    listeners.get("unhandledrejection")!({ reason: new Error("async") });
    assert.equal(messages[0].errorType, "unhandledrejection");
    assert.equal(messages[0].errorName, "Error");
    assert.match(messages[0].stack as string, /Error: async/);
  });

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
