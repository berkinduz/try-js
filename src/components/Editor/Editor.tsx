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
import {
  code,
  language,
  theme,
  syntaxTheme,
  setCode,
  setLanguage,
  setMode,
} from "../../state/editor";
import { trackFirstMeaningfulEdit } from "../../utils/analytics";
import { ShareMenu } from "../Playgrounds/ShareMenu";
import { setSelection, clearSelection } from "../../state/selection";
import { openGallery } from "../Gallery/Gallery";
import "./Editor.css";

const PLACEHOLDER_EXAMPLES = [
  {
    label: "NPM Imports",
    icon: "package",
    desc: "Try browser-ready npm packages",
    code: `import dayjs from "dayjs";
import _ from "lodash";

const now = dayjs().format("HH:mm:ss");
console.log(\`It's \${now}\`);

const nums = _.shuffle([1, 2, 3, 4, 5]);
console.log("Shuffled:", nums);`,
  },
  {
    label: "Snippets",
    icon: "grid",
    desc: "Browse ready-to-run examples",
    action: "gallery" as const,
  },
  {
    label: "TypeScript",
    icon: "type",
    desc: "Run TypeScript with type checking",
    code: `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

console.log(divide(10, 3));
console.log(divide(10, 0));`,
    lang: "typescript" as const,
  },
  {
    label: "Web Playground",
    icon: "globe",
    desc: "Build with HTML, CSS & JS",
    action: "web" as const,
  },
] as const;

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

  const handleSelectionChange = (update: { state: EditorState }) => {
    const { from, to } = update.state.selection.main;
    if (from === to) {
      clearSelection();
      return;
    }
    const text = update.state.sliceDoc(from, to);
    setSelection(text, null);
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
          (newCode) => setCode(newCode),
          handleSelectionChange,
          (before, after) =>
            trackFirstMeaningfulEdit(language.value, before, after),
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
      clearSelection();
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
        getThemeExtension(theme.value, syntaxTheme.value),
      ),
    });
  }, [theme.value, syntaxTheme.value]);

  // Sync external code changes (e.g. language switch restoring saved code)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code.value) {
      clearSelection();
      view.setState(EditorState.create({
        doc: code.value,
        extensions: createExtensions(language.value, theme.value, syntaxTheme.value, setCode,
          handleSelectionChange, (before, after) => trackFirstMeaningfulEdit(language.value, before, after)),
      }));
    }
  }, [code.value]);

  const showPlaceholder = code.value === "" && !editorFocused;

  const handleExampleClick = (
    example: (typeof PLACEHOLDER_EXAMPLES)[number],
  ) => {
    if ("action" in example && example.action === "gallery") {
      openGallery();
      return;
    }
    if ("action" in example && example.action === "web") {
      history.pushState(null, "", "/web");
      setMode("web");
      return;
    }
    if ("code" in example) {
      if ("lang" in example && example.lang) {
        setLanguage(example.lang);
      }
      setCode(example.code);
    }
  };

  return (
    <div class="editor-wrapper">
      {showPlaceholder && (
        <div class="editor-placeholder" aria-hidden="true">
          <div class="editor-placeholder__inner">
            <span class="editor-placeholder__brand">TryJS</span>
            <p class="editor-placeholder__hero">Start typing to run code</p>
            <div class="editor-placeholder__divider">
              <span>or try an example</span>
            </div>
            <div class="editor-placeholder__grid">
              {PLACEHOLDER_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  class="editor-placeholder__card"
                  onClick={() => handleExampleClick(ex)}
                >
                  <span class="editor-placeholder__card-icon">
                    {ex.icon === "package" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M16.5 9.4l-9-5.19" />
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    )}
                    {ex.icon === "grid" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    )}
                    {ex.icon === "type" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="4 7 4 4 20 4 20 7" />
                        <line x1="9" y1="20" x2="15" y2="20" />
                        <line x1="12" y1="4" x2="12" y2="20" />
                      </svg>
                    )}
                    {ex.icon === "globe" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                    )}
                  </span>
                  <span class="editor-placeholder__card-label">{ex.label}</span>
                  <span class="editor-placeholder__card-desc">{ex.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div class="editor-actions">
        <button
          type="button"
          class="editor-action-btn"
          onClick={copyCode}
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? (
            <span class="editor-action-btn__done">&#10003;</span>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
        <ShareMenu />
      </div>
      <div ref={containerRef} class="editor-container" />
    </div>
  );
}
