/**
 * TypeScript Language Service integration for code completions and hover info.
 *
 * Reuses the TypeScript compiler already loaded from CDN (see type-checker.ts)
 * to provide real, type-aware IntelliSense powered by
 * `ts.LanguageService.getCompletionsAtPosition()`.
 */

import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

// ---------------------------------------------------------------------------
// Lazy TS reference (reuses the global `window.ts` set by type-checker.ts)
// ---------------------------------------------------------------------------

function getTS(): any | null {
  return (window as any).ts ?? null;
}

// ---------------------------------------------------------------------------
// Minimal lib (imported from type-checker at build-time via shared constant)
// We duplicate the getter here to avoid a circular import; the actual string
// lives in type-checker.ts and is loaded once.
// ---------------------------------------------------------------------------

import { __MINIMAL_LIB } from "./type-checker";

// A small fallback in case the import trick fails
const FALLBACK_LIB = `
declare var console: { log(...a: any[]): void; warn(...a: any[]): void; error(...a: any[]): void; info(...a: any[]): void; table(...a: any[]): void; clear(): void; time(l?: string): void; timeEnd(l?: string): void; };
declare var Math: { abs(x: number): number; ceil(x: number): number; floor(x: number): number; round(x: number): number; max(...v: number[]): number; min(...v: number[]): number; pow(x: number, y: number): number; sqrt(x: number): number; random(): number; PI: number; E: number; };
declare var JSON: { parse(text: string): any; stringify(value: any, replacer?: any, space?: number): string; };
declare function parseInt(s: string, radix?: number): number;
declare function parseFloat(s: string): number;
declare function setTimeout(fn: Function, ms?: number): number;
declare function setInterval(fn: Function, ms?: number): number;
declare function clearTimeout(id?: number): void;
declare function clearInterval(id?: number): void;
declare function fetch(input: string, init?: any): Promise<any>;
interface Array<T> { length: number; push(...items: T[]): number; pop(): T | undefined; map<U>(fn: (v: T, i: number) => U): U[]; filter(fn: (v: T, i: number) => boolean): T[]; reduce<U>(fn: (acc: U, v: T) => U, init: U): U; find(fn: (v: T) => boolean): T | undefined; forEach(fn: (v: T, i: number) => void): void; includes(item: T): boolean; indexOf(item: T): number; join(sep?: string): string; slice(start?: number, end?: number): T[]; splice(start: number, dc?: number, ...items: T[]): T[]; sort(cmp?: (a: T, b: T) => number): T[]; reverse(): T[]; flat(d?: number): any[]; flatMap<U>(fn: (v: T) => U | U[]): U[]; some(fn: (v: T) => boolean): boolean; every(fn: (v: T) => boolean): boolean; concat(...items: T[][]): T[]; }
interface String { length: number; charAt(i: number): string; includes(s: string): boolean; indexOf(s: string): number; slice(start?: number, end?: number): string; split(sep: string | RegExp): string[]; replace(pat: string | RegExp, rep: string): string; trim(): string; toUpperCase(): string; toLowerCase(): string; startsWith(s: string): boolean; endsWith(s: string): boolean; repeat(n: number): string; padStart(l: number, f?: string): string; padEnd(l: number, f?: string): string; match(r: RegExp): RegExpMatchArray | null; }
interface Promise<T> { then<U>(fn: (v: T) => U | Promise<U>): Promise<U>; catch<U>(fn: (e: any) => U | Promise<U>): Promise<T | U>; finally(fn: () => void): Promise<T>; }
interface Object { constructor: Function; toString(): string; hasOwnProperty(v: string): boolean; }
interface ObjectConstructor { keys(o: any): string[]; values(o: any): any[]; entries(o: any): [string, any][]; assign(t: any, ...s: any[]): any; freeze<T>(o: T): Readonly<T>; create(o: any): any; }
declare var Object: ObjectConstructor;
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {};
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
`;

// ---------------------------------------------------------------------------
// Language Service singleton
// ---------------------------------------------------------------------------

interface ServiceState {
  service: any;
  source: string;
  version: number;
  fileName: string;
  libName: string;
  libContent: string;
}

let state: ServiceState | null = null;

function getOrCreateService(ts: any, source: string, libContent: string): ServiceState {
  const fileName = "input.tsx";
  const libName = "lib.d.ts";

  if (state && state.service) {
    // Update source
    state.source = source;
    state.version++;
    return state;
  }

  const newState: ServiceState = {
    service: null,
    source,
    version: 1,
    fileName,
    libName,
    libContent,
  };

  const host: any = {
    getScriptFileNames: () => [libName, fileName],
    getScriptVersion: () => String(newState.version),
    getScriptSnapshot: (name: string) => {
      if (name === fileName) {
        return ts.ScriptSnapshot.fromString(newState.source);
      }
      if (name === libName) {
        return ts.ScriptSnapshot.fromString(newState.libContent);
      }
      return undefined;
    },
    getCurrentDirectory: () => "/",
    getCompilationSettings: () => ({
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      jsxFactory: "React.createElement",
      strict: false,
      noLib: true,
      allowJs: true,
      checkJs: false,
      noEmit: true,
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    }),
    getDefaultLibFileName: () => libName,
    fileExists: (name: string) => name === fileName || name === libName,
    readFile: (name: string) => {
      if (name === fileName) return newState.source;
      if (name === libName) return newState.libContent;
      return undefined;
    },
    directoryExists: () => true,
    getDirectories: () => [],
  };

  newState.service = ts.createLanguageService(
    host,
    ts.createDocumentRegistry(),
  );

  state = newState;
  return state;
}

// ---------------------------------------------------------------------------
// Map TS completion kind → CodeMirror completion type
// ---------------------------------------------------------------------------

function mapCompletionKind(ts: any, kind: string): string {
  switch (kind) {
    case ts.ScriptElementKind.functionElement:
    case ts.ScriptElementKind.memberFunctionElement:
    case ts.ScriptElementKind.constructSignatureElement:
    case ts.ScriptElementKind.callSignatureElement:
      return "function";
    case ts.ScriptElementKind.memberVariableElement:
    case ts.ScriptElementKind.variableElement:
    case ts.ScriptElementKind.localVariableElement:
    case ts.ScriptElementKind.letElement:
    case ts.ScriptElementKind.constElement:
    case ts.ScriptElementKind.parameterElement:
      return "variable";
    case ts.ScriptElementKind.classElement:
      return "class";
    case ts.ScriptElementKind.interfaceElement:
    case ts.ScriptElementKind.typeElement:
      return "type";
    case ts.ScriptElementKind.enumElement:
    case ts.ScriptElementKind.enumMemberElement:
      return "enum";
    case ts.ScriptElementKind.keyword:
      return "keyword";
    case ts.ScriptElementKind.moduleElement:
      return "namespace";
    case ts.ScriptElementKind.memberGetAccessorElement:
    case ts.ScriptElementKind.memberSetAccessorElement:
    case ts.ScriptElementKind.indexSignatureElement:
      return "property";
    case ts.ScriptElementKind.string:
      return "text";
    default:
      return "variable";
  }
}

// ---------------------------------------------------------------------------
// Public: CodeMirror CompletionSource using TS Language Service
// ---------------------------------------------------------------------------

let libContentCache: string | null = null;

export async function tsCompletionSource(
  ctx: CompletionContext,
): Promise<CompletionResult | null> {
  const ts = getTS();
  if (!ts) return null;

  // Don't trigger on empty input or inside comments/strings (let other sources handle those)
  const explicit = ctx.explicit;
  if (!explicit) {
    const charBefore = ctx.matchBefore(/\w+|\.$/);
    if (!charBefore) return null;
  }

  try {
    if (!libContentCache) {
      libContentCache = __MINIMAL_LIB || FALLBACK_LIB;
    }

    const source = ctx.state.doc.toString();
    const svc = getOrCreateService(ts, source, libContentCache!);
    const pos = ctx.pos;

    const completions = svc.service.getCompletionsAtPosition(
      svc.fileName,
      pos,
      {
        includeCompletionsForModuleExports: false,
        includeCompletionsWithInsertText: true,
        includeCompletionsWithSnippetText: false,
      },
    );

    if (!completions || !completions.entries || completions.entries.length === 0) {
      return null;
    }

    // Determine the start of the current word for the `from` position
    const word = ctx.matchBefore(/\w*/);
    const from = word ? word.from : ctx.pos;

    const options: Completion[] = completions.entries
      .slice(0, 100) // Limit to avoid UI lag
      .map((entry: any) => {
        const completion: Completion = {
          label: entry.name,
          type: mapCompletionKind(ts, entry.kind),
        };

        if (entry.sortText) {
          // Use sortText as a rough boost (lower = higher priority)
          const sortNum = parseInt(entry.sortText, 10);
          if (!isNaN(sortNum)) {
            completion.boost = Math.max(0, 10 - sortNum);
          }
        }

        return completion;
      });

    return {
      from,
      options,
      validFor: /^\w*$/,
    };
  } catch {
    // Silently fail — don't break the editor experience
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public: Hover / QuickInfo
// ---------------------------------------------------------------------------

export interface HoverInfo {
  text: string;
  from: number;
  to: number;
}

export async function getHoverInfo(
  source: string,
  pos: number,
): Promise<HoverInfo | null> {
  const ts = getTS();
  if (!ts) return null;

  try {
    if (!libContentCache) {
      libContentCache = __MINIMAL_LIB || FALLBACK_LIB;
    }

    const svc = getOrCreateService(ts, source, libContentCache!);
    const info = svc.service.getQuickInfoAtPosition(svc.fileName, pos);

    if (!info) return null;

    const parts: string[] = [];

    if (info.displayParts) {
      parts.push(info.displayParts.map((p: any) => p.text).join(""));
    }

    if (info.documentation && info.documentation.length > 0) {
      parts.push(
        info.documentation.map((d: any) => d.text).join("\n"),
      );
    }

    if (parts.length === 0) return null;

    return {
      text: parts.join("\n\n"),
      from: info.textSpan.start,
      to: info.textSpan.start + info.textSpan.length,
    };
  } catch {
    return null;
  }
}
