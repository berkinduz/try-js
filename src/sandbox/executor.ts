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

let currentIframe: HTMLIFrameElement | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function cleanup() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
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
  } else if (data.type === "error") {
    addErrorEntry(
      data.errorType || "error",
      data.message,
      data.stack,
      data.lineno,
      data.colno
    );
  } else if (data.type === "done") {
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
  isRunning.value = true;
  executionTime.value = null;

  // Transpile if needed
  const result = transpile(source, lang);

  if (result.error !== null) {
    addErrorEntry("error", `Transpilation Error: ${result.error}`);
    isRunning.value = false;
    return;
  }

  const jsCode = result.code;

  // Build the sandbox HTML
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
${SANDBOX_BOOTSTRAP}

var __startTime = performance.now();
try {
${jsCode}
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
  isRunning.value = false;
}
