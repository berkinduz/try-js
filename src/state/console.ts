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
  consoleOutput.value = [
    ...consoleOutput.value,
    {
      id: nextId++,
      kind: "console",
      method,
      args,
      timestamp: Date.now(),
    },
  ];
}

export function addErrorEntry(
  errorType: ErrorEntry["errorType"],
  message: string,
  stack?: string,
  lineno?: number,
  colno?: number
) {
  consoleOutput.value = [
    ...consoleOutput.value,
    {
      id: nextId++,
      kind: "error",
      errorType,
      message,
      stack,
      lineno,
      colno,
      timestamp: Date.now(),
    },
  ];
}

export function clearConsole() {
  consoleOutput.value = [];
}
