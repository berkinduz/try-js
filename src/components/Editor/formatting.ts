import { effect, signal } from "@preact/signals";
import { EditorSelection, Facet, Prec, StateField, Transaction } from "@codemirror/state";
import { isolateHistory } from "@codemirror/commands";
import { EditorView, ViewPlugin } from "@codemirror/view";
import {
  mode, language, code, playgroundVersion,
  webActiveTab, getWebCode, reactActiveTab, reactCode, reactCss,
} from "../../state/editor";
import { formatCode, formatErrorMessage } from "../../utils/code-format";
import type { FormatLanguage } from "../../utils/code-format";
import { showToast } from "../Toast/Toast";

export const formatShortcutLabel = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  ? "⇧⌥F" : "Shift+Alt+F";
export const formatting = signal(false);
export const formatLanguage = Facet.define<FormatLanguage, FormatLanguage>({ combine: (values) => values[0] ?? "javascript" });

// Object identity also detects setState, edits followed by Undo, and selection changes.
export const formatDocumentIdentity = StateField.define({
  create: () => ({}),
  update: (identity, transaction) => transaction.docChanged || !transaction.startState.selection.eq(transaction.newSelection)
    ? {} : identity,
});

const views = new Set<EditorView>();
let contextVersion = 0;
function activeLanguage(): FormatLanguage {
  if (mode.value === "js") return language.value;
  if (mode.value === "react") return reactActiveTab.value === "jsx" ? "jsx" : "css";
  return webActiveTab.value === "js" ? "javascript" : webActiveTab.value;
}
effect(() => {
  // Observe changes synchronously, including switching away and back before loading finishes.
  activeLanguage();
  playgroundVersion.value;
  if (mode.value === "js") code.value;
  else if (mode.value === "react") reactActiveTab.value === "jsx" ? reactCode.value : reactCss.value;
  else getWebCode(webActiveTab.value);
  ++contextVersion;
});

export function isFormatShortcut(event: KeyboardEvent): boolean {
  return !event.isComposing && !event.ctrlKey && !event.metaKey && event.altKey && event.shiftKey &&
    (event.code === "KeyF" || event.key.toLowerCase() === "f");
}

export async function formatEditor(view: EditorView): Promise<void> {
  if (formatting.value || view.state.readOnly) return;
  view.focus();
  const state = view.state;
  const source = state.doc.toString();
  if (!source) { showToast("Code is already formatted."); return; }
  const currentContext = contextVersion;
  const identity = state.field(formatDocumentIdentity);
  const lang = state.facet(formatLanguage);
  const isCurrent = () => view.dom.isConnected && currentContext === contextVersion &&
    view.state.field(formatDocumentIdentity, false) === identity && view.state.facet(formatLanguage) === lang;
  const skipped = () => showToast("Formatting skipped because the code, selection, or active tab changed. Run Format code again.", "warning", 4500);
  formatting.value = true;
  try {
    const positions = state.selection.ranges.flatMap((range) => [range.anchor, range.head]);
    const result = await formatCode(source, lang, positions);
    if (!isCurrent()) { skipped(); return; }
    if (result.formatted === source) { showToast("Code is already formatted."); return; }
    const scrollTop = view.scrollDOM.scrollTop;
    const scrollLeft = view.scrollDOM.scrollLeft;
    view.dispatch({
      changes: { from: 0, to: state.doc.length, insert: result.formatted },
      selection: EditorSelection.create(state.selection.ranges.map((_, index) =>
        EditorSelection.range(result.positions[index * 2], result.positions[index * 2 + 1])), state.selection.mainIndex),
      annotations: [Transaction.userEvent.of("input.format"), isolateHistory.of("full")],
    });
    const formattedIdentity = view.state.field(formatDocumentIdentity);
    // CodeMirror adjusts its scroll anchor at the end of measurement. Restore after that pass.
    requestAnimationFrame(() => {
      if (!view.dom.isConnected || view.state.field(formatDocumentIdentity, false) !== formattedIdentity) return;
      view.scrollDOM.scrollTop = scrollTop;
      view.scrollDOM.scrollLeft = scrollLeft;
    });
    showToast("Code formatted. Undo to restore it.");
  } catch (cause) {
    if (isCurrent()) showToast(formatErrorMessage(cause), "error", 5000);
    else skipped();
  } finally {
    formatting.value = false;
  }
}

export function formatActiveEditor(): void {
  const lang = activeLanguage();
  const view = [...views].find((candidate) => candidate.dom.isConnected && candidate.state.facet(formatLanguage) === lang);
  if (view) void formatEditor(view);
  else showToast("The editor is not ready yet. Try again.", "error");
}

export const formattingExtensions = [
  formatDocumentIdentity,
  ViewPlugin.define((view) => {
    views.add(view);
    return { destroy() { views.delete(view); } };
  }),
  // Run before Vim's DOM handlers; Option+Shift can change event.key on macOS.
  Prec.highest(EditorView.domEventHandlers({ keydown(event, view) {
    if (!isFormatShortcut(event)) return false;
    event.preventDefault();
    void formatEditor(view);
    return true;
  } })),
];
