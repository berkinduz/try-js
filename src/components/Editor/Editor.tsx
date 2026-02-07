import { useRef, useEffect } from "preact/hooks";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  createExtensions,
  languageCompartment,
  themeCompartment,
  getLanguageExtension,
  getThemeExtension,
} from "./extensions";
import { code, language, theme, setCode } from "../../state/editor";
import "./Editor.css";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: code.value,
        extensions: createExtensions(language.value, theme.value, (newCode) => {
          setCode(newCode);
        }),
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
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

  // Sync theme compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const t = theme.value;
    view.dispatch({
      effects: themeCompartment.reconfigure(getThemeExtension(t)),
    });
  }, [theme.value]);

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

  return <div ref={containerRef} class="editor-container" />;
}
