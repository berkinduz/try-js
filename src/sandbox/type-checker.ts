/**
 * TypeScript type-checker for the playground.
 *
 * Lazily loads the TypeScript compiler from CDN and runs semantic diagnostics
 * against user code so that structural errors (e.g. missing interface members)
 * are surfaced in the console.
 *
 * A minimal set of lib declarations is bundled inline so that common built-in
 * types (Array, Promise, console, …) are recognised without fetching the full
 * lib.d.ts files (~1 MB+).
 */

// ---------------------------------------------------------------------------
// TypeScript compiler loader
// ---------------------------------------------------------------------------

const TS_CDN_URL =
  "https://cdn.jsdelivr.net/npm/typescript@5/lib/typescript.min.js";

let tsLoadPromise: Promise<any> | null = null;

function getTypeScript(): Promise<any> {
  if ((window as any).ts) return Promise.resolve((window as any).ts);
  if (!tsLoadPromise) {
    tsLoadPromise = new Promise<any>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TS_CDN_URL;
      script.onload = () => resolve((window as any).ts);
      script.onerror = () => {
        tsLoadPromise = null;
        reject(new Error("Failed to load TypeScript compiler"));
      };
      document.head.appendChild(script);
    });
  }
  return tsLoadPromise;
}

/** Start downloading the TS compiler so it is ready when the user runs code. */
export function preloadTypeScript(): void {
  getTypeScript().catch(() => {});
}

// ---------------------------------------------------------------------------
// Minimal lib declarations
// ---------------------------------------------------------------------------

const MINIMAL_LIB = `
// --- Primitive wrappers & core interfaces ---
interface Object { constructor: Function; toString(): string; valueOf(): Object; hasOwnProperty(v: string): boolean; }
interface ObjectConstructor { keys(o: any): string[]; values(o: any): any[]; entries(o: any): [string, any][]; assign(target: any, ...sources: any[]): any; freeze<T>(o: T): Readonly<T>; create(o: any, props?: any): any; defineProperty(o: any, p: string, desc: any): any; getPrototypeOf(o: any): any; }
declare var Object: ObjectConstructor;
interface Function { apply(thisArg: any, args?: any[]): any; call(thisArg: any, ...args: any[]): any; bind(thisArg: any, ...args: any[]): Function; prototype: any; length: number; name: string; }
interface FunctionConstructor { new(...args: string[]): Function; }
declare var Function: FunctionConstructor;
interface IArguments { [index: number]: any; length: number; }
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}

// --- String ---
interface String { readonly length: number; charAt(i: number): string; charCodeAt(i: number): number; indexOf(s: string, pos?: number): number; lastIndexOf(s: string, pos?: number): number; slice(start?: number, end?: number): string; substring(start: number, end?: number): string; trim(): string; trimStart(): string; trimEnd(): string; toUpperCase(): string; toLowerCase(): string; split(sep: string | RegExp, limit?: number): string[]; replace(pat: string | RegExp, rep: string | ((match: string, ...args: any[]) => string)): string; match(regexp: string | RegExp): RegExpMatchArray | null; includes(s: string, pos?: number): boolean; startsWith(s: string, pos?: number): boolean; endsWith(s: string, pos?: number): boolean; repeat(count: number): string; padStart(len: number, fill?: string): string; padEnd(len: number, fill?: string): string; at(index: number): string | undefined; [index: number]: string; }
interface StringConstructor { (value?: any): string; fromCharCode(...codes: number[]): string; }
declare var String: StringConstructor;

// --- Number ---
interface Number { toFixed(digits?: number): string; toPrecision(prec?: number): string; toString(radix?: number): string; valueOf(): number; }
interface NumberConstructor { (value?: any): number; isFinite(n: any): boolean; isInteger(n: any): boolean; isNaN(n: any): boolean; parseFloat(s: string): number; parseInt(s: string, radix?: number): number; MAX_SAFE_INTEGER: number; MIN_SAFE_INTEGER: number; POSITIVE_INFINITY: number; NEGATIVE_INFINITY: number; NaN: number; }
declare var Number: NumberConstructor;

// --- Boolean ---
interface Boolean { valueOf(): boolean; }
interface BooleanConstructor { (value?: any): boolean; }
declare var Boolean: BooleanConstructor;

// --- Symbol ---
interface Symbol { toString(): string; readonly description: string | undefined; }
interface SymbolConstructor { (desc?: string | number): symbol; for(key: string): symbol; keyFor(sym: symbol): string | undefined; readonly iterator: unique symbol; readonly asyncIterator: unique symbol; readonly hasInstance: unique symbol; readonly toPrimitive: unique symbol; readonly toStringTag: unique symbol; }
declare var Symbol: SymbolConstructor;

// --- Array ---
interface ReadonlyArray<T> { readonly length: number; readonly [n: number]: T; indexOf(item: T): number; includes(item: T): boolean; join(sep?: string): string; slice(start?: number, end?: number): T[]; forEach(fn: (v: T, i: number, a: readonly T[]) => void): void; map<U>(fn: (v: T, i: number, a: readonly T[]) => U): U[]; filter<S extends T>(fn: (v: T, i: number) => v is S): S[]; filter(fn: (v: T, i: number) => boolean): T[]; find(fn: (v: T, i: number) => boolean): T | undefined; findIndex(fn: (v: T, i: number) => boolean): number; some(fn: (v: T, i: number) => boolean): boolean; every(fn: (v: T, i: number) => boolean): boolean; reduce(fn: (acc: T, v: T, i: number) => T): T; reduce<U>(fn: (acc: U, v: T, i: number) => U, init: U): U; flat<D extends number = 1>(depth?: D): any[]; flatMap<U>(fn: (v: T, i: number) => U | U[]): U[]; concat(...items: (T | T[])[]): T[]; entries(): IterableIterator<[number, T]>; keys(): IterableIterator<number>; values(): IterableIterator<T>; }
interface Array<T> { length: number; [n: number]: T; push(...items: T[]): number; pop(): T | undefined; shift(): T | undefined; unshift(...items: T[]): number; indexOf(item: T): number; includes(item: T): boolean; join(sep?: string): string; slice(start?: number, end?: number): T[]; splice(start: number, deleteCount?: number, ...items: T[]): T[]; forEach(fn: (v: T, i: number, a: T[]) => void): void; map<U>(fn: (v: T, i: number, a: T[]) => U): U[]; filter<S extends T>(fn: (v: T, i: number) => v is S): S[]; filter(fn: (v: T, i: number) => boolean): T[]; find(fn: (v: T, i: number) => boolean): T | undefined; findIndex(fn: (v: T, i: number) => boolean): number; some(fn: (v: T, i: number) => boolean): boolean; every(fn: (v: T, i: number) => boolean): boolean; reduce(fn: (acc: T, v: T, i: number) => T): T; reduce<U>(fn: (acc: U, v: T, i: number) => U, init: U): U; sort(cmp?: (a: T, b: T) => number): T[]; reverse(): T[]; flat<D extends number = 1>(depth?: D): any[]; flatMap<U>(fn: (v: T, i: number) => U | U[]): U[]; fill(value: T, start?: number, end?: number): T[]; concat(...items: (T | T[])[]): T[]; at(index: number): T | undefined; entries(): IterableIterator<[number, T]>; keys(): IterableIterator<number>; values(): IterableIterator<T>; }
interface ArrayConstructor { new<T>(...items: T[]): T[]; isArray(arg: any): arg is any[]; from<T>(arrayLike: any, mapfn?: (v: any, k: number) => T): T[]; of<T>(...items: T[]): T[]; }
declare var Array: ArrayConstructor;
interface TemplateStringsArray extends ReadonlyArray<string> { readonly raw: readonly string[]; }

// --- Error ---
interface Error { name: string; message: string; stack?: string; cause?: unknown; }
interface ErrorConstructor { new(message?: string, options?: { cause?: unknown }): Error; (message?: string): Error; }
declare var Error: ErrorConstructor;
interface TypeError extends Error {} interface TypeErrorConstructor { new(message?: string): TypeError; (message?: string): TypeError; } declare var TypeError: TypeErrorConstructor;
interface RangeError extends Error {} interface RangeErrorConstructor { new(message?: string): RangeError; (message?: string): RangeError; } declare var RangeError: RangeErrorConstructor;
interface SyntaxError extends Error {} declare var SyntaxError: { new(msg?: string): SyntaxError; (msg?: string): SyntaxError; };
interface ReferenceError extends Error {} declare var ReferenceError: { new(msg?: string): ReferenceError; (msg?: string): ReferenceError; };
interface URIError extends Error {} declare var URIError: { new(msg?: string): URIError; };
interface EvalError extends Error {} declare var EvalError: { new(msg?: string): EvalError; };

// --- RegExp ---
interface RegExpMatchArray extends Array<string> { index?: number; input?: string; groups?: { [key: string]: string }; }
interface RegExpExecArray extends Array<string> { index: number; input: string; groups?: { [key: string]: string }; }
interface RegExp { test(s: string): boolean; exec(s: string): RegExpExecArray | null; source: string; flags: string; global: boolean; ignoreCase: boolean; multiline: boolean; lastIndex: number; }
interface RegExpConstructor { new(pattern: string | RegExp, flags?: string): RegExp; (pattern: string | RegExp, flags?: string): RegExp; }
declare var RegExp: RegExpConstructor;

// --- Date ---
interface Date { getTime(): number; getFullYear(): number; getMonth(): number; getDate(): number; getDay(): number; getHours(): number; getMinutes(): number; getSeconds(): number; getMilliseconds(): number; setFullYear(y: number): number; setMonth(m: number): number; setDate(d: number): number; setHours(h: number): number; setMinutes(m: number): number; toISOString(): string; toLocaleDateString(locale?: string): string; toLocaleTimeString(locale?: string): string; toLocaleString(locale?: string): string; toString(): string; valueOf(): number; toJSON(): string; }
interface DateConstructor { new(): Date; new(value: number | string): Date; new(y: number, m: number, d?: number, h?: number, min?: number, s?: number, ms?: number): Date; (): string; now(): number; parse(s: string): number; UTC(y: number, m: number, d?: number, h?: number, min?: number, s?: number, ms?: number): number; }
declare var Date: DateConstructor;

// --- Promise ---
interface PromiseLike<T> { then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2>; }
interface Promise<T> { then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>; catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>; finally(onfinally?: (() => void) | null): Promise<T>; }
interface PromiseConstructor { new<T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>; resolve(): Promise<void>; resolve<T>(value: T | PromiseLike<T>): Promise<T>; reject<T = never>(reason?: any): Promise<T>; all<T>(values: (T | PromiseLike<T>)[]): Promise<T[]>; race<T>(values: (T | PromiseLike<T>)[]): Promise<T>; allSettled<T>(values: (T | PromiseLike<T>)[]): Promise<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: any }>[]; any<T>(values: (T | PromiseLike<T>)[]): Promise<T>; }
declare var Promise: PromiseConstructor;

// --- Collections ---
interface Map<K, V> { get(key: K): V | undefined; set(key: K, value: V): this; has(key: K): boolean; delete(key: K): boolean; clear(): void; readonly size: number; forEach(fn: (value: V, key: K, map: Map<K, V>) => void): void; keys(): IterableIterator<K>; values(): IterableIterator<V>; entries(): IterableIterator<[K, V]>; }
interface MapConstructor { new<K, V>(entries?: readonly (readonly [K, V])[]): Map<K, V>; }
declare var Map: MapConstructor;
interface WeakMap<K extends object, V> { get(key: K): V | undefined; set(key: K, value: V): this; has(key: K): boolean; delete(key: K): boolean; }
interface WeakMapConstructor { new<K extends object, V>(entries?: readonly [K, V][]): WeakMap<K, V>; }
declare var WeakMap: WeakMapConstructor;
interface Set<T> { add(value: T): this; has(value: T): boolean; delete(value: T): boolean; clear(): void; readonly size: number; forEach(fn: (value: T, key: T, set: Set<T>) => void): void; keys(): IterableIterator<T>; values(): IterableIterator<T>; entries(): IterableIterator<[T, T]>; }
interface SetConstructor { new<T>(values?: readonly T[]): Set<T>; }
declare var Set: SetConstructor;
interface WeakSet<T extends object> { add(value: T): this; has(value: T): boolean; delete(value: T): boolean; }
interface WeakSetConstructor { new<T extends object>(values?: readonly T[]): WeakSet<T>; }
declare var WeakSet: WeakSetConstructor;
interface WeakRef<T extends object> { deref(): T | undefined; }
interface WeakRefConstructor { new<T extends object>(target: T): WeakRef<T>; }
declare var WeakRef: WeakRefConstructor;

// --- Iterators ---
interface IteratorYieldResult<TYield> { done?: false; value: TYield; }
interface IteratorReturnResult<TReturn> { done: true; value: TReturn; }
type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;
interface Iterator<T, TReturn = any, TNext = any> { next(...args: [] | [TNext]): IteratorResult<T, TReturn>; }
interface Iterable<T> { [Symbol.iterator](): Iterator<T>; }
interface IterableIterator<T> extends Iterator<T> { [Symbol.iterator](): IterableIterator<T>; }
interface AsyncIterator<T> { next(): Promise<IteratorResult<T>>; }
interface AsyncIterable<T> { [Symbol.asyncIterator](): AsyncIterator<T>; }
interface AsyncIterableIterator<T> extends AsyncIterator<T> { [Symbol.asyncIterator](): AsyncIterableIterator<T>; }
interface Generator<T = unknown, TReturn = any, TNext = unknown> extends Iterator<T, TReturn, TNext> { next(...args: [] | [TNext]): IteratorResult<T, TReturn>; return(value: TReturn): IteratorResult<T, TReturn>; throw(e: any): IteratorResult<T, TReturn>; [Symbol.iterator](): Generator<T, TReturn, TNext>; }
interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown> extends AsyncIterator<T> { next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>; return(value: TReturn): Promise<IteratorResult<T, TReturn>>; throw(e: any): Promise<IteratorResult<T, TReturn>>; [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>; }

// --- Typed arrays ---
interface ArrayBuffer { readonly byteLength: number; slice(begin: number, end?: number): ArrayBuffer; }
interface ArrayBufferConstructor { new(byteLength: number): ArrayBuffer; isView(arg: any): boolean; }
declare var ArrayBuffer: ArrayBufferConstructor;
interface ArrayBufferView { buffer: ArrayBuffer; byteLength: number; byteOffset: number; }
interface DataView { getInt8(byteOffset: number): number; getUint8(byteOffset: number): number; getInt16(byteOffset: number, littleEndian?: boolean): number; getUint16(byteOffset: number, littleEndian?: boolean): number; getInt32(byteOffset: number, littleEndian?: boolean): number; getUint32(byteOffset: number, littleEndian?: boolean): number; getFloat32(byteOffset: number, littleEndian?: boolean): number; getFloat64(byteOffset: number, littleEndian?: boolean): number; }
declare var DataView: { new(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): DataView; };
interface TypedArray { readonly length: number; readonly byteLength: number; readonly byteOffset: number; readonly buffer: ArrayBuffer; [index: number]: number; }
interface Int8Array extends TypedArray {} declare var Int8Array: { new(length: number): Int8Array; new(buffer: ArrayBuffer): Int8Array; from(arrayLike: any): Int8Array; of(...items: number[]): Int8Array; };
interface Uint8Array extends TypedArray {} declare var Uint8Array: { new(length: number): Uint8Array; new(buffer: ArrayBuffer): Uint8Array; from(arrayLike: any): Uint8Array; of(...items: number[]): Uint8Array; };
interface Int16Array extends TypedArray {} declare var Int16Array: { new(length: number): Int16Array; from(arrayLike: any): Int16Array; };
interface Uint16Array extends TypedArray {} declare var Uint16Array: { new(length: number): Uint16Array; from(arrayLike: any): Uint16Array; };
interface Int32Array extends TypedArray {} declare var Int32Array: { new(length: number): Int32Array; from(arrayLike: any): Int32Array; };
interface Uint32Array extends TypedArray {} declare var Uint32Array: { new(length: number): Uint32Array; from(arrayLike: any): Uint32Array; };
interface Float32Array extends TypedArray {} declare var Float32Array: { new(length: number): Float32Array; from(arrayLike: any): Float32Array; };
interface Float64Array extends TypedArray {} declare var Float64Array: { new(length: number): Float64Array; from(arrayLike: any): Float64Array; };

// --- Global objects ---
declare var console: { log(...args: any[]): void; warn(...args: any[]): void; error(...args: any[]): void; info(...args: any[]): void; debug(...args: any[]): void; table(...args: any[]): void; clear(): void; time(label?: string): void; timeEnd(label?: string): void; timeLog(label?: string, ...args: any[]): void; dir(obj: any): void; trace(...args: any[]): void; group(...args: any[]): void; groupEnd(): void; assert(condition?: boolean, ...args: any[]): void; count(label?: string): void; countReset(label?: string): void; };
declare var Math: { readonly E: number; readonly LN10: number; readonly LN2: number; readonly LOG10E: number; readonly LOG2E: number; readonly PI: number; readonly SQRT1_2: number; readonly SQRT2: number; abs(x: number): number; acos(x: number): number; acosh(x: number): number; asin(x: number): number; asinh(x: number): number; atan(x: number): number; atanh(x: number): number; atan2(y: number, x: number): number; cbrt(x: number): number; ceil(x: number): number; clz32(x: number): number; cos(x: number): number; cosh(x: number): number; exp(x: number): number; expm1(x: number): number; floor(x: number): number; fround(x: number): number; hypot(...values: number[]): number; imul(x: number, y: number): number; log(x: number): number; log1p(x: number): number; log10(x: number): number; log2(x: number): number; max(...values: number[]): number; min(...values: number[]): number; pow(x: number, y: number): number; random(): number; round(x: number): number; sign(x: number): number; sin(x: number): number; sinh(x: number): number; sqrt(x: number): number; tan(x: number): number; tanh(x: number): number; trunc(x: number): number; };
declare var JSON: { parse(text: string, reviver?: (key: string, value: any) => any): any; stringify(value: any, replacer?: any, space?: string | number): string; };

// --- Global functions ---
declare function parseInt(s: string, radix?: number): number;
declare function parseFloat(s: string): number;
declare function isNaN(v: any): boolean;
declare function isFinite(v: any): boolean;
declare function encodeURIComponent(s: string | number | boolean): string;
declare function decodeURIComponent(s: string): string;
declare function encodeURI(s: string): string;
declare function decodeURI(s: string): string;
declare function eval(code: string): any;
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function setInterval(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(id?: number): void;
declare function clearInterval(id?: number): void;
declare function requestAnimationFrame(callback: (time: number) => void): number;
declare function cancelAnimationFrame(id: number): void;
declare function queueMicrotask(callback: () => void): void;
declare function structuredClone<T>(value: T): T;
declare function atob(s: string): string;
declare function btoa(s: string): string;
declare function fetch(input: string, init?: any): Promise<any>;
declare function alert(message?: any): void;
declare function confirm(message?: string): boolean;
declare function prompt(message?: string, defaultValue?: string): string | null;
declare var performance: { now(): number; mark(name: string): void; measure(name: string, startMark?: string, endMark?: string): void; };
declare var window: any;
declare var self: any;
declare var document: any;
declare var globalThis: typeof globalThis;
declare var undefined: undefined;
declare var NaN: number;
declare var Infinity: number;

// --- Utility types ---
type Partial<T> = { [P in keyof T]?: T[P]; };
type Required<T> = { [P in keyof T]-?: T[P]; };
type Readonly<T> = { readonly [P in keyof T]: T[P]; };
type Record<K extends keyof any, T> = { [P in K]: T; };
type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {};
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
type Awaited<T> = T extends null | undefined ? T : T extends object & { then(onfulfilled: infer F, ...args: infer _): any } ? F extends ((value: infer V, ...args: infer _) => any) ? Awaited<V> : never : T;
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => any ? U : unknown;
type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;

// --- Proxy / Reflect ---
interface ProxyHandler<T extends object> { get?(target: T, p: string | symbol, receiver: any): any; set?(target: T, p: string | symbol, value: any, receiver: any): boolean; has?(target: T, p: string | symbol): boolean; deleteProperty?(target: T, p: string | symbol): boolean; apply?(target: T, thisArg: any, argArray: any[]): any; construct?(target: T, argArray: any[], newTarget: Function): object; }
interface ProxyConstructor { new<T extends object>(target: T, handler: ProxyHandler<T>): T; revocable<T extends object>(target: T, handler: ProxyHandler<T>): { proxy: T; revoke: () => void }; }
declare var Proxy: ProxyConstructor;
declare var Reflect: { apply(target: Function, thisArg: any, args: any[]): any; construct(target: Function, args: any[], newTarget?: Function): any; defineProperty(target: object, key: string | symbol, desc: any): boolean; deleteProperty(target: object, key: string | symbol): boolean; get(target: object, key: string | symbol, receiver?: any): any; getOwnPropertyDescriptor(target: object, key: string | symbol): any; getPrototypeOf(target: object): any; has(target: object, key: string | symbol): boolean; isExtensible(target: object): boolean; ownKeys(target: object): (string | symbol)[]; preventExtensions(target: object): boolean; set(target: object, key: string | symbol, value: any, receiver?: any): boolean; setPrototypeOf(target: object, proto: any): boolean; };
`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TypeDiagnostic {
  message: string;
  line: number;
  col: number;
  category: "error" | "warning" | "info";
}

/**
 * Run TypeScript semantic diagnostics on {@link source}.
 * Returns an array of diagnostics (may be empty).
 * The TypeScript compiler is loaded lazily on the first call.
 */
export async function checkTypes(source: string): Promise<TypeDiagnostic[]> {
  const ts = await getTypeScript();

  const fileName = "input.ts";
  const libName = "lib.d.ts";

  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ES2020,
    true
  );
  const libFile = ts.createSourceFile(
    libName,
    MINIMAL_LIB,
    ts.ScriptTarget.ES2020,
    true
  );

  const files = new Map<string, any>();
  files.set(fileName, sourceFile);
  files.set(libName, libFile);

  const compilerOptions: Record<string, any> = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: false,
    noLib: true,
    noEmit: true,
    skipLibCheck: true,
    allowJs: false,
  };

  const host = {
    getSourceFile: (name: string) => files.get(name),
    getDefaultLibFileName: () => libName,
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (f: string) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (name: string) => files.has(name),
    readFile: (name: string) => {
      const f = files.get(name);
      return f ? f.text : undefined;
    },
    getDirectories: () => [] as string[],
    directoryExists: () => true,
  };

  const program = ts.createProgram([libName, fileName], compilerOptions, host);
  const diagnostics: any[] = ts.getPreEmitDiagnostics(program);

  return diagnostics
    .filter((d: any) => d.file && d.file.fileName === fileName)
    .map((d: any) => {
      const pos = d.file.getLineAndCharacterOfPosition(d.start);
      const category: TypeDiagnostic["category"] =
        d.category === ts.DiagnosticCategory.Error
          ? "error"
          : d.category === ts.DiagnosticCategory.Warning
            ? "warning"
            : "info";
      return {
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        line: pos.line + 1 as number,
        col: pos.character + 1 as number,
        category,
      };
    });
}
