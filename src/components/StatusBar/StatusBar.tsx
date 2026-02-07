import { consoleOutput, executionTime, isRunning } from "../../state/console";
import { language, syntaxTheme, setSyntaxTheme } from "../../state/editor";
import { editorFont, setEditorFont, EDITOR_FONTS } from "../../state/settings";
import type { EditorFontId } from "../../state/settings";
import { SYNTAX_THEMES } from "../Editor/themes";
import type { SyntaxThemeId } from "../Editor/themes";
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
        <a
          href="https://berkinduz.com"
          target="_blank"
          rel="noopener noreferrer"
          class="statusbar__brand"
        >
          TryJS
        </a>
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

        <div class="statusbar__appearance">
          <div class="statusbar__shortcut-wrap">
            <button
              type="button"
              class="statusbar__shortcut-btn"
              title="Keyboard shortcuts"
              aria-label="Keyboard shortcuts"
            >
              <span class="statusbar__shortcut-icon" aria-hidden>⌘</span>
            </button>
            <div class="statusbar__shortcut-tooltip" role="tooltip">
              <div class="statusbar__shortcut-row"><kbd>⌘</kbd><kbd>↵</kbd> Run</div>
              <div class="statusbar__shortcut-row"><kbd>⌘</kbd><kbd>L</kbd> Clear console</div>
            </div>
          </div>
          <select
            class="statusbar__select"
            value={editorFont.value}
            onChange={(e) => setEditorFont((e.target as HTMLSelectElement).value as EditorFontId)}
            title="Editor font"
            aria-label="Editor font"
          >
            {EDITOR_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            class="statusbar__select"
            value={syntaxTheme.value}
            onChange={(e) => setSyntaxTheme((e.target as HTMLSelectElement).value as SyntaxThemeId)}
            title="Syntax theme"
            aria-label="Syntax theme"
          >
            <optgroup label="Light">
              {SYNTAX_THEMES.filter((t) => t.mode === "light").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Dark">
              {SYNTAX_THEMES.filter((t) => t.mode === "dark").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}
