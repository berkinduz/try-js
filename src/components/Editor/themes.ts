import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

// Syntax theme IDs; each has an associated UI mode so site theme stays in sync
export type SyntaxThemeId =
  | "one-dark"
  | "one-light"
  | "dracula"
  | "github-light"
  | "monokai"
  | "solarized-dark";

export type UiTheme = "light" | "dark";

export const SYNTAX_THEMES: {
  id: SyntaxThemeId;
  label: string;
  mode: UiTheme;
}[] = [
  { id: "one-dark", label: "One Dark", mode: "dark" },
  { id: "one-light", label: "One Light", mode: "light" },
  { id: "dracula", label: "Dracula", mode: "dark" },
  { id: "github-light", label: "GitHub Light", mode: "light" },
  { id: "monokai", label: "Monokai", mode: "dark" },
  { id: "solarized-dark", label: "Solarized Dark", mode: "dark" },
];

const syntaxThemeById = Object.fromEntries(
  SYNTAX_THEMES.map((t) => [t.id, t]),
) as Record<SyntaxThemeId, (typeof SYNTAX_THEMES)[number]>;

/** UI theme (light/dark) that matches the syntax theme so site and editor look consistent. */
export function getUiModeForSyntax(id: SyntaxThemeId): UiTheme {
  return syntaxThemeById[id].mode;
}

/** Default syntax theme when user toggles to dark. */
export const DEFAULT_DARK_SYNTAX: SyntaxThemeId = "one-dark";
/** Default syntax theme when user toggles to light. */
export const DEFAULT_LIGHT_SYNTAX: SyntaxThemeId = "github-light";

// ============================================
// Shared editor base styles (used by both UI themes)
// ============================================
function baseEditorTheme(isDark: boolean) {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--editor-bg)",
        color: "var(--editor-fg)",
        height: "100%",
      },
      ".cm-content": {
        fontFamily: "var(--editor-font)",
        fontSize: "var(--font-size)",
        padding: "12px 0",
        caretColor: "var(--accent)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--editor-gutter-bg)",
        color: "var(--editor-gutter-fg)",
        border: "none",
        paddingRight: "4px",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--editor-active-line)",
        color: isDark ? "var(--editor-fg)" : "var(--editor-fg)",
      },
      ".cm-activeLine": {
        backgroundColor: "var(--editor-active-line)",
      },
      ".cm-selectionLayer .cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      ".cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      "&.cm-focused .cm-selectionLayer .cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      ".cm-content ::selection": {
        backgroundColor: "var(--editor-selection)",
      },
      ".cm-line::selection, .cm-line > span::selection": {
        backgroundColor: "var(--editor-selection)",
      },
      ".cm-selectionMatch": {
        backgroundColor: "var(--editor-selection)",
      },
      ".cm-cursor": {
        borderLeftColor: "var(--accent)",
      },
      ".cm-matchingBracket": {
        backgroundColor: "var(--editor-bracket-match)",
        outline: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)",
        borderRadius: "2px",
      },
      ".cm-tooltip": {
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      },
      ".cm-tooltip-autocomplete ul li[aria-selected]": {
        backgroundColor: "var(--accent)",
        color: "#000",
      },
      ".cm-panels": {
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-primary)",
      },
      ".cm-search label": {
        color: "var(--text-primary)",
      },
      ".cm-textfield": {
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
      },
      ".cm-button": {
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "var(--bg-tertiary)",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
      },
    },
    { dark: isDark },
  );
}

// ============================================
// Syntax highlight styles (editor only; UI theme = light/dark)
// ============================================

// One Dark (Atom)
const oneDarkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#c678dd" },
  { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
  { tag: tags.string, color: "#98c379" },
  { tag: tags.number, color: "#d19a66" },
  { tag: tags.bool, color: "#d19a66" },
  { tag: tags.null, color: "#d19a66" },
  { tag: tags.function(tags.variableName), color: "#61afef" },
  { tag: tags.definition(tags.variableName), color: "#e06c75" },
  { tag: tags.typeName, color: "#e5c07b" },
  { tag: tags.propertyName, color: "#e06c75" },
  { tag: tags.operator, color: "#56b6c2" },
  { tag: tags.punctuation, color: "#abb2bf" },
  { tag: tags.className, color: "#e5c07b" },
  { tag: tags.regexp, color: "#98c379" },
  { tag: tags.tagName, color: "#e06c75" },
  { tag: tags.attributeName, color: "#d19a66" },
  { tag: tags.variableName, color: "#abb2bf" },
  { tag: tags.atom, color: "#d19a66" },
  { tag: tags.meta, color: "#abb2bf" },
  { tag: tags.self, color: "#e06c75" },
]);

// One Light (Atom)
const oneLightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#a626a4" },
  { tag: tags.comment, color: "#a0a1a7", fontStyle: "italic" },
  { tag: tags.string, color: "#50a14f" },
  { tag: tags.number, color: "#986801" },
  { tag: tags.bool, color: "#986801" },
  { tag: tags.null, color: "#986801" },
  { tag: tags.function(tags.variableName), color: "#4078f2" },
  { tag: tags.definition(tags.variableName), color: "#e45649" },
  { tag: tags.typeName, color: "#0184bc" },
  { tag: tags.propertyName, color: "#e45649" },
  { tag: tags.operator, color: "#0184bc" },
  { tag: tags.punctuation, color: "#383a42" },
  { tag: tags.className, color: "#c18401" },
  { tag: tags.regexp, color: "#50a14f" },
  { tag: tags.tagName, color: "#e45649" },
  { tag: tags.attributeName, color: "#986801" },
  { tag: tags.variableName, color: "#383a42" },
  { tag: tags.atom, color: "#986801" },
  { tag: tags.meta, color: "#383a42" },
  { tag: tags.self, color: "#e45649" },
]);

// Dracula
const draculaHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#ff79c6" },
  { tag: tags.comment, color: "#6272a4", fontStyle: "italic" },
  { tag: tags.string, color: "#f1fa8c" },
  { tag: tags.number, color: "#bd93f9" },
  { tag: tags.bool, color: "#bd93f9" },
  { tag: tags.null, color: "#bd93f9" },
  { tag: tags.function(tags.variableName), color: "#50fa7b" },
  { tag: tags.definition(tags.variableName), color: "#ff79c6" },
  { tag: tags.typeName, color: "#8be9fd" },
  { tag: tags.propertyName, color: "#50fa7b" },
  { tag: tags.operator, color: "#ff79c6" },
  { tag: tags.punctuation, color: "#f8f8f2" },
  { tag: tags.className, color: "#8be9fd" },
  { tag: tags.regexp, color: "#f1fa8c" },
  { tag: tags.tagName, color: "#ff79c6" },
  { tag: tags.attributeName, color: "#50fa7b" },
  { tag: tags.variableName, color: "#f8f8f2" },
  { tag: tags.atom, color: "#bd93f9" },
  { tag: tags.meta, color: "#f8f8f2" },
  { tag: tags.self, color: "#ff79c6" },
]);

// GitHub Light
const githubLightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#d73a49" },
  { tag: tags.comment, color: "#6a737d", fontStyle: "italic" },
  { tag: tags.string, color: "#032f62" },
  { tag: tags.number, color: "#005cc5" },
  { tag: tags.bool, color: "#005cc5" },
  { tag: tags.null, color: "#005cc5" },
  { tag: tags.function(tags.variableName), color: "#6f42c1" },
  { tag: tags.definition(tags.variableName), color: "#24292e" },
  { tag: tags.typeName, color: "#22863a" },
  { tag: tags.propertyName, color: "#005cc5" },
  { tag: tags.operator, color: "#d73a49" },
  { tag: tags.punctuation, color: "#24292e" },
  { tag: tags.className, color: "#6f42c1" },
  { tag: tags.regexp, color: "#032f62" },
  { tag: tags.tagName, color: "#22863a" },
  { tag: tags.attributeName, color: "#6f42c1" },
]);

// Monokai
const monokaiHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#f92672" },
  { tag: tags.comment, color: "#75715e", fontStyle: "italic" },
  { tag: tags.string, color: "#e6db74" },
  { tag: tags.number, color: "#ae81ff" },
  { tag: tags.bool, color: "#ae81ff" },
  { tag: tags.null, color: "#ae81ff" },
  { tag: tags.function(tags.variableName), color: "#a6e22e" },
  { tag: tags.definition(tags.variableName), color: "#f92672" },
  { tag: tags.typeName, color: "#a6e22e" },
  { tag: tags.propertyName, color: "#a6e22e" },
  { tag: tags.operator, color: "#f92672" },
  { tag: tags.punctuation, color: "#f8f8f2" },
  { tag: tags.className, color: "#a6e22e" },
  { tag: tags.regexp, color: "#e6db74" },
  { tag: tags.tagName, color: "#f92672" },
  { tag: tags.attributeName, color: "#a6e22e" },
  { tag: tags.variableName, color: "#f8f8f2" },
  { tag: tags.atom, color: "#ae81ff" },
  { tag: tags.meta, color: "#f8f8f2" },
  { tag: tags.self, color: "#f92672" },
]);

// Solarized Dark
const solarizedDarkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#859900" },
  { tag: tags.comment, color: "#586e75", fontStyle: "italic" },
  { tag: tags.string, color: "#2aa198" },
  { tag: tags.number, color: "#d33682" },
  { tag: tags.bool, color: "#d33682" },
  { tag: tags.null, color: "#d33682" },
  { tag: tags.function(tags.variableName), color: "#268bd2" },
  { tag: tags.definition(tags.variableName), color: "#cb4b16" },
  { tag: tags.typeName, color: "#b58900" },
  { tag: tags.propertyName, color: "#268bd2" },
  { tag: tags.operator, color: "#859900" },
  { tag: tags.punctuation, color: "#839496" },
  { tag: tags.className, color: "#b58900" },
  { tag: tags.regexp, color: "#dc322f" },
  { tag: tags.tagName, color: "#268bd2" },
  { tag: tags.attributeName, color: "#b58900" },
  { tag: tags.variableName, color: "#839496" },
  { tag: tags.atom, color: "#d33682" },
  { tag: tags.meta, color: "#839496" },
  { tag: tags.self, color: "#cb4b16" },
]);

const syntaxHighlightById: Record<
  SyntaxThemeId,
  ReturnType<typeof HighlightStyle.define>
> = {
  "one-dark": oneDarkHighlight,
  "one-light": oneLightHighlight,
  dracula: draculaHighlight,
  "github-light": githubLightHighlight,
  monokai: monokaiHighlight,
  "solarized-dark": solarizedDarkHighlight,
};

/** Full editor theme: UI (light/dark) + syntax highlighting. */
export function getEditorTheme(
  uiTheme: UiTheme,
  syntaxThemeId: SyntaxThemeId,
): Extension[] {
  const isDark = uiTheme === "dark";
  const highlight = syntaxHighlightById[syntaxThemeId];
  return [baseEditorTheme(isDark), syntaxHighlighting(highlight)];
}
