import { useState, useRef, useEffect } from "preact/hooks";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  createExtensions,
  languageCompartment,
  themeCompartment,
  getLanguageExtension,
  getThemeExtension,
} from "./extensions";
import { code, language, theme, syntaxTheme, setCode } from "../../state/editor";
import "./Editor.css";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [copied, setCopied] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: code.value,
        extensions: createExtensions(
          language.value,
          theme.value,
          syntaxTheme.value,
          (newCode) => setCode(newCode)
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

  // Sync language compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const lang = language.value;
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(lang)),
    });
  }, [language.value]);

  // Sync theme compartment (UI theme + syntax theme)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartment.reconfigure(
        getThemeExtension(theme.value, syntaxTheme.value)
      ),
    });
  }, [theme.value, syntaxTheme.value]);

  // Sync external code changes (e.g. language switch restoring saved code)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code.value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: code.value,
        },
      });
    }
  }, [code.value]);

  const showPlaceholder = code.value === "" && !editorFocused;

  return (
    <div class="editor-wrapper">
      {showPlaceholder && (
        <div
          class="editor-placeholder"
          aria-hidden="true"
        >
          // Welcome to TryJS
          <br />
          // Write or paste your code below
        </div>
      )}
      <button
        type="button"
        class="editor-copy"
        onClick={copyCode}
        title="Copy code"
        aria-label="Copy code"
      >
        {copied ? (
          <span class="editor-copy__done">Copied!</span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
      <div ref={containerRef} class="editor-container" />
    </div>
  );
}
