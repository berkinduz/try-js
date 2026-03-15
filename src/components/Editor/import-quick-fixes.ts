/**
 * Import Quick Fixes for the TryJS editor.
 *
 * Detects undefined identifiers in JS/TS/JSX code and offers
 * VS Code-like lightbulb quick fixes to auto-import them from
 * known npm packages or React.
 *
 * Uses CodeMirror's @codemirror/lint to show diagnostics with
 * actionable fixes that insert the correct import statement.
 */

import { linter } from "@codemirror/lint";
import type { Diagnostic, Action } from "@codemirror/lint";
import type { EditorView } from "@codemirror/view";

// ---------------------------------------------------------------------------
// Import knowledge base
// ---------------------------------------------------------------------------

interface ImportSuggestion {
  /** The module specifier (e.g. "react", "lodash") */
  module: string;
  /** If true, use `import name from "module"` */
  isDefault?: boolean;
  /** If true, use `import * as name from "module"` */
  isNamespace?: boolean;
  /** Override the imported name if different from the identifier */
  importName?: string;
  /** Description shown in the quick fix */
  description?: string;
}

/**
 * Maps identifier names to their import suggestions.
 * An identifier can have multiple possible imports.
 */
const IMPORT_MAP: Record<string, ImportSuggestion[]> = {
  // --- React hooks & API ---
  useState: [{ module: "react", description: "React hook" }],
  useEffect: [{ module: "react", description: "React hook" }],
  useRef: [{ module: "react", description: "React hook" }],
  useMemo: [{ module: "react", description: "React hook" }],
  useCallback: [{ module: "react", description: "React hook" }],
  useContext: [{ module: "react", description: "React hook" }],
  useReducer: [{ module: "react", description: "React hook" }],
  useLayoutEffect: [{ module: "react", description: "React hook" }],
  useId: [{ module: "react", description: "React hook" }],
  useTransition: [{ module: "react", description: "React hook" }],
  useDeferredValue: [{ module: "react", description: "React hook" }],
  useImperativeHandle: [{ module: "react", description: "React hook" }],
  useDebugValue: [{ module: "react", description: "React hook" }],
  useSyncExternalStore: [{ module: "react", description: "React hook" }],
  createContext: [{ module: "react", description: "React API" }],
  createRef: [{ module: "react", description: "React API" }],
  forwardRef: [{ module: "react", description: "React API" }],
  memo: [{ module: "react", description: "React API" }],
  lazy: [{ module: "react", description: "React API" }],
  Suspense: [{ module: "react", description: "React component" }],
  Fragment: [{ module: "react", description: "React component" }],
  StrictMode: [{ module: "react", description: "React component" }],
  Component: [{ module: "react", description: "React class" }],
  PureComponent: [{ module: "react", description: "React class" }],
  createElement: [{ module: "react", description: "React API" }],
  cloneElement: [{ module: "react", description: "React API" }],
  isValidElement: [{ module: "react", description: "React API" }],
  Children: [{ module: "react", description: "React.Children" }],
  React: [{ module: "react", isDefault: true, description: "React library" }],
  ReactDOM: [{ module: "react-dom", isDefault: true, description: "React DOM" }],

  // --- Popular npm packages (default imports) ---
  _: [{ module: "lodash", isDefault: true, description: "Lodash utility library" }],
  lodash: [{ module: "lodash", isDefault: true, importName: "_", description: "Lodash utility library" }],
  axios: [{ module: "axios", isDefault: true, description: "HTTP client" }],
  dayjs: [{ module: "dayjs", isDefault: true, description: "Date library" }],
  moment: [{ module: "moment", isDefault: true, description: "Date library" }],
  chalk: [{ module: "chalk", isDefault: true, description: "Terminal styling" }],
  Chance: [{ module: "chance", isDefault: true, description: "Random data generator" }],

  // --- Popular npm packages (named imports) ---
  z: [{ module: "zod", description: "Schema validation" }],
  v4: [{ module: "uuid", description: "UUID v4 generator" }],
  nanoid: [{ module: "nanoid", description: "Tiny ID generator" }],
  marked: [{ module: "marked", description: "Markdown parser" }],
  confetti: [{ module: "canvas-confetti", isDefault: true, description: "Confetti animation" }],
  gsap: [{ module: "gsap", isDefault: true, description: "Animation library" }],
  p5: [{ module: "p5", isDefault: true, description: "Creative coding" }],
  mitt: [{ module: "mitt", isDefault: true, description: "Event emitter" }],
  Fuse: [{ module: "fuse.js", isDefault: true, description: "Fuzzy search" }],
  immer: [{ module: "immer", isDefault: true, description: "Immutable state" }],
  produce: [{ module: "immer", description: "Immutable state helper" }],
  Tone: [{ module: "tone", isNamespace: true, description: "Web Audio framework" }],

  // --- date-fns ---
  format: [{ module: "date-fns", description: "Format date" }],
  parseISO: [{ module: "date-fns", description: "Parse ISO date" }],
  addDays: [{ module: "date-fns", description: "Add days to date" }],
  subDays: [{ module: "date-fns", description: "Subtract days" }],
  differenceInDays: [{ module: "date-fns", description: "Days between dates" }],
  isAfter: [{ module: "date-fns", description: "Date comparison" }],
  isBefore: [{ module: "date-fns", description: "Date comparison" }],

  // --- Ramda ---
  R: [{ module: "ramda", isNamespace: true, description: "Functional library" }],

  // --- RxJS ---
  Observable: [{ module: "rxjs", description: "RxJS Observable" }],
  Subject: [{ module: "rxjs", description: "RxJS Subject" }],
  BehaviorSubject: [{ module: "rxjs", description: "RxJS BehaviorSubject" }],
  of: [{ module: "rxjs", description: "RxJS observable creator" }],
  from: [{ module: "rxjs", description: "RxJS observable creator" }],
  map: [
    { module: "rxjs/operators", description: "RxJS operator" },
  ],
  filter: [
    { module: "rxjs/operators", description: "RxJS operator" },
  ],
  pipe: [{ module: "rxjs", description: "RxJS pipe" }],

  // --- Three.js ---
  THREE: [{ module: "three", isNamespace: true, description: "3D graphics" }],
  Scene: [{ module: "three", description: "Three.js Scene" }],
  PerspectiveCamera: [{ module: "three", description: "Three.js camera" }],
  WebGLRenderer: [{ module: "three", description: "Three.js renderer" }],
  BoxGeometry: [{ module: "three", description: "Three.js geometry" }],
  MeshBasicMaterial: [{ module: "three", description: "Three.js material" }],
  Mesh: [{ module: "three", description: "Three.js mesh" }],

  // --- D3 ---
  d3: [{ module: "d3", isNamespace: true, description: "Data visualization" }],

  // --- Zod ---
  ZodSchema: [{ module: "zod", description: "Zod schema type" }],

  // --- chart.js ---
  Chart: [{ module: "chart.js/auto", isDefault: true, description: "Chart library" }],

  // --- Color libraries ---
  chroma: [{ module: "chroma-js", isDefault: true, description: "Color manipulation" }],
  Color: [{ module: "color", isDefault: true, description: "Color conversion" }],

  // --- Math libraries ---
  math: [{ module: "mathjs", isNamespace: true, description: "Math library" }],
  Decimal: [{ module: "decimal.js", isDefault: true, description: "Decimal arithmetic" }],
  Big: [{ module: "big.js", isDefault: true, description: "Arbitrary precision" }],

  // --- Parsers ---
  Papa: [{ module: "papaparse", isDefault: true, description: "CSV parser" }],
  YAML: [{ module: "js-yaml", isDefault: true, description: "YAML parser" }],
  TOML: [{ module: "toml", isDefault: true, description: "TOML parser" }],

  // --- Luxon ---
  DateTime: [{ module: "luxon", description: "Luxon DateTime" }],
  Duration: [{ module: "luxon", description: "Luxon Duration" }],
  Interval: [{ module: "luxon", description: "Luxon Interval" }],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if an identifier is already imported in the source code. */
function isAlreadyImported(source: string, identifier: string): boolean {
  // Quick check: does any import line mention this identifier?
  const importRegex = new RegExp(
    `import\\s+(?:` +
    // default import: import X from
    `${escapeRegex(identifier)}\\s+from|` +
    // namespace import: import * as X from
    `\\*\\s+as\\s+${escapeRegex(identifier)}\\s+from|` +
    // named import: import { ..., X, ... } from  or  import { X } from
    `\\{[^}]*\\b${escapeRegex(identifier)}\\b[^}]*\\}\\s+from` +
    `)`,
  );
  return importRegex.test(source);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build the import statement string.
 */
function buildImportStatement(
  identifier: string,
  suggestion: ImportSuggestion,
): string {
  const name = suggestion.importName || identifier;
  const mod = suggestion.module;

  if (suggestion.isNamespace) {
    return `import * as ${name} from "${mod}";`;
  }
  if (suggestion.isDefault) {
    return `import ${name} from "${mod}";`;
  }
  return `import { ${name} } from "${mod}";`;
}

/**
 * Find the best position to insert a new import statement.
 * Returns the offset right after the last import statement,
 * or 0 if there are no imports.
 */
function findImportInsertPosition(source: string): number {
  // Find the end of the last import statement
  const importRegex = /^import\s+.+?(?:from\s+)?['"][^'"]*['"];?\s*$/gm;
  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(source)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    return lastMatch.index + lastMatch[0].length;
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Identifier extraction (lightweight, no TS needed)
// ---------------------------------------------------------------------------

/**
 * Extracts identifiers from JS/TS code that could be undefined.
 * Uses a simple regex-based approach to find identifiers that:
 * - Appear as standalone words (not after .)
 * - Are not declared locally (const/let/var/function/class)
 * - Are not in import statements
 * - Are not standard globals
 */

const STANDARD_GLOBALS = new Set([
  // JS built-ins
  "undefined", "null", "true", "false", "NaN", "Infinity",
  "console", "Math", "JSON", "Object", "Array", "String", "Number",
  "Boolean", "Symbol", "BigInt", "Date", "RegExp", "Error", "TypeError",
  "RangeError", "SyntaxError", "ReferenceError", "URIError", "EvalError",
  "Map", "Set", "WeakMap", "WeakSet", "WeakRef", "Promise",
  "Proxy", "Reflect", "ArrayBuffer", "DataView",
  "Int8Array", "Uint8Array", "Int16Array", "Uint16Array",
  "Int32Array", "Uint32Array", "Float32Array", "Float64Array",
  "Function", "Generator", "AsyncGenerator",
  // Global functions
  "parseInt", "parseFloat", "isNaN", "isFinite",
  "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI",
  "eval", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame", "queueMicrotask",
  "structuredClone", "atob", "btoa", "fetch", "alert", "confirm", "prompt",
  // DOM
  "document", "window", "self", "globalThis", "performance",
  "navigator", "location", "history", "localStorage", "sessionStorage",
  "URL", "URLSearchParams", "Headers", "Request", "Response",
  "FormData", "Blob", "File", "FileReader", "FileList",
  "Event", "CustomEvent", "MouseEvent", "KeyboardEvent",
  "HTMLElement", "Element", "Node", "NodeList",
  "MutationObserver", "IntersectionObserver", "ResizeObserver",
  "AbortController", "AbortSignal",
  "TextEncoder", "TextDecoder",
  "WebSocket", "EventSource", "Worker", "SharedWorker",
  "Intl", "Screen",
  // JS keywords
  "if", "else", "for", "while", "do", "switch", "case", "break",
  "continue", "return", "throw", "try", "catch", "finally",
  "new", "delete", "typeof", "instanceof", "void", "in", "of",
  "this", "super", "class", "extends", "function", "var", "let", "const",
  "import", "export", "default", "from", "as", "async", "await",
  "yield", "static", "get", "set", "with", "debugger",
  "type", "interface", "enum", "namespace", "declare", "abstract",
  "implements", "readonly", "private", "protected", "public",
  "any", "unknown", "never", "string", "number", "boolean", "object",
  "keyof", "infer", "extends", "satisfies",
  // Common patterns
  "arguments", "module", "exports", "require", "process", "__dirname", "__filename",
  // Common short names that shouldn't trigger
  "i", "j", "k", "x", "y", "n", "e", "el", "fn", "cb", "err", "res",
  "req", "val", "key", "idx", "len", "str", "num", "obj", "arr",
  "a", "b", "c", "d", "f", "g", "h", "m", "p", "q", "r", "s", "t", "u", "v", "w",
]);

interface IdentifierLocation {
  name: string;
  from: number;
  to: number;
  line: number;
}

/**
 * Find identifiers that look like they might be undefined and have
 * an import suggestion available.
 */
function findUndefinedIdentifiers(source: string): IdentifierLocation[] {
  const results: IdentifierLocation[] = [];

  // Collect locally declared identifiers
  const localDecls = new Set<string>();

  // Match declarations: const/let/var name, function name, class name
  const declRegex = /(?:const|let|var)\s+(?:\{([^}]+)\}|\[([^\]]+)\]|(\w+))|(?:function\*?\s+(\w+))|(?:class\s+(\w+))/g;
  let declMatch: RegExpExecArray | null;
  while ((declMatch = declRegex.exec(source)) !== null) {
    // Destructured object
    if (declMatch[1]) {
      for (const part of declMatch[1].split(",")) {
        const name = part.split(":").pop()!.split("=")[0].trim();
        if (name) localDecls.add(name);
      }
    }
    // Destructured array
    else if (declMatch[2]) {
      for (const part of declMatch[2].split(",")) {
        const name = part.split("=")[0].trim();
        if (name && name !== "...") localDecls.add(name.replace("...", ""));
      }
    }
    // Simple declaration or function/class name
    else {
      const name = declMatch[3] || declMatch[4] || declMatch[5];
      if (name) localDecls.add(name);
    }
  }

  // Match parameter names in arrow functions and function declarations
  const paramRegex = /(?:\(([^)]*)\)\s*(?:=>|{))|(?:(\w+)\s*=>)/g;
  let paramMatch: RegExpExecArray | null;
  while ((paramMatch = paramRegex.exec(source)) !== null) {
    const params = paramMatch[1] || paramMatch[2] || "";
    for (const param of params.split(",")) {
      // Handle destructured params, default values, type annotations
      const cleaned = param.split(":")[0].split("=")[0].replace(/[{}\[\]\.]/g, " ").trim();
      for (const name of cleaned.split(/\s+/)) {
        const n = name.replace("...", "");
        if (n && /^\w+$/.test(n)) localDecls.add(n);
      }
    }
  }

  // Also collect import bindings
  const importBindingRegex = /import\s+(?:(\w+)|(\*\s+as\s+(\w+))|(?:\{([^}]+)\}))\s+from/g;
  let importMatch: RegExpExecArray | null;
  while ((importMatch = importBindingRegex.exec(source)) !== null) {
    if (importMatch[1]) localDecls.add(importMatch[1]);
    if (importMatch[3]) localDecls.add(importMatch[3]);
    if (importMatch[4]) {
      for (const part of importMatch[4].split(",")) {
        const asMatch = part.trim().match(/(?:\w+\s+as\s+)?(\w+)/);
        if (asMatch?.[1]) localDecls.add(asMatch[1]);
      }
    }
  }

  // Now find identifier usages that could be undefined
  // Match word boundaries but not after . (property access), not in strings/comments
  const lines = source.split("\n");
  let offset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Skip import lines, comments
    if (trimmed.startsWith("import ") || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      offset += line.length + 1;
      continue;
    }

    // Find identifiers in this line
    const identRegex = /\b([A-Z_$][\w$]*)\b/g;
    let identMatch: RegExpExecArray | null;

    while ((identMatch = identRegex.exec(line)) !== null) {
      const name = identMatch[1];
      const charBefore = identMatch.index > 0 ? line[identMatch.index - 1] : "";

      // Skip if after a dot (property access)
      if (charBefore === ".") continue;

      // Skip if it's a declaration keyword position
      const beforeText = line.slice(0, identMatch.index).trim();
      if (beforeText.endsWith("const") || beforeText.endsWith("let") || beforeText.endsWith("var") ||
          beforeText.endsWith("function") || beforeText.endsWith("class") || beforeText.endsWith("type") ||
          beforeText.endsWith("interface") || beforeText.endsWith("enum")) continue;

      // Skip standard globals, local declarations, and short names
      if (STANDARD_GLOBALS.has(name)) continue;
      if (localDecls.has(name)) continue;

      // Check if we have an import suggestion for this identifier
      if (!IMPORT_MAP[name]) continue;

      // Skip if already imported
      if (isAlreadyImported(source, name)) continue;

      // Skip identifiers inside string literals (simple heuristic)
      const beforeStr = line.slice(0, identMatch.index);
      const singleQuotes = (beforeStr.match(/'/g) || []).length;
      const doubleQuotes = (beforeStr.match(/"/g) || []).length;
      const backticks = (beforeStr.match(/`/g) || []).length;
      if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) continue;

      results.push({
        name,
        from: offset + identMatch.index,
        to: offset + identMatch.index + name.length,
        line: lineIdx + 1,
      });
    }

    offset += line.length + 1;
  }

  // Deduplicate by name (only show first occurrence)
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });
}

// ---------------------------------------------------------------------------
// CodeMirror Lint Source
// ---------------------------------------------------------------------------

function applyImportFix(
  view: EditorView,
  identifier: string,
  suggestion: ImportSuggestion,
) {
  const source = view.state.doc.toString();
  const importStatement = buildImportStatement(identifier, suggestion);

  // Find where to insert
  const insertPos = findImportInsertPosition(source);

  let insertText: string;
  if (insertPos === 0) {
    // No existing imports — insert at top with trailing newline
    insertText = importStatement + "\n";
  } else {
    // After existing imports — insert on new line
    insertText = "\n" + importStatement;
  }

  view.dispatch({
    changes: { from: insertPos, to: insertPos, insert: insertText },
  });
}

/**
 * CodeMirror linter extension that detects undefined identifiers
 * with available import suggestions and provides quick-fix actions.
 */
export const importQuickFixLinter = linter(
  (view) => {
    const source = view.state.doc.toString();
    if (!source.trim()) return [];

    const undefinedIdents = findUndefinedIdentifiers(source);
    const diagnostics: Diagnostic[] = [];

    for (const ident of undefinedIdents) {
      const suggestions = IMPORT_MAP[ident.name];
      if (!suggestions || suggestions.length === 0) continue;

      const actions: Action[] = suggestions.map((suggestion) => {
        const importStmt = buildImportStatement(ident.name, suggestion);
        return {
          name: `Add ${importStmt}`,
          apply(view: EditorView) {
            applyImportFix(view, ident.name, suggestion);
          },
        };
      });

      diagnostics.push({
        from: ident.from,
        to: ident.to,
        severity: "info",
        message: `'${ident.name}' is not imported. Did you mean to import it?`,
        actions,
      });
    }

    return diagnostics;
  },
  {
    delay: 800,
  },
);
