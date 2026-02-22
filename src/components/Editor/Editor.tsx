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
import { code, language, theme, syntaxTheme, setCode, setLanguage } from "../../state/editor";
import { shareToClipboard, generateEmbedCode } from "../../utils/share";
import { showToast } from "../Toast/Toast";
import { openScreenshotModal } from "../Screenshot/ScreenshotModal";
import { selectedText } from "../../state/selection";
import { setSelection, clearSelection } from "../../state/selection";
import { openGallery } from "../Gallery/Gallery";
import "./Editor.css";

const PLACEHOLDER_EXAMPLES = [
  {
    label: "NPM Imports",
    icon: "package",
    desc: "Use any npm package directly",
    code: `import confetti from "canvas-confetti";
import dayjs from "dayjs";
import _ from "lodash";

const now = dayjs().format("HH:mm:ss");
console.log(\`It's \${now}\`);

const nums = _.shuffle([1, 2, 3, 4, 5]);
console.log("Shuffled:", nums);`,
  },
  {
    label: "Async/Await",
    icon: "zap",
    desc: "Run async code instantly",
    code: `const delay = (ms, val) =>
  new Promise(r => setTimeout(() => r(val), ms));

(async () => {
  const results = await Promise.all([
    delay(100, "first"),
    delay(200, "second"),
    delay(50,  "third"),
  ]);

  console.log(results);
})();`,
  },
  {
    label: "TypeScript",
    icon: "type",
    desc: "Full TS support, zero config",
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
    label: "Snippets",
    icon: "grid",
    desc: "Browse ready-made examples",
    action: "gallery" as const,
  },
] as const;

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [copied, setCopied] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const handleShareLink = async () => {
    setShareOpen(false);
    try {
      const codeToShare = selectedText.value || code.value;
      const result = await shareToClipboard({
        code: codeToShare,
        language: language.value,
      });
      if (result.warning) {
        showToast(result.warning, "warning", 4000);
      } else {
        showToast(selectedText.value ? "Selection link copied!" : "Link copied to clipboard!");
      }
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleCopyEmbed = async () => {
    setShareOpen(false);
    try {
      const embedCode = generateEmbedCode({
        code: code.value,
        language: language.value,
      });
      await navigator.clipboard.writeText(embedCode);
      showToast("Embed code copied!");
    } catch {
      showToast("Failed to copy embed code", "error");
    }
  };

  const handleExportImage = () => {
    setShareOpen(false);
    const codeToExport = selectedText.value || code.value;
    openScreenshotModal(codeToExport);
  };

  // Close share dropdown on click-outside or Escape
  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [shareOpen]);

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
          handleSelectionChange
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

  const handleExampleClick = (example: (typeof PLACEHOLDER_EXAMPLES)[number]) => {
    if ("action" in example && example.action === "gallery") {
      openGallery();
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
            <p class="editor-placeholder__hero">
              Start typing to run code
            </p>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    )}
                    {ex.icon === "zap" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    )}
                    {ex.icon === "type" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                    )}
                    {ex.icon === "grid" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
        <div class="editor-share-wrap" ref={shareRef}>
          <button
            type="button"
            class={`editor-action-btn ${shareOpen ? "active" : ""}`}
            onClick={() => setShareOpen(!shareOpen)}
            title="Share"
            aria-label="Share"
            aria-expanded={shareOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {shareOpen && (
            <div class="editor-dropdown">
              <button
                type="button"
                class="editor-dropdown__item"
                onClick={handleShareLink}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Share as URL
              </button>
              <button
                type="button"
                class="editor-dropdown__item"
                onClick={handleExportImage}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Export as Image
              </button>
              <button
                type="button"
                class="editor-dropdown__item"
                onClick={handleCopyEmbed}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Copy Embed Code
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={containerRef} class="editor-container" />
    </div>
  );
}
