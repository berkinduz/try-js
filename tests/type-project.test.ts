import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { createDefaultMapFromNodeModules } from "@typescript/vfs";
import { acquirePackageTypes, createTypeProject, packageRequests } from "../src/sandbox/type-project.ts";
import { getAllExamples } from "../src/data/examples.ts";

const libraries = createDefaultMapFromNodeModules({}, ts);

test("shipped TypeScript examples work with the playground's actual compiler options", () => {
  for (const example of getAllExamples().filter(item => item.technology === "TypeScript" && !item.code.includes("import "))) {
    const project = createTypeProject(ts, libraries);
    try { assert.deepEqual(diagnostics(project, example.code), [], example.slug); }
    finally { project.environment.languageService.dispose(); }
  }
});

function diagnostics(project: ReturnType<typeof createTypeProject>, source: string) {
  const file = project.update(source);
  return [...project.environment.languageService.getSyntacticDiagnostics(file), ...project.environment.languageService.getSemanticDiagnostics(file)]
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
}

test("official built-in types accept Promise.allSettled and retain real type errors", () => {
  const project = createTypeProject(ts, libraries);
  assert.deepEqual(diagnostics(project, 'Promise.allSettled([Promise.resolve(1)]).then(results => console.log(results[0].status));'), []);
  assert.deepEqual(diagnostics(project, 'const element = document.createElement("button"); element.disabled = true;'), []);
  assert.deepEqual(diagnostics(project, 'const sorted = [3,1,2].toSorted(); const groups = Object.groupBy(sorted, n => n > 1 ? "large" : "small"); console.log(groups);'), []);
  assert.ok(diagnostics(project, 'const count: number = "hello";').some((message) => /not assignable/.test(message)));
  project.environment.languageService.dispose();
});

test("top-level await matches the module-capable playground runtime", () => {
  const project = createTypeProject(ts, libraries);
  assert.deepEqual(diagnostics(project, 'const results = await Promise.allSettled([Promise.resolve(1)]); console.log(results);'), []);
  assert.ok(diagnostics(project, 'const text: string = await Promise.resolve(1);').some((message) => /not assignable/.test(message)));
  project.environment.languageService.dispose();
});

test("official libraries provide semantic completions and documented hover types", () => {
  const project = createTypeProject(ts, libraries);
  const source = 'const results = Promise.allSettled([Promise.resolve(1)]); results.';
  const file = project.update(source);
  const completions = project.environment.languageService.getCompletionsAtPosition(file, source.length, {});
  assert.ok(completions?.entries.some((entry) => entry.name === "then"));
  const info = project.environment.languageService.getQuickInfoAtPosition(file, source.indexOf("results") + 1);
  assert.match(ts.displayPartsToString(info?.displayParts), /Promise<\[PromiseSettledResult<number>\]>/);
  project.environment.languageService.dispose();
});

test("package requests preserve package versions and ignore strings, comments and URLs", () => {
  assert.deepEqual(packageRequests('import {z} from "zod@4.1.0"; import p from "@scope/pkg@2.0.0/path"; const s="from fake";'), [
    { name: "zod", version: "4.1.0" }, { name: "@scope/pkg", version: "2.0.0" },
  ]);
  assert.deepEqual(packageRequests('import x from "https://example.com/x.js"; // import fake from "fake"'), []);
});

test("automatic type acquisition resolves a versioned import and checks its actual exports", async () => {
  const project = createTypeProject(ts, libraries);
  const responses = new Map<string, string>([
    ["https://data.jsdelivr.com/v1/package/npm/zod@3.23.8/flat", JSON.stringify({ files: [{ name: "/index.d.ts" }] })],
    ["https://cdn.jsdelivr.net/npm/zod@3.23.8/package.json", JSON.stringify({ name: "zod", version: "3.23.8", types: "index.d.ts" })],
    ["https://cdn.jsdelivr.net/npm/zod@3.23.8/index.d.ts", "export declare const z: { string(): { parse(input: unknown): string } };"],
  ]);
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    assert.ok(responses.has(url), `Unexpected package request: ${url}`);
    return new Response(responses.get(url), { status: 200 });
  };
  const source = 'import {z} from "zod@3.23.8"; const text: number = z.string().parse("hello");';
  await acquirePackageTypes(ts, project, source, fetcher);
  const errors = diagnostics(project, source);
  assert.ok(errors.some((message) => /not assignable/.test(message)), errors.join("\n"));
  assert.ok(!errors.some((message) => /Cannot find module/.test(message)), errors.join("\n"));
  assert.equal(calls.length, 3);
  project.environment.languageService.dispose();
});

test("package CDN failure leaves built-in checking available", async () => {
  const project = createTypeProject(ts, libraries);
  await assert.rejects(acquirePackageTypes(ts, project, 'import x from "zod";', async () => { throw new Error("offline"); }), /offline/);
  assert.deepEqual(diagnostics(project, 'const n: number = 42; console.log(n);'), []);
  project.environment.languageService.dispose();
});
