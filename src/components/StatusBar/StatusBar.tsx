import {
  consoleOutput,
  executionTime,
  isRunning,
  isLoadingModules,
} from "../../state/console";
import { syntaxTheme, setSyntaxTheme } from "../../state/editor";
import { editorFont, setEditorFont, EDITOR_FONTS } from "../../state/settings";
import type { EditorFontId } from "../../state/settings";
import { SYNTAX_THEMES } from "../Editor/themes";
import type { SyntaxThemeId } from "../Editor/themes";
import { openGallery } from "../Gallery/Gallery";
import "./StatusBar.css";

export function StatusBar() {
  const entries = consoleOutput.value;
  const execTime = executionTime.value;
  const running = isRunning.value;

  const errorCount = entries.filter(
    (e) => e.kind === "error" || (e.kind === "console" && e.method === "error"),
  ).length;

  const warnCount = entries.filter(
    (e) => e.kind === "console" && e.method === "warn",
  ).length;

  return (
    <div class="statusbar">
      <div class="statusbar__left">
        <div class="statusbar__help-wrap">
          <button
            type="button"
            class="statusbar__help-btn"
            aria-label="Help"
            title="TryJS help"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span class="statusbar__btn-text">Help</span>
          </button>
          <div class="statusbar__help-tooltip" role="tooltip">
            <div class="statusbar__help-heading">
              <span class="statusbar__help-eyebrow">TryJS</span>
              <strong>Quick Guide</strong>
            </div>
            <ul class="statusbar__help-list">
              <li>
                <strong>JS / TS</strong> switch between JavaScript and
                TypeScript
              </li>
              <li>
                <strong>NPM imports</strong> import from npm packages directly
              </li>
              <li>
                <strong>Share</strong> copy URL, embed, or screenshot your code
              </li>
              <li>
                <strong>Snippets</strong> open ready-made examples
              </li>
              <li>
                <strong>Themes</strong> pick syntax theme and editor font
              </li>
            </ul>
            <div class="statusbar__help-shortcuts">
              <span>
                <kbd>⌘</kbd>
                <kbd>↵</kbd> Run
              </span>
              <span>
                <kbd>⌘</kbd>
                <kbd>L</kbd> Clear
              </span>
              <span>
                <kbd>⌘</kbd>
                <kbd>S</kbd> Save
              </span>
            </div>
          </div>
        </div>
        <a
          href="/features"
          class="statusbar__features-link"
          title="Features overview"
          aria-label="Features overview"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span class="statusbar__btn-text">Features</span>
        </a>
        <button
          type="button"
          class="statusbar__snippets-btn"
          onClick={openGallery}
          title="Browse snippets"
          aria-label="Browse snippets"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span class="statusbar__btn-text">Snippets</span>
        </button>
      </div>

      <div class="statusbar__right">
        <div class="statusbar__metrics">
          {isLoadingModules.value && (
            <span class="statusbar__item statusbar__running">
              Loading modules...
            </span>
          )}

          {running && !isLoadingModules.value && (
            <span class="statusbar__item statusbar__running">Running...</span>
          )}

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

        <div class="statusbar__appearance">
          <div class="statusbar__shortcut-wrap">
            <button
              type="button"
              class="statusbar__shortcut-btn"
              title="Keyboard shortcuts"
              aria-label="Keyboard shortcuts"
            >
              <span class="statusbar__shortcut-icon" aria-hidden>
                ⌘
              </span>
            </button>
            <div class="statusbar__shortcut-tooltip" role="tooltip">
              <div class="statusbar__shortcut-row">
                <kbd>⌘</kbd>
                <kbd>↵</kbd> Run
              </div>
              <div class="statusbar__shortcut-row">
                <kbd>⌘</kbd>
                <kbd>L</kbd> Clear console
              </div>
            </div>
          </div>
          <select
            class="statusbar__select"
            value={editorFont.value}
            onChange={(e) =>
              setEditorFont(
                (e.target as HTMLSelectElement).value as EditorFontId,
              )
            }
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
            onChange={(e) =>
              setSyntaxTheme(
                (e.target as HTMLSelectElement).value as SyntaxThemeId,
              )
            }
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
