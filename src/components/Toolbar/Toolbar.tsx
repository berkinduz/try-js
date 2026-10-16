import { language, setLanguage, mode, setMode } from "../../state/editor";
import type { Language } from "../../state/editor";
import { ToolbarLinks } from "./ToolbarLinks";
import { PlaygroundActions, PlaygroundContext } from "../Playgrounds/PlaygroundActions";
import { readLocal } from "../../utils/storage";
import "./Toolbar.css";

export function Toolbar() {
  const currentLang = language.value;
  const currentMode = mode.value;

  const isJsMode = currentMode === "js";
  const isWebMode = currentMode === "web" || currentMode === "react";
  const webPath = isWebMode ? currentMode === "react" ? "/react" : "/web"
    : readLocal("jspark:webSubMode") === "react" ? "/react" : "/web";

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
    const stored = readLocal("jspark:webSubMode");
    const target = stored === "react" ? "/react" : "/web";
    setMode(stored === "react" ? "react" : "web");
    goto(target);
  };

  return (
    <><div class="toolbar">
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
            <a
              href={webPath}
              class={`toolbar__logo toolbar__logo--web ${isWebMode ? "active" : ""}`}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                activateWeb();
              }}
              title="Web"
              aria-label="Web"
              aria-current={isWebMode ? "page" : undefined}
            >
              Web
            </a>
          </div>
        </div>
      </div>

      <div class="toolbar__utilities"><PlaygroundActions /><ToolbarLinks /></div>
    </div>
    <PlaygroundContext /></>
  );
}
