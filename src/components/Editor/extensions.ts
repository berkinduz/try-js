import { Compartment, EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import {
  autocompletion,
  acceptCompletion,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
} from "@codemirror/language";
import { lintKeymap, lintGutter } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  EditorView,
} from "@codemirror/view";
import type { ViewUpdate } from "@codemirror/view";
import type { Language } from "../../state/editor";
import type { SyntaxThemeId, UiTheme } from "./themes";
import { getEditorTheme } from "./themes";
import { getCompletionSources } from "./completions";
import type { CompletionMode } from "./completions";
import { tsCompletionSource } from "../../sandbox/ts-completions";
import { tsHoverTooltip } from "./hover";
import { importQuickFixLinter } from "./import-quick-fixes";
import { optionalVim } from "./vim";
import { formatLanguage, formattingExtensions } from "./formatting";

/** All language modes the editor can handle. */
export type EditorLanguage = Language | "html" | "css" | "jsx";

export const languageCompartment = new Compartment();
export const themeCompartment = new Compartment();

export function getLanguageExtension(lang: EditorLanguage): Extension {
  if (lang === "html") return [formatLanguage.of(lang), html()];
  if (lang === "css") return [formatLanguage.of(lang), css()];
  const completionMode = getCompletionMode(lang)!;
  const sources = [...getCompletionSources(completionMode),
    (context: Parameters<typeof tsCompletionSource>[0]) => tsCompletionSource(context, lang === "jsx"),
  ];
  return [
    formatLanguage.of(lang),
    javascript({ typescript: lang === "typescript", jsx: lang === "jsx" }),
    ...sources.map((source) => EditorState.languageData.of(() => [{ autocomplete: source }])),
    tsHoverTooltip(lang === "jsx"), importQuickFixLinter, lintGutter(),
  ];
}

export function getThemeExtension(uiTheme: UiTheme, syntaxThemeId: SyntaxThemeId): Extension[] {
  return getEditorTheme(uiTheme, syntaxThemeId);
}

/** Map editor language to completion mode. */
function getCompletionMode(lang: EditorLanguage): CompletionMode | null {
  if (lang === "javascript") return "javascript";
  if (lang === "typescript") return "typescript";
  if (lang === "jsx") return "jsx";
  return null; // HTML/CSS use their own built-in completions
}

export function createExtensions(
  lang: EditorLanguage,
  uiTheme: UiTheme,
  syntaxThemeId: SyntaxThemeId,
  onChange: (code: string) => void,
  onSelectionChange?: (update: ViewUpdate) => void,
  onUserEdit?: (before: string, after: string) => void,
): Extension[] {
  return [
    ...formattingExtensions,
    // Vim must precede the normal keymaps; disabled mode adds no downloaded code.
    ...optionalVim(),
    // Language
    languageCompartment.of(getLanguageExtension(lang)),
    // Theme (UI + syntax)
    themeCompartment.of(getThemeExtension(uiTheme, syntaxThemeId)),
    // Core
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 40,
      icons: true,
      defaultKeymap: true,
      optionClass: (completion: { type?: string }) => {
        if (completion.type === "snippet") return "cm-completion-snippet";
        if (completion.type === "function" || completion.type === "method")
          return "cm-completion-function";
        if (completion.type === "keyword") return "cm-completion-keyword";
        if (completion.type === "type" || completion.type === "class")
          return "cm-completion-type";
        if (completion.type === "property") return "cm-completion-property";
        return "";
      },
    }),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    // Keymaps
    keymap.of([
      // Accept completion on Tab (before indentWithTab so it takes priority)
      { key: "Tab", run: acceptCompletion },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...lintKeymap,
      indentWithTab,
    ]),
    // Update listener
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const before = update.startState.doc.toString();
        const after = update.state.doc.toString();
        onChange(after);
        if (
          onUserEdit &&
          update.transactions.some((transaction) =>
            transaction.isUserEvent("input") ||
            transaction.isUserEvent("delete"),
          )
        ) {
          onUserEdit(before, after);
        }
      }
      if (onSelectionChange && (update.selectionSet || update.docChanged)) {
        onSelectionChange(update);
      }
    }),
  ];
}
