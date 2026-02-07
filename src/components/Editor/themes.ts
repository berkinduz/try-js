import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ============================================
// Shared editor base styles (used by both themes)
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
        fontFamily: "var(--font-mono)",
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
      ".cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--editor-selection) !important",
      },
      ".cm-cursor": {
        borderLeftColor: "var(--accent)",
      },
      ".cm-matchingBracket": {
        backgroundColor: "var(--editor-bracket-match)",
        outline: "1px solid var(--accent)",
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
    { dark: isDark }
  );
}

// ============================================
// LIGHT THEME
// ============================================
const lightHighlight = HighlightStyle.define([
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

export const lightTheme = [
  baseEditorTheme(false),
  syntaxHighlighting(lightHighlight),
];

// ============================================
// DARK THEME - One Dark inspired syntax colors
// (no oneDark import - we own the entire theme)
// ============================================
const darkHighlight = HighlightStyle.define([
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

export const darkTheme = [
  baseEditorTheme(true),
  syntaxHighlighting(darkHighlight),
];
