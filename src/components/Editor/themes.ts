import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";

const lightEditorTheme = EditorView.theme(
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
      color: "var(--editor-fg)",
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
      color: "#fff",
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
  },
  { dark: false }
);

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

export const lightTheme = [lightEditorTheme, syntaxHighlighting(lightHighlight)];

const darkEditorTheme = EditorView.theme(
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
    },
    ".cm-activeLine": {
      backgroundColor: "var(--editor-active-line)",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--accent)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--editor-selection) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--editor-selection) !important",
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
  },
  { dark: true }
);

// oneDark first for syntax highlighting, then our override theme on top
export const darkTheme = [oneDark, darkEditorTheme];
