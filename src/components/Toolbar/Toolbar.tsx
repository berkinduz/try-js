import { language, theme, setLanguage, toggleTheme } from "../../state/editor";
import { clearConsole } from "../../state/console";
import { autoRun, setAutoRun } from "../../state/settings";
import type { Language } from "../../state/editor";
import "./Toolbar.css";

interface Props {
  onRun: () => void;
}

export function Toolbar({ onRun }: Props) {
  const currentLang = language.value;
  const currentTheme = theme.value;
  const auto = autoRun.value;

  const handleLangSwitch = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="toolbar__brand">
          <span class="toolbar__logo">JS</span>
          <span class="toolbar__title">Park</span>
        </div>

        <div class="toolbar__separator" />

        {!auto && (
          <button
            class="toolbar__run-btn"
            onClick={onRun}
            title="Run (Ctrl+Enter / ⌘+Enter)"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
            <span>Run</span>
          </button>
        )}

        <label class="toolbar__toggle" title="Auto-run on code change">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAutoRun((e.target as HTMLInputElement).checked)}
          />
          <span class="toolbar__toggle-label">Auto</span>
        </label>
      </div>

      <div class="toolbar__right">
        <div class="toolbar__lang-switch">
          <button
            class={`toolbar__lang-btn ${currentLang === "javascript" ? "active" : ""}`}
            onClick={() => handleLangSwitch("javascript")}
            title="JavaScript"
          >
            JS
          </button>
          <button
            class={`toolbar__lang-btn ${currentLang === "typescript" ? "active" : ""}`}
            onClick={() => handleLangSwitch("typescript")}
            title="TypeScript"
          >
            TS
          </button>
        </div>

        <button
          class="toolbar__icon-btn"
          onClick={clearConsole}
          title="Clear console (Ctrl+L / ⌘+L)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6" />
            <line x1="5" y1="5" x2="11" y2="11" />
          </svg>
        </button>

        <button
          class="toolbar__icon-btn"
          onClick={toggleTheme}
          title="Toggle theme (Ctrl+Shift+P / ⌘+Shift+P)"
        >
          {currentTheme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1zm0 11a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 12zm7-4a.5.5 0 010 1h-1a.5.5 0 010-1h1zM3 8a.5.5 0 010 1H2a.5.5 0 010-1h1zm9.354-3.354a.5.5 0 010 .708l-.708.707a.5.5 0 01-.707-.707l.707-.708a.5.5 0 01.708 0zM5.354 10.646a.5.5 0 010 .708l-.708.707a.5.5 0 01-.707-.707l.707-.708a.5.5 0 01.708 0zM12.354 11.354a.5.5 0 00 0-.708l-.708-.707a.5.5 0 00-.707.707l.707.708a.5.5 0 00.708 0zM5.354 5.354a.5.5 0 00 0-.708l-.708-.707a.5.5 0 00-.707.707l.707.708a.5.5 0 00.708 0zM8 4a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
