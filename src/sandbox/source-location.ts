import type { Language } from "../utils/playground.ts";

/** Editor coordinates are one-based, including columns (UTF-16 code units). */
export interface SourcePosition {
  line: number;
  column: number;
}

export interface SourceSnapshot {
  readonly code: string;
  readonly language: Language;
  readonly version: number;
}

export interface SourceLocation extends SourcePosition {
  source: SourceSnapshot;
}

export function sourceOffset(code: string, position: SourcePosition): number | null {
  if (!Number.isInteger(position.line) || !Number.isInteger(position.column) ||
      position.line < 1 || position.column < 1) return null;
  // VM line separators that the editor does not display as the same lines cannot
  // safely use a line/column jump. LF and CRLF retain their ordinary coordinates.
  if (code.includes("\u2028") || code.includes("\u2029") ||
      (code.includes("\r") && /\r(?!\n)/.test(code))) return null;
  let from = 0;
  for (let line = 1; line < position.line; line++) {
    const end = code.indexOf("\n", from);
    if (end < 0) return null;
    from = end + 1;
  }
  const newline = code.indexOf("\n", from);
  let to = newline < 0 ? code.length : newline;
  if (to > from && code[to - 1] === "\r") to--;
  return position.column <= to - from + 1 ? from + position.column - 1 : null;
}

export function sourceLocation(source: SourceSnapshot, position?: SourcePosition): SourceLocation | undefined {
  return position && sourceOffset(source.code, position) !== null ? { ...position, source } : undefined;
}

export function isCurrentLocation(location: SourceLocation, current: SourceSnapshot | null): boolean {
  return current !== null && location.source.version === current.version &&
    location.source.language === current.language && location.source.code === current.code &&
    sourceOffset(current.code, location) !== null;
}
