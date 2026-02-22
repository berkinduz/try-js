import { useRef, useEffect, useState } from "preact/hooks";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  createExtensions,
  languageCompartment,
  themeCompartment,
  getLanguageExtension,
  getThemeExtension,
} from "../Editor/extensions";
import type { EditorLanguage } from "../Editor/extensions";
import {
  theme,
  syntaxTheme,
  webActiveTab,
  webHtml,
  webCss,
  webJs,
  setWebCode,
  setWebActiveTab,
  getWebCode,
} from "../../state/editor";
import type { WebTab } from "../../state/editor";
import "./WebEditor.css";

const TAB_LANGUAGE_MAP: Record<WebTab, EditorLanguage> = {
  html: "html",
  css: "css",
  js: "javascript",
};

const TABS: { id: WebTab; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JS" },
];

const STARTER_HTML = `<h1>Hello World</h1>
<p>Start building your web page here.</p>`;

const STARTER_CSS = `body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  background: #fafafa;
}

h1 {
  color: #333;
}`;

const STARTER_JS = `// Your JavaScript here
console.log("Hello from Web Playground!");`;

export function WebEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const activeTabRef = useRef<WebTab>(webActiveTab.value);
  const activeTab = webActiveTab.value;
  const [editorFocused, setEditorFocused] = useState(false);

  // Keep ref in sync so the onChange callback always targets the correct tab
  activeTabRef.current = activeTab;

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const lang = TAB_LANGUAGE_MAP[webActiveTab.value];
    const view = new EditorView({
      state: EditorState.create({
        doc: getWebCode(webActiveTab.value),
        extensions: createExtensions(
          lang,
          theme.value,
          syntaxTheme.value,
          (newCode) => setWebCode(activeTabRef.current, newCode),
        ),
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    const onFocus = () => setEditorFocused(true);
    const onBlur = () => setEditorFocused(false);
    view.contentDOM.addEventListener("focus", onFocus);
    view.contentDOM.addEventListener("blur", onBlur);

    return () => {
      view.contentDOM.removeEventListener("focus", onFocus);
      view.contentDOM.removeEventListener("blur", onBlur);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Sync tab changes: switch language and content
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const lang = TAB_LANGUAGE_MAP[activeTab];
    const newContent = getWebCode(activeTab);
    const currentDoc = view.state.doc.toString();

    // Reconfigure language
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(lang)),
    });

    // Update content if different
    if (currentDoc !== newContent) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: newContent },
      });
    }
  }, [activeTab]);

  // Sync theme
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.reconfigure(
        getThemeExtension(theme.value, syntaxTheme.value),
      ),
    });
  }, [theme.value, syntaxTheme.value]);

  const allEmpty = webHtml.value === "" && webCss.value === "" && webJs.value === "";
  const showPlaceholder = allEmpty && !editorFocused;

  const loadStarter = () => {
    setWebCode("html", STARTER_HTML);
    setWebCode("css", STARTER_CSS);
    setWebCode("js", STARTER_JS);
    setWebActiveTab("html");
    // Update editor content
    const view = viewRef.current;
    if (view) {
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== STARTER_HTML) {
        view.dispatch({
          effects: languageCompartment.reconfigure(getLanguageExtension("html")),
        });
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: STARTER_HTML },
        });
      }
    }
  };

  const handleTabClick = (tab: WebTab) => {
    if (tab === activeTab) return;
    // Save current editor content before switching
    const view = viewRef.current;
    if (view) {
      setWebCode(activeTab, view.state.doc.toString());
    }
    setWebActiveTab(tab);
  };

  return (
    <div class="web-editor">
      <div class="web-editor__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            class={`web-editor__tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div class="web-editor__body">
        {showPlaceholder && (
          <div class="web-editor__placeholder" aria-hidden="true">
            <div class="web-editor__placeholder-inner">
              <span class="web-editor__placeholder-brand">Web Playground</span>
              <p class="web-editor__placeholder-hero">Start typing HTML, CSS & JS</p>
              <button
                type="button"
                class="web-editor__placeholder-btn"
                onClick={loadStarter}
              >
                Load starter template
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} class="web-editor__container" />
      </div>
    </div>
  );
}
