import { language, setLanguage } from "../../state/editor";
import type { Language } from "../../state/editor";
import { ToolbarLinks } from "./ToolbarLinks";
import "./Toolbar.css";

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
              <span class="toolbar__logo-short">JS</span>
              <span class="toolbar__logo-full">JavaScript</span>
            </button>
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--ts ${currentLang === "typescript" ? "active" : ""}`}
              onClick={setLang("typescript")}
              title="TypeScript"
              aria-label="TypeScript"
              aria-pressed={currentLang === "typescript"}
            >
              <span class="toolbar__logo-short">TS</span>
              <span class="toolbar__logo-full">TypeScript</span>
            </button>
          </div>
        </div>
      </div>

      <ToolbarLinks currentPath="/" />
    </div>
  );
}
