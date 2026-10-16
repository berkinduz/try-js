import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
import { hasImports, rewriteImportsWithMapping } from "./module-imports.ts";
import { syntaxErrorPosition } from "./transpiler.ts";
import type { TranspileResult } from "./transpiler.ts";
import { sourceOffset } from "./source-location.ts";
import type { SourcePosition } from "./source-location.ts";

export interface ExecutionError {
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  errorName?: string;
}

/** Keep the existing REPL evaluation, with the expression's original coordinates. */
function splitLastExpression(code: string): { body: string; expression?: string; line: number; indent: number } {
  const lines = code.split("\n");
  let last = lines.length - 1;
  while (last >= 0) {
    const text = lines[last].trim();
    if (text && !text.startsWith("//") && !text.startsWith("/*")) break;
    last--;
  }
  const unchanged = { body: code, line: 0, indent: 0 };
  if (last < 0) return unchanged;
  const text = lines[last].trim();
  const nonExpressions = [
    "var ", "let ", "const ", "function ", "function*", "class ", "import ", "export ",
    "return ", "throw ", "if ", "if(", "else ", "else{", "for ", "for(", "while ", "while(",
    "do ", "do{", "switch ", "switch(", "try ", "try{", "break", "continue", "debugger",
  ];
  if (nonExpressions.some((prefix) => text.startsWith(prefix)) || text.endsWith("{")) return unchanged;
  const expression = text.replace(/;+$/, "").trim();
  if (!expression || /^[)\]}]/.test(expression)) return unchanged;
  return { body: lines.slice(0, last).join("\n"), expression, line: last + 1, indent: lines[last].indexOf(text) };
}

function positionAt(code: string, offset: number): SourcePosition {
  const before = code.slice(0, offset);
  const newline = before.lastIndexOf("\n");
  return { line: before.split("\n").length, column: offset - newline };
}

/** Compose TS, import rewrites, timing, and REPL wrappers in reverse order.
 * Only our named user-code scripts can supply a navigable location. */
export function prepareExecution(source: string, result: TranspileResult, runId: number) {
  const module = hasImports(result.code);
  const rewritten = module ? rewriteImportsWithMapping(result.code) : { code: result.code, changes: [] };
  const split = splitLastExpression(rewritten.code);
  const scriptName = `tryjs-run-${runId}.js`;
  const expressionName = `tryjs-run-${runId}-expression.js`;
  const resultPrefix = "var __jspark_result = ";
  const expression = split.expression === undefined ? undefined :
    "\n".repeat(split.line - 1) + " ".repeat(split.indent) + split.expression + `\n//# sourceURL=${expressionName}`;
  const execBlock = expression === undefined ? rewritten.code : module
    ? `${split.body}\n${resultPrefix}${split.expression};`
    : `${split.body}\n${resultPrefix}eval(${JSON.stringify(expression)});`;
  const resultBlock = expression === undefined ? "" : `
if (typeof __jspark_result !== "undefined") {
  parent.postMessage({ source: "jspark", type: "result", value: window.__jspark_serialize(__jspark_result, 0) }, "*");
}`;
  const code = "var __startTime = performance.now();\n" + execBlock +
    "\nvar __endTime = performance.now();\n" + resultBlock + (module ?
      '\nparent.postMessage({ source: "jspark", type: "done", executionTime: __endTime - __startTime }, "*");' : "") +
    `\n//# sourceURL=${scriptName}`;
  const tracer = result.sourceMap ? new TraceMap({ ...result.sourceMap, version: 3 }) : null;

  function originalPosition(name: string, line: number, column: number): SourcePosition | undefined {
    let position = { line, column };
    if (name === scriptName) {
      position.line--; // timing prefix
      if (split.expression !== undefined && position.line >= split.line) {
        // The eval wrapper and the generated result/timing code are not user code.
        if (!module || position.line !== split.line || column <= resultPrefix.length) return;
        position.column -= resultPrefix.length - split.indent;
      }
    } else if (name !== expressionName || module || split.expression === undefined || line !== split.line) {
      return;
    }
    let offset = sourceOffset(rewritten.code, position);
    if (offset === null) return;
    // Import edits contain no newlines, but may change columns multiple times on one line.
    let delta = 0;
    for (const change of rewritten.changes) {
      const from = change.from + delta;
      const to = from + change.replacement.length;
      if (offset < from) break;
      if (offset < to) return; // generated package URLs have no exact source column
      delta += change.replacement.length - (change.to - change.from);
    }
    offset -= delta;
    position = positionAt(result.code, offset);
    if (tracer) {
      const original = originalPositionFor(tracer, { line: position.line, column: position.column - 1 });
      if (original.line === null || original.column === null) return;
      position = { line: original.line, column: original.column + 1 };
    }
    return sourceOffset(source, position) === null ? undefined : position;
  }

  function locate(error: ExecutionError): SourcePosition | undefined {
    // Use stack frames before ErrorEvent coordinates. Some browsers report the
    // enclosing eval call's column in ErrorEvent instead of the thrown expression.
    if (typeof error.stack === "string") {
      const pattern = new RegExp(`(?:^|[\\s(@])(${scriptName.replace(/\./g, "\\.")}|${expressionName.replace(/\./g, "\\.")}):(\\d+):(\\d+)(?=[\\s)]|$)`, "g");
      for (const frame of error.stack.split("\n")) {
        if (!/^\s*at\s|@/.test(frame)) continue;
        for (const match of frame.matchAll(pattern)) {
          const position = originalPosition(match[1], Number(match[2]), Number(match[3]));
          if (position) return position;
        }
      }
    }
    if (error.filename === scriptName || error.filename === expressionName) {
      const position = originalPosition(error.filename, error.lineno!, error.colno!);
      if (position) return position;
    }
    if (error.errorName === "SyntaxError") return syntaxErrorPosition(source);
  }

  return { code, module, locate };
}

/** Load the module from its own script, so HTML escaping and bootstrap lines never
 * change user coordinates. Catch import/TLA failures as well as ordinary errors. */
export function moduleLoader(code: string): string {
  return `
var __jspark_moduleUrl = URL.createObjectURL(new Blob([${JSON.stringify(code)}], { type: "text/javascript" }));
import(__jspark_moduleUrl).catch(function(err) {
  parent.postMessage({ source: "jspark", type: "error", errorType: "error", errorName: err && err.name,
    message: err && err.message ? err.message : String(err), stack: err && err.stack }, "*");
  parent.postMessage({ source: "jspark", type: "done", executionTime: 0 }, "*");
}).finally(function() { URL.revokeObjectURL(__jspark_moduleUrl); });
`;
}
