import { consoleOutput, executionTime, isRunning } from "../../state/console";
import { language, fileExtension } from "../../state/editor";
import "./StatusBar.css";

export function StatusBar() {
  const entries = consoleOutput.value;
  const execTime = executionTime.value;
  const running = isRunning.value;

  const errorCount = entries.filter(
    (e) =>
      e.kind === "error" ||
      (e.kind === "console" && e.method === "error")
  ).length;

  const warnCount = entries.filter(
    (e) => e.kind === "console" && e.method === "warn"
  ).length;

  return (
    <div class="statusbar">
      <div class="statusbar__left">
        <span class="statusbar__lang">
          {language.value === "typescript" ? "TypeScript" : "JavaScript"}
          {fileExtension.value}
        </span>
      </div>

      <div class="statusbar__right">
        {running && <span class="statusbar__item statusbar__running">Running...</span>}

        {execTime !== null && !running && (
          <span class="statusbar__item">
            {execTime < 1 ? "<1ms" : `${Math.round(execTime)}ms`}
          </span>
        )}

        {errorCount > 0 && (
          <span class="statusbar__item statusbar__errors">
            ✕ {errorCount}
          </span>
        )}

        {warnCount > 0 && (
          <span class="statusbar__item statusbar__warnings">
            ⚠ {warnCount}
          </span>
        )}

        <span class="statusbar__item statusbar__log-count">
          {entries.length} log{entries.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
