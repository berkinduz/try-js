import type { Plugin } from "prettier";

export type FormatLanguage = "javascript" | "typescript" | "jsx" | "html" | "css";

const pluginLoaders = {
  babel: () => import("prettier/plugins/babel"),
  estree: () => import("prettier/plugins/estree"),
  typescript: () => import("prettier/plugins/typescript"),
  html: () => import("prettier/plugins/html"),
  postcss: () => import("prettier/plugins/postcss"),
};
type PluginName = keyof typeof pluginLoaders;
const plugins = new Map<PluginName, Promise<Plugin>>();
let standalone: Promise<typeof import("prettier/standalone")> | undefined;

class FormatterLoadError extends Error {}

function loadStandalone() {
  return standalone ??= import("prettier/standalone").catch(() => {
    standalone = undefined;
    throw new FormatterLoadError();
  });
}

function loadPlugin(name: PluginName): Promise<Plugin> {
  let pending = plugins.get(name);
  if (!pending) {
    pending = pluginLoaders[name]().catch(() => {
      plugins.delete(name);
      throw new FormatterLoadError();
    });
    plugins.set(name, pending);
  }
  return pending;
}

/** Load the standalone formatter and only the parsers used by this document. */
export async function formatCode(source: string, language: FormatLanguage, positions: readonly number[]) {
  const names: PluginName[] = language === "html" ? ["html"]
    : language === "css" ? ["postcss"]
    : [language === "typescript" ? "typescript" : "babel", "estree"];
  if (language === "html") {
    if (/<script\b/i.test(source)) names.push("babel", "estree");
    if (/<style\b/i.test(source)) names.push("postcss");
    if (/<script\b[^>]*\b(?:lang|type)\s*=\s*["']?(?:ts\b|tsx\b|typescript\b|text\/typescript\b)/i.test(source)) {
      names.push("typescript");
    }
  }
  const [prettier, loadedPlugins] = await Promise.all([
    loadStandalone(), Promise.all([...new Set(names)].map(loadPlugin)),
  ]);
  const offsets = [...new Set(positions.length ? positions : [0])];
  const results = await Promise.all(offsets.map((cursorOffset) => prettier.formatWithCursor(source, {
    parser: language === "javascript" || language === "jsx" ? "babel" : language,
    plugins: loadedPlugins,
    cursorOffset,
    endOfLine: "lf",
    // HTML's script/style parsers are loaded above; unrelated tagged templates stay as written.
    embeddedLanguageFormatting: language === "html" ? "auto" : "off",
  })));
  const formatted = results[0].formatted;
  const mapped = new Map(offsets.map((offset, index) => [offset,
    Math.max(0, Math.min(formatted.length, results[index].cursorOffset)),
  ]));
  return { formatted, positions: positions.map((offset) => mapped.get(offset)!) };
}

export function formatErrorMessage(cause: unknown): string {
  if (cause instanceof FormatterLoadError) {
    return "Could not load the formatter. Check your connection and reload to try again.";
  }
  const line = (cause as { loc?: { start?: { line?: number } } } | null)?.loc?.start?.line;
  return `Could not format this code. Check the syntax${typeof line === "number" ? ` near line ${line}` : ""}. Your code has not been changed.`;
}
