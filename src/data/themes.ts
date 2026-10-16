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
