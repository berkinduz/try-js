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

/** All language modes the editor can handle. */
export type EditorLanguage = Language | "html" | "css" | "jsx";

export const languageCompartment = new Compartment();
export const themeCompartment = new Compartment();

export function getLanguageExtension(lang: EditorLanguage): Extension {
  if (lang === "html") return html();
  if (lang === "css") return css();
  if (lang === "jsx") return javascript({ typescript: false, jsx: true });
  return javascript({ typescript: lang === "typescript", jsx: false });
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
  onSelectionChange?: (update: ViewUpdate) => void
): Extension[] {
  const completionMode = getCompletionMode(lang);

  // Additional completion sources — injected via languageData so they
  // work alongside (not replacing) the built-in lang-javascript completions.
  const extraSources = completionMode
    ? [...getCompletionSources(completionMode), tsCompletionSource]
    : [];

  return [
    // Language
    languageCompartment.of(getLanguageExtension(lang)),
    // Theme (UI + syntax)
    themeCompartment.of(getThemeExtension(uiTheme, syntaxThemeId)),
    // Register extra completion sources via languageData so they merge
    // with the built-in sources from @codemirror/lang-javascript.
    // Each source must be a separate { autocomplete: fn } entry.
    ...extraSources.map((source) =>
      EditorState.languageData.of(() => [{ autocomplete: source }]),
    ),
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
    // Hover tooltips (only for JS/TS/JSX)
    ...(completionMode ? [tsHoverTooltip] : []),
    // Import quick-fix linter with lightbulb actions (only for JS/TS/JSX)
    ...(completionMode ? [importQuickFixLinter, lintGutter()] : []),
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
        onChange(update.state.doc.toString());
      }
      if (onSelectionChange && (update.selectionSet || update.docChanged)) {
        onSelectionChange(update);
      }
    }),
  ];
}
