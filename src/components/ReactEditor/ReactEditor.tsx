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
import { theme, syntaxTheme, reactCode, reactCss, setReactCode, setReactCss } from "../../state/editor";
import { DEFAULT_REACT_CODE, DEFAULT_REACT_CSS } from "../../utils/constants";
import "./ReactEditor.css";

type ReactTab = "jsx" | "css";

export function ReactEditor() {
  const jsxContainerRef = useRef<HTMLDivElement>(null);
  const cssContainerRef = useRef<HTMLDivElement>(null);
  const jsxViewRef = useRef<EditorView | null>(null);
  const cssViewRef = useRef<EditorView | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<ReactTab>("jsx");

  // Create JSX editor on mount
  useEffect(() => {
    if (!jsxContainerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: reactCode.value,
        extensions: createExtensions(
          "jsx",
          theme.value,
          syntaxTheme.value,
          (newCode) => setReactCode(newCode),
        ),
      }),
      parent: jsxContainerRef.current,
    });

    jsxViewRef.current = view;

    const onFocus = () => setEditorFocused(true);
    const onBlur = () => setEditorFocused(false);
    view.contentDOM.addEventListener("focus", onFocus);
    view.contentDOM.addEventListener("blur", onBlur);

    return () => {
      view.contentDOM.removeEventListener("focus", onFocus);
      view.contentDOM.removeEventListener("blur", onBlur);
      view.destroy();
      jsxViewRef.current = null;
    };
  }, []);

  // Create CSS editor on mount
  useEffect(() => {
    if (!cssContainerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: reactCss.value,
        extensions: createExtensions(
          "css",
          theme.value,
          syntaxTheme.value,
          (newCode) => setReactCss(newCode),
        ),
      }),
      parent: cssContainerRef.current,
    });

    cssViewRef.current = view;

    return () => {
      view.destroy();
      cssViewRef.current = null;
    };
  }, []);

  // Sync theme for both editors
  useEffect(() => {
    const effects = themeCompartment.reconfigure(
      getThemeExtension(theme.value, syntaxTheme.value),
    );
    jsxViewRef.current?.dispatch({ effects });
    cssViewRef.current?.dispatch({ effects });
  }, [theme.value, syntaxTheme.value]);

  const isEmpty = reactCode.value === "";

  const loadStarter = () => {
    setReactCode(DEFAULT_REACT_CODE);
    setReactCss(DEFAULT_REACT_CSS);
    const jsxView = jsxViewRef.current;
    if (jsxView) {
      const currentDoc = jsxView.state.doc.toString();
      if (currentDoc !== DEFAULT_REACT_CODE) {
        jsxView.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: DEFAULT_REACT_CODE },
        });
      }
    }
    const cssView = cssViewRef.current;
    if (cssView) {
      const currentDoc = cssView.state.doc.toString();
      if (currentDoc !== DEFAULT_REACT_CSS) {
        cssView.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: DEFAULT_REACT_CSS },
        });
      }
    }
  };

  return (
    <div class="react-editor">
      <div class="react-editor__tabs">
        <button
          type="button"
          class={`react-editor__tab ${activeTab === "jsx" ? "active" : ""}`}
          onClick={() => setActiveTab("jsx")}
        >
          App.jsx
        </button>
        <button
          type="button"
          class={`react-editor__tab ${activeTab === "css" ? "active" : ""}`}
          onClick={() => setActiveTab("css")}
        >
          App.css
        </button>
      </div>
      <div class="react-editor__body">
        {isEmpty && !editorFocused && activeTab === "jsx" && (
          <div class="react-editor__placeholder" aria-hidden="true">
            <div class="react-editor__placeholder-inner">
              <span class="react-editor__placeholder-brand">React Playground</span>
              <p class="react-editor__placeholder-hero">Write React components with JSX</p>
              <button
                type="button"
                class="react-editor__placeholder-btn"
                onClick={loadStarter}
              >
                Load starter template
              </button>
            </div>
          </div>
        )}
        <div
          ref={jsxContainerRef}
          class="react-editor__container"
          style={{ display: activeTab === "jsx" ? "block" : "none" }}
        />
        <div
          ref={cssContainerRef}
          class="react-editor__container"
          style={{ display: activeTab === "css" ? "block" : "none" }}
        />
      </div>
    </div>
  );
}
