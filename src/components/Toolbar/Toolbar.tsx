import { language, setLanguage, mode, setMode } from "../../state/editor";
import type { Language } from "../../state/editor";
import { ToolbarLinks } from "./ToolbarLinks";
import "./Toolbar.css";

export function Toolbar() {
  const currentLang = language.value;
  const currentMode = mode.value;

  const isJsMode = currentMode === "js";
  const isWebMode = currentMode === "web" || currentMode === "react";

  const goto = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const activateJs = (lang: Language) => {
    setMode("js");
    setLanguage(lang);
    goto("/");
  };

  const activateWeb = () => {
    // Preserve current sub-mode (vanilla vs react) if already in Web
    if (isWebMode) return;
    // Restore last chosen sub-mode, default vanilla
    const stored = localStorage.getItem("jspark:webSubMode");
    const target = stored === "react" ? "/react" : "/web";
    setMode(stored === "react" ? "react" : "web");
    goto(target);
  };

  return (
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="toolbar__brand">
          <div class="toolbar__lang-toggle">
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--js ${currentLang === "javascript" && isJsMode ? "active" : ""}`}
              onClick={() => activateJs("javascript")}
              title="JavaScript"
              aria-label="JavaScript"
              aria-pressed={currentLang === "javascript" && isJsMode}
            >
              JS
            </button>
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--ts ${currentLang === "typescript" && isJsMode ? "active" : ""}`}
              onClick={() => activateJs("typescript")}
              title="TypeScript"
              aria-label="TypeScript"
              aria-pressed={currentLang === "typescript" && isJsMode}
            >
              TS
            </button>
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--web ${isWebMode ? "active" : ""}`}
              onClick={activateWeb}
              title="Web"
              aria-label="Web"
              aria-pressed={isWebMode}
            >
              Web
            </button>
          </div>
        </div>
      </div>

      <ToolbarLinks />
    </div>
  );
}
