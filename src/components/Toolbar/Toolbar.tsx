import { language, setLanguage } from "../../state/editor";
import type { Language } from "../../state/editor";
import "./Toolbar.css";

const GITHUB_URL = "https://github.com/berkinduz/js-park";
const BMC_URL = "https://buymeacoffee.com/berkinduz";

export function Toolbar() {
  const currentLang = language.value;
  const setLang = (lang: Language) => () => setLanguage(lang);

  return (
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="toolbar__brand">
          <div class="toolbar__lang-toggle">
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--js ${currentLang === "javascript" ? "active" : ""}`}
              onClick={setLang("javascript")}
              title="JavaScript"
              aria-label="JavaScript"
              aria-pressed={currentLang === "javascript"}
            >
              JS
            </button>
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--ts ${currentLang === "typescript" ? "active" : ""}`}
              onClick={setLang("typescript")}
              title="TypeScript"
              aria-label="TypeScript"
              aria-pressed={currentLang === "typescript"}
            >
              TS
            </button>
          </div>
        </div>
      </div>

      <div class="toolbar__right toolbar__right--links">
        <a
          href={BMC_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="toolbar__link toolbar__bmc"
          title="Buy Me a Coffee"
          aria-label="Buy Me a Coffee"
        >
          <span class="toolbar__bmc-text">Buy Me a Coffee</span>
          <span class="toolbar__bmc-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 110 8h-1M2 8h14v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <path d="M6 2v3M10 2v3M14 2v3" />
            </svg>
          </span>
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="toolbar__icon-btn toolbar__link"
          title="GitHub repository"
          aria-label="GitHub repository"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
