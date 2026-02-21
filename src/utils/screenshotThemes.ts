import type { SyntaxThemeId } from "../components/Editor/themes";

export interface ThemeColors {
  bg: string;
  fg: string;
  keyword: string;
  comment: string;
  string: string;
  number: string;
  bool: string;
  function: string;
  definition: string;
  typeName: string;
  propertyName: string;
  operator: string;
  punctuation: string;
  className: string;
  regexp: string;
  variableName: string;
}

/**
 * Hex color maps for each syntax theme, used for canvas-based screenshot rendering.
 * Values are extracted from the HighlightStyle definitions in themes.ts.
 * Backgrounds are canonical theme backgrounds (not the TryJS editor CSS variable values).
 */
export const SCREENSHOT_THEMES: Record<SyntaxThemeId, ThemeColors> = {
  "one-dark": {
    bg: "#282c34",
    fg: "#abb2bf",
    keyword: "#c678dd",
    comment: "#5c6370",
    string: "#98c379",
    number: "#d19a66",
    bool: "#d19a66",
    function: "#61afef",
    definition: "#e06c75",
    typeName: "#e5c07b",
    propertyName: "#e06c75",
    operator: "#56b6c2",
    punctuation: "#abb2bf",
    className: "#e5c07b",
    regexp: "#98c379",
    variableName: "#abb2bf",
  },
  "one-light": {
    bg: "#fafafa",
    fg: "#383a42",
    keyword: "#a626a4",
    comment: "#a0a1a7",
    string: "#50a14f",
    number: "#986801",
    bool: "#986801",
    function: "#4078f2",
    definition: "#e45649",
    typeName: "#0184bc",
    propertyName: "#e45649",
    operator: "#0184bc",
    punctuation: "#383a42",
    className: "#c18401",
    regexp: "#50a14f",
    variableName: "#383a42",
  },
  dracula: {
    bg: "#282a36",
    fg: "#f8f8f2",
    keyword: "#ff79c6",
    comment: "#6272a4",
    string: "#f1fa8c",
    number: "#bd93f9",
    bool: "#bd93f9",
    function: "#50fa7b",
    definition: "#ff79c6",
    typeName: "#8be9fd",
    propertyName: "#50fa7b",
    operator: "#ff79c6",
    punctuation: "#f8f8f2",
    className: "#8be9fd",
    regexp: "#f1fa8c",
    variableName: "#f8f8f2",
  },
  "github-light": {
    bg: "#ffffff",
    fg: "#24292e",
    keyword: "#d73a49",
    comment: "#6a737d",
    string: "#032f62",
    number: "#005cc5",
    bool: "#005cc5",
    function: "#6f42c1",
    definition: "#24292e",
    typeName: "#22863a",
    propertyName: "#005cc5",
    operator: "#d73a49",
    punctuation: "#24292e",
    className: "#6f42c1",
    regexp: "#032f62",
    variableName: "#24292e",
  },
  monokai: {
    bg: "#272822",
    fg: "#f8f8f2",
    keyword: "#f92672",
    comment: "#75715e",
    string: "#e6db74",
    number: "#ae81ff",
    bool: "#ae81ff",
    function: "#a6e22e",
    definition: "#f92672",
    typeName: "#a6e22e",
    propertyName: "#a6e22e",
    operator: "#f92672",
    punctuation: "#f8f8f2",
    className: "#a6e22e",
    regexp: "#e6db74",
    variableName: "#f8f8f2",
  },
  "solarized-dark": {
    bg: "#002b36",
    fg: "#839496",
    keyword: "#859900",
    comment: "#586e75",
    string: "#2aa198",
    number: "#d33682",
    bool: "#d33682",
    function: "#268bd2",
    definition: "#cb4b16",
    typeName: "#b58900",
    propertyName: "#268bd2",
    operator: "#859900",
    punctuation: "#839496",
    className: "#b58900",
    regexp: "#dc322f",
    variableName: "#839496",
  },
};
