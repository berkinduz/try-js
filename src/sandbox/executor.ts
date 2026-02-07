import { SANDBOX_BOOTSTRAP } from "./sandbox-bootstrap";
import { transpile } from "./transpiler";
import type { Language } from "../state/editor";
import {
  addConsoleEntry,
  addErrorEntry,
  clearConsole,
  isRunning,
  executionTime,
} from "../state/console";
import { EXECUTION_TIMEOUT } from "../utils/constants";

/**
 * REPL-style last expression evaluation.
 *
 * Given transpiled JS code, attempts to detect the last expression statement
 * and return it separately so it can be captured via eval().
 *
 * Returns { body, lastExpr } where body is the code without the last expression,
 * and lastExpr is the expression string (without trailing semicolons), or null
 * if the last statement is not an expression.
 *
 * Declarations (var/let/const/function/class/import/export), control flow
 * (if/for/while/switch/try), and statements ending with blocks are NOT wrapped.
 */
function splitLastExpression(code: string): { body: string; lastExpr: string | null } {
  const lines = code.split("\n");

  // Find the last non-empty, non-comment line
  let lastIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
      lastIdx = i;
      break;
    }
  }

  if (lastIdx === -1) return { body: code, lastExpr: null };

  const lastLine = lines[lastIdx].trim();

  // Skip lines that are clearly not standalone expressions
  const nonExprPrefixes = [
    "var ", "let ", "const ", "function ", "function*",
    "class ", "import ", "export ", "return ", "throw ",
    "if ", "if(", "else ", "else{",
    "for ", "for(", "while ", "while(", "do ", "do{",
    "switch ", "switch(",
    "try ", "try{",
    "break", "continue",
    "debugger",
  ];

  for (const prefix of nonExprPrefixes) {
    if (lastLine.startsWith(prefix)) return { body: code, lastExpr: null };
  }

  // Skip if the line ends with opening brace (block statement)
  if (lastLine.endsWith("{")) return { body: code, lastExpr: null };

  // Strip trailing semicolons to get the expression
  const stripped = lastLine.replace(/;+$/, "").trim();
  if (!stripped) return { body: code, lastExpr: null };

  // Build body = all lines except the last expression line
  const bodyLines = lines.slice(0, lastIdx);
  // Include any trailing empty/comment lines after the expression
  // (but not the expression line itself)
  const body = bodyLines.join("\n");

  return { body, lastExpr: stripped };
}

let currentIframe: HTMLIFrameElement | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let runningIndicatorId: ReturnType<typeof setTimeout> | null = null;
let executionDone = false;

// Delay before showing the "Running..." indicator.
// Most executions finish in <50ms, so this prevents flicker.
const RUNNING_INDICATOR_DELAY = 150;

function cleanup() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (runningIndicatorId) {
    clearTimeout(runningIndicatorId);
    runningIndicatorId = null;
  }
  if (currentIframe) {
    currentIframe.remove();
    currentIframe = null;
  }
}

function handleMessage(event: MessageEvent) {
  const data = event.data;
  if (!data || data.source !== "jspark") return;

  if (data.type === "console") {
    addConsoleEntry(data.method, data.args || []);
  } else if (data.type === "result") {
    addConsoleEntry("result", [data.value]);
  } else if (data.type === "error") {
    addErrorEntry(
      data.errorType || "error",
      data.message,
      data.stack,
      data.lineno,
      data.colno
    );
  } else if (data.type === "done") {
    executionDone = true;
    // Cancel the running indicator if it hasn't fired yet
    if (runningIndicatorId) {
      clearTimeout(runningIndicatorId);
      runningIndicatorId = null;
    }
    isRunning.value = false;
    if (typeof data.executionTime === "number") {
      executionTime.value = data.executionTime;
    }
  }
}

// Set up global listener once
window.addEventListener("message", handleMessage);

export function executeCode(source: string, lang: Language) {
  cleanup();
  clearConsole();
  executionDone = false;
  executionTime.value = null;

  // Don't set isRunning = true immediately.
  // Instead, wait RUNNING_INDICATOR_DELAY ms. If execution finishes
  // before then, we never show "Running..." → no flicker.
  runningIndicatorId = setTimeout(() => {
    if (!executionDone) {
      isRunning.value = true;
    }
    runningIndicatorId = null;
  }, RUNNING_INDICATOR_DELAY);

  // Transpile if needed
  const result = transpile(source, lang);

  if (result.error !== null) {
    addErrorEntry("error", `Transpilation Error: ${result.error}`);
    executionDone = true;
    if (runningIndicatorId) {
      clearTimeout(runningIndicatorId);
      runningIndicatorId = null;
    }
    isRunning.value = false;
    return;
  }

  const jsCode = result.code;
  const { body, lastExpr } = splitLastExpression(jsCode);

  // Build the sandbox HTML.
  // If we detected a last expression, run the body first, then eval the expression
  // to capture its result (REPL-style). Otherwise, just run the full code.
  const execBlock = lastExpr
    ? `${body}
var __jspark_result = eval(${JSON.stringify(lastExpr)});`
    : jsCode;

  const resultBlock = lastExpr
    ? `
if (typeof __jspark_result !== "undefined") {
  parent.postMessage({
    source: "jspark",
    type: "result",
    value: window.__jspark_serialize(__jspark_result, 0)
  }, "*");
}`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
${SANDBOX_BOOTSTRAP}

var __startTime = performance.now();
try {
${execBlock}
} catch(e) {
  parent.postMessage({
    source: "jspark",
    type: "error",
    errorType: "error",
    message: e.message || String(e),
    stack: e.stack
  }, "*");
}
var __endTime = performance.now();
${resultBlock}
parent.postMessage({
  source: "jspark",
  type: "done",
  executionTime: __endTime - __startTime
}, "*");
</script>
</body>
</html>`;

  // Create sandboxed iframe
  const iframe = document.createElement("iframe");
  iframe.sandbox.add("allow-scripts");
  iframe.style.display = "none";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  currentIframe = iframe;

  // Execution timeout
  timeoutId = setTimeout(() => {
    cleanup();
    addErrorEntry(
      "error",
      `Execution timed out after ${EXECUTION_TIMEOUT / 1000}s. Possible infinite loop?`
    );
    executionDone = true;
    isRunning.value = false;
  }, EXECUTION_TIMEOUT);

  // Listen for "done" to clear timeout
  const onDone = (event: MessageEvent) => {
    if (event.data?.source === "jspark" && event.data?.type === "done") {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      window.removeEventListener("message", onDone);
    }
  };
  window.addEventListener("message", onDone);
}

export function stopExecution() {
  cleanup();
  executionDone = true;
  isRunning.value = false;
}
