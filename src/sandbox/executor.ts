import { SANDBOX_BOOTSTRAP } from "./sandbox-bootstrap";
import { SANDBOX_BOOTSTRAP_MODULE } from "./sandbox-bootstrap";
import { transpile } from "./transpiler";
import { prepareExecution, moduleLoader } from "./execution-source";
import type { ExecutionError } from "./execution-source";
import type { SourceLocation, SourceSnapshot } from "./source-location";
import { sourceLocation } from "./source-location";
import { playgroundVersion } from "../state/editor";
import { checkTypes } from "./type-checker";
import type { Language } from "../state/editor";
import {
  addConsoleEntry,
  addErrorEntry,
  clearConsole,
  isRunning,
  executionTime,
  isLoadingModules,
} from "../state/console";
import { EXECUTION_TIMEOUT, MODULE_EXECUTION_TIMEOUT } from "../utils/constants";
import {
  isSuccessfulRunEligible,
  trackSuccessfulRun,
  type RunTrigger,
} from "../utils/analytics";

let currentIframe: HTMLIFrameElement | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let runningIndicatorId: ReturnType<typeof setTimeout> | null = null;
let executionDone = false;
let executionHadError = false;
let activeRun: {
  surface: Language;
  trigger: RunTrigger;
  eligibleAtStart: boolean;
  editedAtStart: boolean;
} | null = null;

let nextExecutionId = 0;
let currentExecution: (ReturnType<typeof prepareExecution> & { source: SourceSnapshot }) | null = null;
let typeCheckSource: SourceSnapshot | null = null;

function errorLocation(error: ExecutionError): SourceLocation | undefined {
  const position = currentExecution?.locate(error);
  return currentExecution ? sourceLocation(currentExecution.source, position) : undefined;
}
// Code to run when iframe sends "ready" (avoids srcdoc/onload race).
let pendingCode: string | null = null;
// Clear console on first output of this run (avoids empty-console flicker between runs).
let clearOnNextOutput = false;

// Type-checking state: run id prevents stale results from a previous run.
let typeCheckRunId = 0;
let typeCheckPromise: Promise<
  import("./type-checker").TypeDiagnostic[] | null
> | null = null;

/** Append pending type diagnostics and report whether the completed run type-checked. */
async function flushTypeErrors(): Promise<boolean> {
  if (!typeCheckPromise) return true;
  const capturedRunId = typeCheckRunId;
  const source = typeCheckSource;
  const promise = typeCheckPromise;
  typeCheckPromise = null;
  const diagnostics = await promise;
  if (typeCheckRunId !== capturedRunId) return false; // stale
  if (diagnostics === null) return false; // checker unavailable; do not claim success
  let passed = true;
  for (const d of diagnostics) {
    if (d.category === "error" || d.category === "warning") {
      passed = false;
      const location = source ? sourceLocation(source, { line: d.line, column: d.col }) : undefined;
      addErrorEntry("error", `Type Error: ${d.message}`, undefined, d.line, d.col, location);
    }
  }
  return passed;
}

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
  pendingCode = null;
  currentExecution = null;
  isLoadingModules.value = false;
}

function handleMessage(event: MessageEvent) {
  const data = event.data;
  if (!data || data.source !== "jspark") return;
  if (!currentIframe?.contentWindow || event.source !== currentIframe.contentWindow) {
    return;
  }

  if (data.type === "console") {
    if (clearOnNextOutput) {
      clearConsole();
      clearOnNextOutput = false;
    }
    const args = data.args || [];
    const error = args.find((arg: { type: string }) => arg.type === "error");
    addConsoleEntry(data.method, args, error ? errorLocation(error) : undefined);
  } else if (data.type === "result") {
    if (clearOnNextOutput) {
      clearConsole();
      clearOnNextOutput = false;
    }
    addConsoleEntry("result", [data.value]);
  } else if (data.type === "error") {
    executionHadError = true;
    if (clearOnNextOutput) {
      clearConsole();
      clearOnNextOutput = false;
    }
    const location = errorLocation(data);
    const stack = typeof data.stack === "string" && !/__jspark|postMessage|about:srcdoc|tryjs-run-|blob:/.test(data.stack)
      ? data.stack : undefined;
    addErrorEntry(data.errorType || "error", data.message, stack, location?.line, location?.column, location);
  } else if (data.type === "ready") {
    if (
      pendingCode !== null &&
      currentIframe?.contentWindow &&
      event.source === currentIframe.contentWindow
    ) {
      currentIframe.contentWindow.postMessage(
        { source: "jspark", type: "run", code: pendingCode },
        "*"
      );
      pendingCode = null;
    }
  } else if (data.type === "done") {
    if (clearOnNextOutput) {
      clearConsole();
      clearOnNextOutput = false;
    }
    executionDone = true;
    // Cancel the running indicator if it hasn't fired yet
    if (runningIndicatorId) {
      clearTimeout(runningIndicatorId);
      runningIndicatorId = null;
    }
    isRunning.value = false;
    isLoadingModules.value = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (typeof data.executionTime === "number") {
      executionTime.value = data.executionTime;
    }
    const completedRun = activeRun;
    const runtimeSucceeded = !executionHadError;
    activeRun = null;
    void flushTypeErrors().then((typeCheckSucceeded) => {
      if (runtimeSucceeded && typeCheckSucceeded && completedRun) {
        trackSuccessfulRun(
          completedRun.surface,
          completedRun.trigger,
          completedRun.eligibleAtStart,
          completedRun.editedAtStart,
        );
      }
    });
  }
}

// Set up global listener once
window.addEventListener("message", handleMessage);

export function executeCode(
  source: string,
  lang: Language,
  trigger: RunTrigger = "auto",
) {
  cleanup();
  clearOnNextOutput = true; // clear on first output (avoids empty-console flicker)
  executionDone = false;
  executionHadError = false;
  activeRun = {
    surface: lang,
    trigger,
    eligibleAtStart: isSuccessfulRunEligible(trigger),
    editedAtStart: isSuccessfulRunEligible("auto"),
  };
  executionTime.value = null;

  const snapshot: SourceSnapshot = { code: source, language: lang, version: playgroundVersion.value };
  typeCheckSource = snapshot;

  // Start type checking for TypeScript (non-blocking, results shown after execution)
  ++typeCheckRunId;
  if (lang === "typescript") {
    typeCheckPromise = checkTypes(source).catch(() => null);
  } else {
    typeCheckPromise = null;
  }

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
    executionHadError = true;
    activeRun = null;
    clearConsole();
    const location = sourceLocation(snapshot, result.location);
    addErrorEntry("error", `Transpilation Error: ${result.error}`, undefined, location?.line, location?.column, location);
    clearOnNextOutput = false;
    executionDone = true;
    if (runningIndicatorId) {
      clearTimeout(runningIndicatorId);
      runningIndicatorId = null;
    }
    isRunning.value = false;
    void flushTypeErrors();
    return;
  }

  currentExecution = { ...prepareExecution(source, result, ++nextExecutionId), source: snapshot };
  if (currentExecution.module) {
    executeModuleCode(currentExecution.code);
  } else {
    executeEvalCode(currentExecution.code);
  }
}

/** Standard eval()-based execution path (no imports). */
function executeEvalCode(codeToRun: string) {
  pendingCode = codeToRun;

  const bootstrapForHtml = SANDBOX_BOOTSTRAP.replace(/<\/script/gi, "<\\/script");
  const srcdoc =
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body><script>" +
    bootstrapForHtml +
    "</script></body></html>";

  const iframe = document.createElement("iframe");
  iframe.sandbox.add("allow-scripts");
  iframe.style.display = "none";
  currentIframe = iframe;
  iframe.srcdoc = srcdoc;
  document.body.appendChild(iframe);

  // Execution timeout
  timeoutId = setTimeout(() => {
    cleanup();
    executionHadError = true;
    activeRun = null;
    addErrorEntry(
      "error",
      `Execution timed out after ${EXECUTION_TIMEOUT / 1000}s. Possible infinite loop?`
    );
    executionDone = true;
    isRunning.value = false;
    void flushTypeErrors();
  }, EXECUTION_TIMEOUT);
}

/** Module-based execution path (code has imports, uses esm.sh). */
function executeModuleCode(moduleCode: string) {
  isLoadingModules.value = true;
  const bootstrapForHtml = SANDBOX_BOOTSTRAP_MODULE.replace(/<\/script/gi, "<\\/script");
  const loaderForHtml = moduleLoader(moduleCode).replace(/<\/script/gi, "<\\/script");
  const srcdoc =
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body>" +
    "<script>" + bootstrapForHtml + "</script>" +
    "<script type=\"module\">" + loaderForHtml + "</script></body></html>";

  const iframe = document.createElement("iframe");
  iframe.sandbox.add("allow-scripts");
  iframe.style.display = "none";
  currentIframe = iframe;
  iframe.srcdoc = srcdoc;
  document.body.appendChild(iframe);

  // Longer timeout for module execution (network fetches)
  timeoutId = setTimeout(() => {
    cleanup();
    executionHadError = true;
    activeRun = null;
    addErrorEntry(
      "error",
      `Execution timed out after ${MODULE_EXECUTION_TIMEOUT / 1000}s. Check your imports or network connection.`
    );
    executionDone = true;
    isRunning.value = false;
    void flushTypeErrors();
  }, MODULE_EXECUTION_TIMEOUT);
}

export function stopExecution() {
  cleanup();
  ++typeCheckRunId;
  typeCheckPromise = null;
  executionDone = true;
  activeRun = null;
  isRunning.value = false;
}
