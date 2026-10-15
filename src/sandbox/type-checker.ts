import type { TypeDiagnostic, TypeRequest, TypeResponse } from "./type-protocol";
export type { TypeDiagnostic } from "./type-protocol";

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}>();

function resetWorker(message: string) {
  worker?.terminate();
  worker = null;
  for (const request of pending.values()) {
    clearTimeout(request.timer);
    request.reject(new Error(message));
  }
  pending.clear();
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./typescript-worker.ts", import.meta.url), { type: "module", name: "tryjs-types" });
  worker.onmessage = (event: MessageEvent<TypeResponse>) => {
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    clearTimeout(request.timer);
    if (event.data.error) request.reject(new Error(event.data.error));
    else request.resolve(event.data.result);
  };
  worker.onerror = () => resetWorker("Type checking could not start. Reload the page to retry.");
  return worker;
}

export function preloadTypeScript(): void {
  try { getWorker(); } catch { /* Editing and execution remain available without workers. */ }
}

export function requestTypes<T>(kind: TypeRequest["kind"], source: string, pos?: number, jsx = false): Promise<T> {
  return new Promise((resolve, reject) => {
    const instance = getWorker();
    const id = ++nextId;
    const timer = setTimeout(() => resetWorker("Type checking took too long. Run your code again to retry."), 30_000);
    pending.set(id, { resolve: (value) => resolve(value as T), reject, timer });
    instance.postMessage({ id, kind, source, pos, jsx } satisfies TypeRequest);
  });
}

export function checkTypes(source: string): Promise<TypeDiagnostic[]> {
  return requestTypes<TypeDiagnostic[]>("diagnostics", source);
}
