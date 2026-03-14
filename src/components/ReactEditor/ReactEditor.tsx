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
import { theme, syntaxTheme, reactCode, setReactCode } from "../../state/editor";
import { DEFAULT_REACT_CODE } from "../../utils/constants";
import "./ReactEditor.css";

export function ReactEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

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

  const isEmpty = reactCode.value === "";

  const loadStarter = () => {
    setReactCode(DEFAULT_REACT_CODE);
    const view = viewRef.current;
    if (view) {
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== DEFAULT_REACT_CODE) {
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: DEFAULT_REACT_CODE },
        });
      }
    }
  };

  return (
    <div class="react-editor">
      <div class="react-editor__tabs">
        <span class="react-editor__tab active">App.jsx</span>
      </div>
      <div class="react-editor__body">
        {isEmpty && !editorFocused && (
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
        <div ref={containerRef} class="react-editor__container" />
      </div>
    </div>
  );
}
