import { Compartment } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import {
  autocompletion,
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
import { lintKeymap } from "@codemirror/lint";
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
import type { Extension } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import type { Language } from "../../state/editor";
import type { SyntaxThemeId, UiTheme } from "./themes";
import { getEditorTheme } from "./themes";

export const languageCompartment = new Compartment();
export const themeCompartment = new Compartment();

export function getLanguageExtension(lang: Language): Extension {
  return javascript({ typescript: lang === "typescript", jsx: false });
}

export function getThemeExtension(uiTheme: UiTheme, syntaxThemeId: SyntaxThemeId): Extension[] {
  return getEditorTheme(uiTheme, syntaxThemeId);
}

export function createExtensions(
  lang: Language,
  uiTheme: UiTheme,
  syntaxThemeId: SyntaxThemeId,
  onChange: (code: string) => void,
  onSelectionChange?: (update: ViewUpdate) => void
): Extension[] {
  return [
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
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    // Keymaps
    keymap.of([
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
