/**
 * Rich code-completion sources for the TryJS editor.
 *
 * Provides:
 *  - Snippet completions (fn, cl, imp, tc, fore, map …)
 *  - Global JS API dot-access completions (console., Math., JSON. …)
 *  - Keyword completions with boost
 *  - React/JSX completions (hooks, attributes)
 *  - npm package import suggestions
 */

import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { snippetCompletion } from "@codemirror/autocomplete";

// ---------------------------------------------------------------------------
// Snippet completions
// ---------------------------------------------------------------------------

const SNIPPETS: Completion[] = [
  snippetCompletion("console.log(${expr})", {
    label: "cl",
    detail: "console.log(…)",
    type: "snippet",
    boost: 2,
  }),
  snippetCompletion("console.log('${label}:', ${expr})", {
    label: "cll",
    detail: "console.log('label:', …)",
    type: "snippet",
  }),
  snippetCompletion("console.error(${expr})", {
    label: "ce",
    detail: "console.error(…)",
    type: "snippet",
  }),
  snippetCompletion("console.warn(${expr})", {
    label: "cw",
    detail: "console.warn(…)",
    type: "snippet",
  }),
  snippetCompletion("console.table(${expr})", {
    label: "ct",
    detail: "console.table(…)",
    type: "snippet",
  }),

  // --- Functions ---
  snippetCompletion("function ${name}(${params}) {\n\t${body}\n}", {
    label: "fn",
    detail: "function declaration",
    type: "snippet",
    boost: 1,
  }),
  snippetCompletion("async function ${name}(${params}) {\n\t${body}\n}", {
    label: "afn",
    detail: "async function",
    type: "snippet",
  }),
  snippetCompletion("const ${name} = (${params}) => {\n\t${body}\n};", {
    label: "arr",
    detail: "arrow function",
    type: "snippet",
    boost: 1,
  }),
  snippetCompletion("const ${name} = (${params}) => ${expr};", {
    label: "arre",
    detail: "arrow fn (expression)",
    type: "snippet",
  }),
  snippetCompletion(
    "const ${name} = async (${params}) => {\n\t${body}\n};",
    {
      label: "aarr",
      detail: "async arrow function",
      type: "snippet",
    },
  ),

  // --- Control flow ---
  snippetCompletion("if (${condition}) {\n\t${body}\n}", {
    label: "ife",
    detail: "if statement",
    type: "snippet",
  }),
  snippetCompletion(
    "if (${condition}) {\n\t${then}\n} else {\n\t${otherwise}\n}",
    {
      label: "ifel",
      detail: "if / else",
      type: "snippet",
    },
  ),
  snippetCompletion(
    "switch (${expr}) {\n\tcase ${value}:\n\t\t${body}\n\t\tbreak;\n\tdefault:\n\t\t${defaultBody}\n}",
    {
      label: "sw",
      detail: "switch / case",
      type: "snippet",
    },
  ),
  snippetCompletion(
    "try {\n\t${body}\n} catch (${err}) {\n\t${handler}\n}",
    {
      label: "tc",
      detail: "try / catch",
      type: "snippet",
    },
  ),
  snippetCompletion(
    "try {\n\t${body}\n} catch (${err}) {\n\t${handler}\n} finally {\n\t${cleanup}\n}",
    {
      label: "tcf",
      detail: "try / catch / finally",
      type: "snippet",
    },
  ),

  // --- Loops ---
  snippetCompletion("for (let ${i} = 0; ${i} < ${length}; ${i}++) {\n\t${body}\n}", {
    label: "fori",
    detail: "for (index loop)",
    type: "snippet",
  }),
  snippetCompletion("for (const ${item} of ${iterable}) {\n\t${body}\n}", {
    label: "forof",
    detail: "for…of loop",
    type: "snippet",
  }),
  snippetCompletion("for (const ${key} in ${obj}) {\n\t${body}\n}", {
    label: "forin",
    detail: "for…in loop",
    type: "snippet",
  }),
  snippetCompletion("${arr}.forEach((${item}) => {\n\t${body}\n});", {
    label: "fore",
    detail: ".forEach(…)",
    type: "snippet",
  }),

  // --- Array methods ---
  snippetCompletion("${arr}.map((${item}) => ${expr})", {
    label: "map",
    detail: ".map(…)",
    type: "snippet",
  }),
  snippetCompletion("${arr}.filter((${item}) => ${condition})", {
    label: "fil",
    detail: ".filter(…)",
    type: "snippet",
  }),
  snippetCompletion("${arr}.reduce((${acc}, ${item}) => ${expr}, ${init})", {
    label: "red",
    detail: ".reduce(…)",
    type: "snippet",
  }),
  snippetCompletion("${arr}.find((${item}) => ${condition})", {
    label: "find",
    detail: ".find(…)",
    type: "snippet",
  }),
  snippetCompletion("${arr}.some((${item}) => ${condition})", {
    label: "some",
    detail: ".some(…)",
    type: "snippet",
  }),
  snippetCompletion("${arr}.every((${item}) => ${condition})", {
    label: "every",
    detail: ".every(…)",
    type: "snippet",
  }),

  // --- Import / export ---
  snippetCompletion('import ${name} from "${module}";', {
    label: "imp",
    detail: "import default",
    type: "snippet",
    boost: 1,
  }),
  snippetCompletion('import { ${name} } from "${module}";', {
    label: "imn",
    detail: "import named",
    type: "snippet",
  }),
  snippetCompletion('import * as ${name} from "${module}";', {
    label: "ima",
    detail: "import * as",
    type: "snippet",
  }),
  snippetCompletion("export default ${expr};", {
    label: "expd",
    detail: "export default",
    type: "snippet",
  }),
  snippetCompletion("export const ${name} = ${expr};", {
    label: "expn",
    detail: "export const",
    type: "snippet",
  }),

  // --- Async ---
  snippetCompletion(
    "new Promise((resolve, reject) => {\n\t${body}\n})",
    {
      label: "prom",
      detail: "new Promise(…)",
      type: "snippet",
    },
  ),
  snippetCompletion(
    "const ${res} = await fetch(${url});\nconst ${data} = await ${res}.json();",
    {
      label: "fet",
      detail: "fetch + await",
      type: "snippet",
    },
  ),
  snippetCompletion("await Promise.all([${promises}])", {
    label: "pa",
    detail: "Promise.all(…)",
    type: "snippet",
  }),
  snippetCompletion("setTimeout(() => {\n\t${body}\n}, ${ms});", {
    label: "sto",
    detail: "setTimeout(…)",
    type: "snippet",
  }),
  snippetCompletion("setInterval(() => {\n\t${body}\n}, ${ms});", {
    label: "sti",
    detail: "setInterval(…)",
    type: "snippet",
  }),

  // --- Declarations ---
  snippetCompletion("const ${name} = ${value};", {
    label: "co",
    detail: "const …",
    type: "snippet",
  }),
  snippetCompletion("let ${name} = ${value};", {
    label: "le",
    detail: "let …",
    type: "snippet",
  }),
  snippetCompletion("const { ${props} } = ${obj};", {
    label: "dest",
    detail: "destructure object",
    type: "snippet",
  }),
  snippetCompletion("const [${items}] = ${arr};", {
    label: "desta",
    detail: "destructure array",
    type: "snippet",
  }),

  // --- Class ---
  snippetCompletion(
    "class ${Name} {\n\tconstructor(${params}) {\n\t\t${body}\n\t}\n}",
    {
      label: "class",
      detail: "class declaration",
      type: "snippet",
    },
  ),
  snippetCompletion(
    "class ${Name} extends ${Base} {\n\tconstructor(${params}) {\n\t\tsuper(${args});\n\t\t${body}\n\t}\n}",
    {
      label: "classx",
      detail: "class extends",
      type: "snippet",
    },
  ),

  // --- Misc ---
  snippetCompletion("(function () {\n\t${body}\n})();", {
    label: "iife",
    detail: "IIFE",
    type: "snippet",
  }),
  snippetCompletion("typeof ${expr} === '${type}'", {
    label: "tof",
    detail: "typeof check",
    type: "snippet",
  }),
  snippetCompletion("JSON.stringify(${obj}, null, 2)", {
    label: "jstr",
    detail: "JSON.stringify(…, null, 2)",
    type: "snippet",
  }),
  snippetCompletion("JSON.parse(${str})", {
    label: "jpar",
    detail: "JSON.parse(…)",
    type: "snippet",
  }),
  snippetCompletion("Object.keys(${obj})", {
    label: "okeys",
    detail: "Object.keys(…)",
    type: "snippet",
  }),
  snippetCompletion("Object.values(${obj})", {
    label: "ovals",
    detail: "Object.values(…)",
    type: "snippet",
  }),
  snippetCompletion("Object.entries(${obj})", {
    label: "oent",
    detail: "Object.entries(…)",
    type: "snippet",
  }),
];

// ---------------------------------------------------------------------------
// TypeScript-specific snippets
// ---------------------------------------------------------------------------

const TS_SNIPPETS: Completion[] = [
  snippetCompletion("interface ${Name} {\n\t${prop}: ${type};\n}", {
    label: "intf",
    detail: "interface",
    type: "snippet",
  }),
  snippetCompletion("type ${Name} = ${type};", {
    label: "typ",
    detail: "type alias",
    type: "snippet",
  }),
  snippetCompletion("enum ${Name} {\n\t${Member},\n}", {
    label: "enum",
    detail: "enum",
    type: "snippet",
  }),
  snippetCompletion("type ${Name} = \n\t| ${Variant1}\n\t| ${Variant2};", {
    label: "union",
    detail: "union type",
    type: "snippet",
  }),
  snippetCompletion("<${Type}>", {
    label: "gen",
    detail: "generic <T>",
    type: "snippet",
  }),
  snippetCompletion("as ${Type}", {
    label: "as",
    detail: "type assertion",
    type: "snippet",
  }),
];

// ---------------------------------------------------------------------------
// React / JSX snippets
// ---------------------------------------------------------------------------

const REACT_SNIPPETS: Completion[] = [
  snippetCompletion("const [${state}, set${State}] = useState(${initial});", {
    label: "ust",
    detail: "useState",
    type: "snippet",
    boost: 3,
  }),
  snippetCompletion("useEffect(() => {\n\t${body}\n}, [${deps}]);", {
    label: "uef",
    detail: "useEffect",
    type: "snippet",
    boost: 3,
  }),
  snippetCompletion(
    "useEffect(() => {\n\t${body}\n\treturn () => {\n\t\t${cleanup}\n\t};\n}, [${deps}]);",
    {
      label: "uefc",
      detail: "useEffect + cleanup",
      type: "snippet",
    },
  ),
  snippetCompletion("const ${ref} = useRef(${initial});", {
    label: "urf",
    detail: "useRef",
    type: "snippet",
    boost: 2,
  }),
  snippetCompletion("const ${value} = useMemo(() => ${expr}, [${deps}]);", {
    label: "umm",
    detail: "useMemo",
    type: "snippet",
  }),
  snippetCompletion(
    "const ${fn} = useCallback((${params}) => {\n\t${body}\n}, [${deps}]);",
    {
      label: "ucb",
      detail: "useCallback",
      type: "snippet",
    },
  ),
  snippetCompletion("const ${value} = useContext(${Context});", {
    label: "ucx",
    detail: "useContext",
    type: "snippet",
  }),
  snippetCompletion(
    "function ${Component}(${props}) {\n\treturn (\n\t\t<div>\n\t\t\t${children}\n\t\t</div>\n\t);\n}",
    {
      label: "rfc",
      detail: "React function component",
      type: "snippet",
      boost: 2,
    },
  ),
  snippetCompletion(
    "export default function ${Component}(${props}) {\n\treturn (\n\t\t<div>\n\t\t\t${children}\n\t\t</div>\n\t);\n}",
    {
      label: "rfce",
      detail: "React component (export)",
      type: "snippet",
    },
  ),
  snippetCompletion("{${items}.map((${item}) => (\n\t<${Tag} key={${item}.id}>\n\t\t${content}\n\t</${Tag}>\n))}", {
    label: "rmap",
    detail: "JSX .map() list",
    type: "snippet",
  }),
  snippetCompletion("{${condition} && (\n\t${jsx}\n)}", {
    label: "rcond",
    detail: "conditional render (&&)",
    type: "snippet",
  }),
  snippetCompletion("{${condition} ? (\n\t${ifTrue}\n) : (\n\t${ifFalse}\n)}", {
    label: "rtern",
    detail: "conditional render (?:)",
    type: "snippet",
  }),
];

// ---------------------------------------------------------------------------
// Global API dot-completions
// ---------------------------------------------------------------------------

interface MemberInfo {
  name: string;
  type: "method" | "property";
  detail?: string;
  info?: string;
}

const GLOBAL_MEMBERS: Record<string, MemberInfo[]> = {
  console: [
    { name: "log", type: "method", detail: "(...args: any[]): void", info: "Log to console" },
    { name: "warn", type: "method", detail: "(...args: any[]): void", info: "Log warning" },
    { name: "error", type: "method", detail: "(...args: any[]): void", info: "Log error" },
    { name: "info", type: "method", detail: "(...args: any[]): void", info: "Log info" },
    { name: "debug", type: "method", detail: "(...args: any[]): void", info: "Log debug" },
    { name: "table", type: "method", detail: "(...args: any[]): void", info: "Display as table" },
    { name: "clear", type: "method", detail: "(): void", info: "Clear console" },
    { name: "time", type: "method", detail: "(label?: string): void", info: "Start timer" },
    { name: "timeEnd", type: "method", detail: "(label?: string): void", info: "End timer" },
    { name: "timeLog", type: "method", detail: "(label?: string, ...args: any[]): void", info: "Log timer" },
    { name: "dir", type: "method", detail: "(obj: any): void", info: "Display object" },
    { name: "trace", type: "method", detail: "(...args: any[]): void", info: "Stack trace" },
    { name: "group", type: "method", detail: "(...args: any[]): void", info: "Start group" },
    { name: "groupEnd", type: "method", detail: "(): void", info: "End group" },
    { name: "assert", type: "method", detail: "(cond?: boolean, ...args: any[]): void", info: "Assert condition" },
    { name: "count", type: "method", detail: "(label?: string): void", info: "Count calls" },
    { name: "countReset", type: "method", detail: "(label?: string): void", info: "Reset counter" },
  ],
  Math: [
    { name: "abs", type: "method", detail: "(x: number): number", info: "Absolute value" },
    { name: "ceil", type: "method", detail: "(x: number): number", info: "Round up" },
    { name: "floor", type: "method", detail: "(x: number): number", info: "Round down" },
    { name: "round", type: "method", detail: "(x: number): number", info: "Round to nearest" },
    { name: "trunc", type: "method", detail: "(x: number): number", info: "Remove fraction" },
    { name: "max", type: "method", detail: "(...values: number[]): number", info: "Largest value" },
    { name: "min", type: "method", detail: "(...values: number[]): number", info: "Smallest value" },
    { name: "pow", type: "method", detail: "(x: number, y: number): number", info: "x to the power y" },
    { name: "sqrt", type: "method", detail: "(x: number): number", info: "Square root" },
    { name: "cbrt", type: "method", detail: "(x: number): number", info: "Cube root" },
    { name: "random", type: "method", detail: "(): number", info: "Random 0–1" },
    { name: "sign", type: "method", detail: "(x: number): number", info: "Sign of x" },
    { name: "log", type: "method", detail: "(x: number): number", info: "Natural log" },
    { name: "log2", type: "method", detail: "(x: number): number", info: "Base-2 log" },
    { name: "log10", type: "method", detail: "(x: number): number", info: "Base-10 log" },
    { name: "sin", type: "method", detail: "(x: number): number", info: "Sine" },
    { name: "cos", type: "method", detail: "(x: number): number", info: "Cosine" },
    { name: "tan", type: "method", detail: "(x: number): number", info: "Tangent" },
    { name: "hypot", type: "method", detail: "(...values: number[]): number", info: "Hypotenuse" },
    { name: "clz32", type: "method", detail: "(x: number): number", info: "Leading zeros (32-bit)" },
    { name: "imul", type: "method", detail: "(x: number, y: number): number", info: "32-bit multiply" },
    { name: "fround", type: "method", detail: "(x: number): number", info: "Float32 round" },
    { name: "PI", type: "property", detail: "number ≈ 3.14159", info: "π" },
    { name: "E", type: "property", detail: "number ≈ 2.71828", info: "Euler's number" },
    { name: "LN2", type: "property", detail: "number ≈ 0.693", info: "ln(2)" },
    { name: "LN10", type: "property", detail: "number ≈ 2.302", info: "ln(10)" },
    { name: "SQRT2", type: "property", detail: "number ≈ 1.414", info: "√2" },
  ],
  JSON: [
    { name: "parse", type: "method", detail: "(text: string, reviver?: Function): any", info: "Parse JSON string" },
    { name: "stringify", type: "method", detail: "(value: any, replacer?: any, space?: number): string", info: "Convert to JSON string" },
  ],
  Object: [
    { name: "keys", type: "method", detail: "(o: object): string[]", info: "Own property names" },
    { name: "values", type: "method", detail: "(o: object): any[]", info: "Own property values" },
    { name: "entries", type: "method", detail: "(o: object): [string, any][]", info: "Own [key, value] pairs" },
    { name: "assign", type: "method", detail: "(target: object, ...sources: object[]): object", info: "Copy properties" },
    { name: "freeze", type: "method", detail: "<T>(o: T): Readonly<T>", info: "Freeze object" },
    { name: "create", type: "method", detail: "(proto: object, props?: object): object", info: "Create with prototype" },
    { name: "defineProperty", type: "method", detail: "(o: object, p: string, desc: object): object", info: "Define property" },
    { name: "getPrototypeOf", type: "method", detail: "(o: object): object", info: "Get prototype" },
    { name: "hasOwn", type: "method", detail: "(o: object, p: string): boolean", info: "Has own property" },
    { name: "fromEntries", type: "method", detail: "(entries: Iterable): object", info: "Create from entries" },
  ],
  Array: [
    { name: "isArray", type: "method", detail: "(arg: any): arg is any[]", info: "Check if array" },
    { name: "from", type: "method", detail: "<T>(arrayLike: any, mapfn?: Function): T[]", info: "Create from iterable" },
    { name: "of", type: "method", detail: "<T>(...items: T[]): T[]", info: "Create from arguments" },
  ],
  Promise: [
    { name: "all", type: "method", detail: "<T>(values: Promise<T>[]): Promise<T[]>", info: "Wait for all" },
    { name: "allSettled", type: "method", detail: "<T>(values: Promise<T>[]): Promise<SettledResult[]>", info: "Wait for all (no reject)" },
    { name: "any", type: "method", detail: "<T>(values: Promise<T>[]): Promise<T>", info: "First fulfilled" },
    { name: "race", type: "method", detail: "<T>(values: Promise<T>[]): Promise<T>", info: "First settled" },
    { name: "resolve", type: "method", detail: "<T>(value?: T): Promise<T>", info: "Resolved promise" },
    { name: "reject", type: "method", detail: "(reason?: any): Promise<never>", info: "Rejected promise" },
  ],
  Number: [
    { name: "isFinite", type: "method", detail: "(n: any): boolean", info: "Is finite" },
    { name: "isInteger", type: "method", detail: "(n: any): boolean", info: "Is integer" },
    { name: "isNaN", type: "method", detail: "(n: any): boolean", info: "Is NaN" },
    { name: "parseFloat", type: "method", detail: "(s: string): number", info: "Parse float" },
    { name: "parseInt", type: "method", detail: "(s: string, radix?: number): number", info: "Parse int" },
    { name: "MAX_SAFE_INTEGER", type: "property", detail: "number = 2⁵³ - 1" },
    { name: "MIN_SAFE_INTEGER", type: "property", detail: "number = -(2⁵³ - 1)" },
  ],
  String: [
    { name: "fromCharCode", type: "method", detail: "(...codes: number[]): string", info: "From char codes" },
  ],
  document: [
    { name: "getElementById", type: "method", detail: "(id: string): Element | null" },
    { name: "querySelector", type: "method", detail: "(sel: string): Element | null" },
    { name: "querySelectorAll", type: "method", detail: "(sel: string): NodeList" },
    { name: "createElement", type: "method", detail: "(tag: string): Element" },
    { name: "createTextNode", type: "method", detail: "(data: string): Text" },
    { name: "addEventListener", type: "method", detail: "(type: string, listener: Function): void" },
    { name: "removeEventListener", type: "method", detail: "(type: string, listener: Function): void" },
    { name: "body", type: "property", detail: "HTMLBodyElement" },
    { name: "head", type: "property", detail: "HTMLHeadElement" },
    { name: "title", type: "property", detail: "string" },
    { name: "cookie", type: "property", detail: "string" },
    { name: "URL", type: "property", detail: "string" },
    { name: "readyState", type: "property", detail: "string" },
  ],
};

// String/Array instance methods (shown after `.` on values)
const STRING_METHODS: MemberInfo[] = [
  { name: "length", type: "property", detail: "number" },
  { name: "charAt", type: "method", detail: "(i: number): string" },
  { name: "charCodeAt", type: "method", detail: "(i: number): number" },
  { name: "includes", type: "method", detail: "(s: string): boolean" },
  { name: "indexOf", type: "method", detail: "(s: string): number" },
  { name: "lastIndexOf", type: "method", detail: "(s: string): number" },
  { name: "startsWith", type: "method", detail: "(s: string): boolean" },
  { name: "endsWith", type: "method", detail: "(s: string): boolean" },
  { name: "slice", type: "method", detail: "(start?: number, end?: number): string" },
  { name: "substring", type: "method", detail: "(start: number, end?: number): string" },
  { name: "trim", type: "method", detail: "(): string" },
  { name: "trimStart", type: "method", detail: "(): string" },
  { name: "trimEnd", type: "method", detail: "(): string" },
  { name: "toUpperCase", type: "method", detail: "(): string" },
  { name: "toLowerCase", type: "method", detail: "(): string" },
  { name: "split", type: "method", detail: "(sep: string | RegExp): string[]" },
  { name: "replace", type: "method", detail: "(pat: string | RegExp, rep: string): string" },
  { name: "replaceAll", type: "method", detail: "(pat: string, rep: string): string" },
  { name: "match", type: "method", detail: "(regexp: RegExp): RegExpMatchArray | null" },
  { name: "matchAll", type: "method", detail: "(regexp: RegExp): IterableIterator" },
  { name: "repeat", type: "method", detail: "(count: number): string" },
  { name: "padStart", type: "method", detail: "(len: number, fill?: string): string" },
  { name: "padEnd", type: "method", detail: "(len: number, fill?: string): string" },
  { name: "at", type: "method", detail: "(index: number): string | undefined" },
  { name: "concat", type: "method", detail: "(...strings: string[]): string" },
  { name: "search", type: "method", detail: "(regexp: RegExp): number" },
];

const ARRAY_METHODS: MemberInfo[] = [
  { name: "length", type: "property", detail: "number" },
  { name: "push", type: "method", detail: "(...items: T[]): number" },
  { name: "pop", type: "method", detail: "(): T | undefined" },
  { name: "shift", type: "method", detail: "(): T | undefined" },
  { name: "unshift", type: "method", detail: "(...items: T[]): number" },
  { name: "map", type: "method", detail: "<U>(fn: (v: T, i: number) => U): U[]", info: "Transform each element" },
  { name: "filter", type: "method", detail: "(fn: (v: T, i: number) => boolean): T[]", info: "Filter elements" },
  { name: "reduce", type: "method", detail: "<U>(fn: (acc: U, v: T) => U, init: U): U", info: "Reduce to value" },
  { name: "find", type: "method", detail: "(fn: (v: T) => boolean): T | undefined", info: "Find first match" },
  { name: "findIndex", type: "method", detail: "(fn: (v: T) => boolean): number", info: "Find first index" },
  { name: "forEach", type: "method", detail: "(fn: (v: T, i: number) => void): void", info: "Iterate each" },
  { name: "some", type: "method", detail: "(fn: (v: T) => boolean): boolean", info: "Any match?" },
  { name: "every", type: "method", detail: "(fn: (v: T) => boolean): boolean", info: "All match?" },
  { name: "includes", type: "method", detail: "(item: T): boolean", info: "Contains item?" },
  { name: "indexOf", type: "method", detail: "(item: T): number" },
  { name: "lastIndexOf", type: "method", detail: "(item: T): number" },
  { name: "join", type: "method", detail: "(sep?: string): string" },
  { name: "slice", type: "method", detail: "(start?: number, end?: number): T[]" },
  { name: "splice", type: "method", detail: "(start: number, deleteCount?: number, ...items: T[]): T[]" },
  { name: "concat", type: "method", detail: "(...items: (T | T[])[]): T[]" },
  { name: "sort", type: "method", detail: "(cmp?: (a: T, b: T) => number): T[]" },
  { name: "reverse", type: "method", detail: "(): T[]" },
  { name: "flat", type: "method", detail: "(depth?: number): any[]" },
  { name: "flatMap", type: "method", detail: "<U>(fn: (v: T) => U | U[]): U[]" },
  { name: "fill", type: "method", detail: "(value: T, start?: number, end?: number): T[]" },
  { name: "at", type: "method", detail: "(index: number): T | undefined" },
  { name: "entries", type: "method", detail: "(): IterableIterator<[number, T]>" },
  { name: "keys", type: "method", detail: "(): IterableIterator<number>" },
  { name: "values", type: "method", detail: "(): IterableIterator<T>" },
];

const PROMISE_INSTANCE: MemberInfo[] = [
  { name: "then", type: "method", detail: "(onFulfilled, onRejected?): Promise" },
  { name: "catch", type: "method", detail: "(onRejected): Promise" },
  { name: "finally", type: "method", detail: "(onFinally): Promise" },
];

// ---------------------------------------------------------------------------
// npm package suggestions for import statements
// ---------------------------------------------------------------------------

const NPM_PACKAGES: { name: string; detail: string }[] = [
  { name: "lodash", detail: "Utility library" },
  { name: "dayjs", detail: "Lightweight date library" },
  { name: "axios", detail: "HTTP client" },
  { name: "uuid", detail: "UUID generator" },
  { name: "zod", detail: "Schema validation" },
  { name: "date-fns", detail: "Date utility functions" },
  { name: "ramda", detail: "Functional programming" },
  { name: "rxjs", detail: "Reactive extensions" },
  { name: "immer", detail: "Immutable state" },
  { name: "nanoid", detail: "Tiny ID generator" },
  { name: "chalk", detail: "Terminal string styling" },
  { name: "canvas-confetti", detail: "Confetti animation" },
  { name: "three", detail: "3D graphics library" },
  { name: "d3", detail: "Data visualization" },
  { name: "chart.js", detail: "Chart library" },
  { name: "gsap", detail: "Animation library" },
  { name: "anime.js", detail: "Animation engine" },
  { name: "p5", detail: "Creative coding" },
  { name: "pixi.js", detail: "2D rendering engine" },
  { name: "marked", detail: "Markdown parser" },
  { name: "highlight.js", detail: "Syntax highlighting" },
  { name: "prismjs", detail: "Syntax highlighting" },
  { name: "lz-string", detail: "String compression" },
  { name: "mitt", detail: "Tiny event emitter" },
  { name: "idb", detail: "IndexedDB wrapper" },
  { name: "fuse.js", detail: "Fuzzy search" },
  { name: "fast-deep-equal", detail: "Deep equality" },
  { name: "superjson", detail: "JSON with types" },
  { name: "ms", detail: "Time string parser" },
  { name: "sanitize-html", detail: "HTML sanitizer" },
  { name: "dompurify", detail: "XSS sanitizer" },
  { name: "validator", detail: "String validators" },
  { name: "change-case", detail: "Case conversion" },
  { name: "pluralize", detail: "Pluralize words" },
  { name: "color", detail: "Color conversion" },
  { name: "chroma-js", detail: "Color manipulation" },
  { name: "culori", detail: "Color library" },
  { name: "mathjs", detail: "Math library" },
  { name: "decimal.js", detail: "Decimal arithmetic" },
  { name: "big.js", detail: "Arbitrary precision" },
  { name: "papaparse", detail: "CSV parser" },
  { name: "js-yaml", detail: "YAML parser" },
  { name: "toml", detail: "TOML parser" },
  { name: "cheerio", detail: "HTML parser (jQuery-like)" },
  { name: "luxon", detail: "Date/time library" },
  { name: "moment", detail: "Date library (legacy)" },
  { name: "lodash-es", detail: "Lodash ES modules" },
  { name: "underscore", detail: "Utility library" },
  { name: "just-debounce-it", detail: "Debounce function" },
  { name: "just-throttle", detail: "Throttle function" },
  { name: "tinycolor2", detail: "Color manipulation" },
  { name: "seedrandom", detail: "Seeded random" },
  { name: "simplex-noise", detail: "Noise generation" },
  { name: "canvas-sketch-util", detail: "Generative art utils" },
  { name: "tone", detail: "Web Audio framework" },
];

// ---------------------------------------------------------------------------
// JSX attribute completions
// ---------------------------------------------------------------------------

const JSX_ATTRIBUTES: Completion[] = [
  { label: "className", type: "property", detail: "string", boost: 2 },
  { label: "style", type: "property", detail: "CSSProperties" },
  { label: "onClick", type: "property", detail: "(e: MouseEvent) => void", boost: 1 },
  { label: "onChange", type: "property", detail: "(e: ChangeEvent) => void", boost: 1 },
  { label: "onSubmit", type: "property", detail: "(e: FormEvent) => void" },
  { label: "onInput", type: "property", detail: "(e: InputEvent) => void" },
  { label: "onKeyDown", type: "property", detail: "(e: KeyboardEvent) => void" },
  { label: "onKeyUp", type: "property", detail: "(e: KeyboardEvent) => void" },
  { label: "onFocus", type: "property", detail: "(e: FocusEvent) => void" },
  { label: "onBlur", type: "property", detail: "(e: FocusEvent) => void" },
  { label: "onMouseEnter", type: "property", detail: "(e: MouseEvent) => void" },
  { label: "onMouseLeave", type: "property", detail: "(e: MouseEvent) => void" },
  { label: "key", type: "property", detail: "string | number", boost: 1 },
  { label: "ref", type: "property", detail: "Ref<T>" },
  { label: "children", type: "property", detail: "ReactNode" },
  { label: "id", type: "property", detail: "string" },
  { label: "tabIndex", type: "property", detail: "number" },
  { label: "role", type: "property", detail: "string" },
  { label: "aria-label", type: "property", detail: "string" },
  { label: "aria-hidden", type: "property", detail: "boolean" },
  { label: "disabled", type: "property", detail: "boolean" },
  { label: "placeholder", type: "property", detail: "string" },
  { label: "value", type: "property", detail: "string" },
  { label: "defaultValue", type: "property", detail: "string" },
  { label: "checked", type: "property", detail: "boolean" },
  { label: "type", type: "property", detail: "string" },
  { label: "name", type: "property", detail: "string" },
  { label: "href", type: "property", detail: "string" },
  { label: "src", type: "property", detail: "string" },
  { label: "alt", type: "property", detail: "string" },
  { label: "title", type: "property", detail: "string" },
  { label: "htmlFor", type: "property", detail: "string" },
  { label: "autoFocus", type: "property", detail: "boolean" },
  { label: "dangerouslySetInnerHTML", type: "property", detail: "{ __html: string }" },
];

// React hook names for top-level completion
const REACT_HOOKS: Completion[] = [
  { label: "useState", type: "function", detail: "<T>(initial: T): [T, SetState<T>]", info: "State hook", boost: 5 },
  { label: "useEffect", type: "function", detail: "(effect: () => void, deps?: any[]): void", info: "Side effect hook", boost: 5 },
  { label: "useRef", type: "function", detail: "<T>(initial: T): { current: T }", info: "Ref hook", boost: 4 },
  { label: "useMemo", type: "function", detail: "<T>(factory: () => T, deps: any[]): T", info: "Memoize value", boost: 3 },
  { label: "useCallback", type: "function", detail: "<T>(fn: T, deps: any[]): T", info: "Memoize callback", boost: 3 },
  { label: "useContext", type: "function", detail: "<T>(context: Context<T>): T", info: "Context hook", boost: 2 },
  { label: "useReducer", type: "function", detail: "(reducer, initialState): [state, dispatch]", info: "Reducer hook", boost: 2 },
  { label: "useLayoutEffect", type: "function", detail: "(effect: () => void, deps?: any[]): void", info: "Sync effect hook" },
  { label: "useId", type: "function", detail: "(): string", info: "Unique ID hook" },
  { label: "useTransition", type: "function", detail: "(): [boolean, startTransition]", info: "Transition hook" },
  { label: "useDeferredValue", type: "function", detail: "<T>(value: T): T", info: "Deferred value" },
];

// ---------------------------------------------------------------------------
// Completion source: dot-access
// ---------------------------------------------------------------------------

function membersToCompletions(members: MemberInfo[], from: number): CompletionResult {
  return {
    from,
    options: members.map((m) => ({
      label: m.name,
      type: m.type,
      detail: m.detail,
      info: m.info,
    })),
    validFor: /^\w*$/,
  };
}

/**
 * Detects `identifier.` patterns and provides member completions.
 */
function dotAccessCompletion(ctx: CompletionContext): CompletionResult | null {
  // Match `identifier.` optionally followed by a partial member name
  const word = ctx.matchBefore(/(\w+)\.\w*$/);
  if (!word) return null;

  const dotIdx = word.text.indexOf(".");
  const objName = word.text.slice(0, dotIdx);
  const from = word.from + dotIdx + 1;

  // Check known global objects
  const members = GLOBAL_MEMBERS[objName];
  if (members) {
    return membersToCompletions(members, from);
  }

  // Heuristic: try to infer type from common patterns
  const doc = ctx.state.doc.toString();
  const before = doc.slice(0, word.from);

  // Check if variable was declared as a string literal
  const strDeclPattern = new RegExp(
    `(?:const|let|var)\\s+${escapeRegex(objName)}\\s*=\\s*(?:['"\`]|String\\()`,
  );
  if (strDeclPattern.test(before)) {
    return membersToCompletions(STRING_METHODS, from);
  }

  // Check if variable was declared as an array
  const arrDeclPattern = new RegExp(
    `(?:const|let|var)\\s+${escapeRegex(objName)}\\s*=\\s*(?:\\[|Array\\.|new\\s+Array)`,
  );
  if (arrDeclPattern.test(before)) {
    return membersToCompletions(ARRAY_METHODS, from);
  }

  // Check for .then/.catch after Promise or await
  const promDeclPattern = new RegExp(
    `(?:const|let|var)\\s+${escapeRegex(objName)}\\s*=\\s*(?:new\\s+Promise|fetch\\(|Promise\\.)`,
  );
  if (promDeclPattern.test(before)) {
    return membersToCompletions(PROMISE_INSTANCE, from);
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Completion source: npm import
// ---------------------------------------------------------------------------

function npmImportCompletion(ctx: CompletionContext): CompletionResult | null {
  // Match: import ... from "partial  or  import "partial
  const match = ctx.matchBefore(/(?:from\s+|import\s+)['"][\w@./-]*/);
  if (!match) return null;

  const quoteIdx = match.text.search(/['"]/);
  if (quoteIdx === -1) return null;
  const from = match.from + quoteIdx + 1;

  return {
    from,
    options: NPM_PACKAGES.map((pkg) => ({
      label: pkg.name,
      type: "variable",
      detail: pkg.detail,
      boost: -1, // Lower priority than language completions
    })),
    validFor: /^[\w@./-]*$/,
  };
}

// ---------------------------------------------------------------------------
// Completion source: JSX attributes (inside < ... >)
// ---------------------------------------------------------------------------

function jsxAttributeCompletion(ctx: CompletionContext): CompletionResult | null {
  // Check if we are inside a JSX opening tag: < tagName ... cursor
  const line = ctx.state.doc.lineAt(ctx.pos);
  const textBefore = line.text.slice(0, ctx.pos - line.from);

  // Simple heuristic: we're after a `<tagName ` with no closing `>`
  const tagMatch = textBefore.match(/<\w+\s+(?:[^>]*\s)?(\w*)$/);
  if (!tagMatch) return null;

  return {
    from: ctx.pos - tagMatch[1].length,
    options: JSX_ATTRIBUTES,
    validFor: /^\w*$/,
  };
}

// ---------------------------------------------------------------------------
// Snippet source
// ---------------------------------------------------------------------------

function snippetSource(
  isTypeScript: boolean,
  isJsx: boolean,
): (ctx: CompletionContext) => CompletionResult | null {
  return (ctx: CompletionContext) => {
    const word = ctx.matchBefore(/\w+/);
    if (!word || word.from === word.to) return null;

    let options = [...SNIPPETS];
    if (isTypeScript) options = options.concat(TS_SNIPPETS);
    if (isJsx) options = options.concat(REACT_SNIPPETS);

    return {
      from: word.from,
      options,
      validFor: /^\w*$/,
    };
  };
}

// ---------------------------------------------------------------------------
// React hooks top-level source
// ---------------------------------------------------------------------------

function reactHooksSource(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/\w+/);
  if (!word || word.from === word.to) return null;

  return {
    from: word.from,
    options: REACT_HOOKS,
    validFor: /^\w*$/,
  };
}

// ---------------------------------------------------------------------------
// Global identifier completions (top-level: console, Math, JSON …)
// ---------------------------------------------------------------------------

const GLOBAL_IDENTIFIERS: Completion[] = [
  { label: "console", type: "variable", detail: "Console", boost: 5 },
  { label: "Math", type: "variable", detail: "Math", boost: 3 },
  { label: "JSON", type: "variable", detail: "JSON", boost: 3 },
  { label: "Object", type: "class", detail: "ObjectConstructor", boost: 2 },
  { label: "Array", type: "class", detail: "ArrayConstructor", boost: 2 },
  { label: "Promise", type: "class", detail: "PromiseConstructor", boost: 2 },
  { label: "Number", type: "class", detail: "NumberConstructor", boost: 1 },
  { label: "String", type: "class", detail: "StringConstructor", boost: 1 },
  { label: "Boolean", type: "class", detail: "BooleanConstructor", boost: 1 },
  { label: "Date", type: "class", detail: "DateConstructor", boost: 1 },
  { label: "RegExp", type: "class", detail: "RegExpConstructor", boost: 1 },
  { label: "Map", type: "class", detail: "MapConstructor", boost: 1 },
  { label: "Set", type: "class", detail: "SetConstructor", boost: 1 },
  { label: "WeakMap", type: "class", detail: "WeakMapConstructor" },
  { label: "WeakSet", type: "class", detail: "WeakSetConstructor" },
  { label: "WeakRef", type: "class", detail: "WeakRefConstructor" },
  { label: "Symbol", type: "class", detail: "SymbolConstructor" },
  { label: "Error", type: "class", detail: "ErrorConstructor", boost: 1 },
  { label: "TypeError", type: "class", detail: "TypeErrorConstructor" },
  { label: "RangeError", type: "class", detail: "RangeErrorConstructor" },
  { label: "document", type: "variable", detail: "Document", boost: 2 },
  { label: "window", type: "variable", detail: "Window", boost: 1 },
  { label: "globalThis", type: "variable", detail: "typeof globalThis" },
  { label: "performance", type: "variable", detail: "Performance" },
  { label: "undefined", type: "keyword", detail: "undefined" },
  { label: "NaN", type: "keyword", detail: "number" },
  { label: "Infinity", type: "keyword", detail: "number" },
  { label: "parseInt", type: "function", detail: "(s: string, radix?: number): number" },
  { label: "parseFloat", type: "function", detail: "(s: string): number" },
  { label: "isNaN", type: "function", detail: "(v: any): boolean" },
  { label: "isFinite", type: "function", detail: "(v: any): boolean" },
  { label: "setTimeout", type: "function", detail: "(fn, ms?): number" },
  { label: "setInterval", type: "function", detail: "(fn, ms?): number" },
  { label: "clearTimeout", type: "function", detail: "(id?: number): void" },
  { label: "clearInterval", type: "function", detail: "(id?: number): void" },
  { label: "fetch", type: "function", detail: "(input: string, init?): Promise<Response>", boost: 2 },
  { label: "structuredClone", type: "function", detail: "<T>(value: T): T" },
  { label: "queueMicrotask", type: "function", detail: "(fn: () => void): void" },
  { label: "requestAnimationFrame", type: "function", detail: "(cb: Function): number" },
  { label: "atob", type: "function", detail: "(s: string): string" },
  { label: "btoa", type: "function", detail: "(s: string): string" },
  { label: "encodeURIComponent", type: "function", detail: "(s: string): string" },
  { label: "decodeURIComponent", type: "function", detail: "(s: string): string" },
  { label: "Proxy", type: "class", detail: "ProxyConstructor" },
  { label: "Reflect", type: "variable", detail: "typeof Reflect" },
  { label: "ArrayBuffer", type: "class", detail: "ArrayBufferConstructor" },
  { label: "DataView", type: "class", detail: "DataViewConstructor" },
  { label: "Uint8Array", type: "class", detail: "TypedArray" },
  { label: "Int32Array", type: "class", detail: "TypedArray" },
  { label: "Float64Array", type: "class", detail: "TypedArray" },
];

function globalIdentifierSource(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/\w+/);
  if (!word || word.from === word.to) return null;

  // Don't show global identifiers after a dot (that's handled by dotAccessCompletion)
  const charBefore = word.from > 0 ? ctx.state.doc.sliceString(word.from - 1, word.from) : "";
  if (charBefore === ".") return null;

  return {
    from: word.from,
    options: GLOBAL_IDENTIFIERS,
    validFor: /^\w*$/,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type CompletionMode = "javascript" | "typescript" | "jsx";

export function getCompletionSources(mode: CompletionMode) {
  const isTs = mode === "typescript";
  const isJsx = mode === "jsx";

  const sources = [
    dotAccessCompletion,
    npmImportCompletion,
    snippetSource(isTs, isJsx),
    globalIdentifierSource,
  ];

  if (isJsx) {
    sources.push(jsxAttributeCompletion);
    sources.push(reactHooksSource);
  }

  return sources;
}
