import test from "node:test";
import assert from "node:assert/strict";
import { formatCode, formatErrorMessage } from "../src/utils/code-format.ts";
import type { FormatLanguage } from "../src/utils/code-format.ts";

const examples: [FormatLanguage, string, string][] = [
  ["javascript", "const answer={value:42};console.log(answer)", "const answer = { value: 42 };\nconsole.log(answer);\n"],
  ["typescript", "const answer: number=42;const cast=<number>answer", "const answer: number = 42;\nconst cast = <number>answer;\n"],
  ["jsx", "export default function App(){return <div className='demo'>{[1,2].map(n=><b key={n}>{n}</b>)}</div>}", "export default function App() {\n  return (\n    <div className=\"demo\">\n      {[1, 2].map((n) => (\n        <b key={n}>{n}</b>\n      ))}\n    </div>\n  );\n}\n"],
  ["html", "<main><h1>Hello</h1><p>World</p></main>", "<main>\n  <h1>Hello</h1>\n  <p>World</p>\n</main>\n"],
  ["css", ".demo{color:red;padding:0  10px}", ".demo {\n  color: red;\n  padding: 0 10px;\n}\n"],
];

for (const [language, source, expected] of examples) {
  test(`formats ${language} with its real parser and is idempotent`, async () => {
    const result = await formatCode(source, language, [0]);
    assert.equal(result.formatted, expected);
    assert.equal((await formatCode(result.formatted, language, [0])).formatted, expected);
  });
}

test("maps cursor and reversed selection endpoints through formatting, including Unicode", async () => {
  const source = 'const greeting="👋";const selected={value:1}';
  const from = source.indexOf("selected");
  const to = from + "selected".length;
  const result = await formatCode(source, "javascript", [to, from, from]);
  assert.equal(result.formatted.slice(result.positions[1], result.positions[0]), "selected");
  assert.equal(result.positions[1], result.positions[2]);
});

test("HTML formats embedded JavaScript and CSS using their required plugins", async () => {
  const result = await formatCode('<style>body{color:red}</style><script>const a={b:1};console.log(a)</script>', "html", [0]);
  assert.match(result.formatted, /body \{\n    color: red;/);
  assert.match(result.formatted, /const a = \{ b: 1 \};\n  console.log\(a\);/);
});

test("invalid JS, TS, JSX, HTML and CSS fail with a bounded, source-free message", async () => {
  for (const [language, source] of [
    ["javascript", "const secretValue = ;"], ["typescript", "const secretValue: = 1;"],
    ["jsx", "export default () => <div>secretValue</span>"],
    ["html", "<div><span>secretValue</div>"], ["css", ".secretValue { color:"],
  ] as const) {
    await assert.rejects(formatCode(source, language, [0]), (cause: unknown) => {
      const message = formatErrorMessage(cause);
      assert.match(message, /Check the syntax/);
      assert.match(message, /has not been changed/);
      assert.doesNotMatch(message, /secretValue/);
      return true;
    });
  }
});
