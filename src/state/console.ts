import { signal } from "@preact/signals";
import type { SerializedValue } from "../utils/format";

export interface ConsoleEntry {
  id: number;
  kind: "console";
  method: "log" | "warn" | "error" | "info" | "table" | "clear" | "time" | "timeEnd" | "result";
  args: SerializedValue[];
  timestamp: number;
}

export interface ErrorEntry {
  id: number;
  kind: "error";
  errorType: "error" | "unhandledrejection";
  message: string;
  stack?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
}

export type OutputEntry = ConsoleEntry | ErrorEntry;

let nextId = 0;
const MAX_ENTRIES = 500;

export const consoleOutput = signal<OutputEntry[]>([]);
export const isRunning = signal(false);
export const executionTime = signal<number | null>(null);
export const isLoadingModules = signal(false);

export function addConsoleEntry(
  method: ConsoleEntry["method"],
  args: SerializedValue[]
) {
  if (method === "clear") {
    consoleOutput.value = [];
    return;
  }
  const entry: ConsoleEntry = {
    id: nextId++,
    kind: "console",
    method,
    args,
    timestamp: Date.now(),
  };
  const next: OutputEntry[] = [...consoleOutput.value, entry];
  if (next.length > MAX_ENTRIES) {
    next.splice(0, next.length - MAX_ENTRIES);
  }
  consoleOutput.value = next;
}

export function addErrorEntry(
  errorType: ErrorEntry["errorType"],
  message: string,
  stack?: string,
  lineno?: number,
  colno?: number
) {
  const entry: ErrorEntry = {
    id: nextId++,
    kind: "error",
    errorType,
    message,
    stack,
    lineno,
    colno,
    timestamp: Date.now(),
  };
  const next: OutputEntry[] = [...consoleOutput.value, entry];
  if (next.length > MAX_ENTRIES) {
    next.splice(0, next.length - MAX_ENTRIES);
  }
  consoleOutput.value = next;
}

export function clearConsole() {
  consoleOutput.value = [];
}
