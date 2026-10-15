import ts from "typescript";
import { acquirePackageTypes, createTypeProject, packageRequests } from "./type-project";
import type { TypeRequest, TypeResponse } from "./type-protocol";

const librarySources = import.meta.glob([
  "/node_modules/typescript/lib/lib.es*.d.ts",
  "/node_modules/typescript/lib/lib.dom*.d.ts",
  "/node_modules/typescript/lib/lib.decorators*.d.ts",
  "!/node_modules/typescript/lib/lib.esnext*.d.ts",
  "!/node_modules/typescript/lib/lib.es2025*.d.ts",
  "!/node_modules/typescript/lib/lib.*.full.d.ts",
], {
  eager: true, query: "?raw", import: "default",
}) as Record<string, string>;
const libraries = new Map(Object.entries(librarySources).map(([path, source]) => [path.slice(path.lastIndexOf("/")), source]));
let project = createTypeProject(ts, libraries);
let packageKey = "[]";
let acquisitionFailedAt = 0;
let processing = false;
const pending = new Map<TypeRequest["kind"], TypeRequest>();

function completionKind(kind: string): string {
  if (["function", "method", "constructor", "call", "construct"].includes(kind)) return "function";
  if (["interface", "type"].includes(kind)) return "type";
  if (["class", "enum", "keyword", "property", "string"].includes(kind)) return kind === "string" ? "text" : kind;
  if (kind === "module") return "namespace";
  return "variable";
}

async function handle(request: TypeRequest): Promise<TypeResponse["result"]> {
  const nextKey = JSON.stringify(packageRequests(request.source));
  if (nextKey !== packageKey || (acquisitionFailedAt && Date.now() - acquisitionFailedAt > 15_000)) {
    project.environment.languageService.dispose();
    project = createTypeProject(ts, libraries);
    packageKey = nextKey;
    acquisitionFailedAt = 0;
    try {
      await acquirePackageTypes(ts, project, request.source);
    } catch {
      acquisitionFailedAt = Date.now();
    }
  }
  const file = project.update(request.source, request.jsx);
  const service = project.environment.languageService;
  if (request.kind === "diagnostics") {
    return [...service.getSyntacticDiagnostics(file), ...service.getSemanticDiagnostics(file)].map((diagnostic) => {
      const position = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      return {
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        line: (position?.line ?? 0) + 1,
        col: (position?.character ?? 0) + 1,
        category: diagnostic.category === ts.DiagnosticCategory.Error ? "error" as const : "warning" as const,
      };
    });
  }
  if (request.kind === "completion") {
    const completions = service.getCompletionsAtPosition(file, request.pos ?? 0, {
      includeCompletionsForModuleExports: false,
      includeCompletionsWithInsertText: true,
    });
    return (completions?.entries ?? []).slice(0, 200).map((entry) => ({
      label: entry.name, type: completionKind(entry.kind),
      boost: Math.max(0, 10 - (parseInt(entry.sortText, 10) || 10)),
    }));
  }
  const info = service.getQuickInfoAtPosition(file, request.pos ?? 0);
  if (!info) return null;
  return {
    text: [ts.displayPartsToString(info.displayParts), ts.displayPartsToString(info.documentation)].filter(Boolean).join("\n\n"),
    from: info.textSpan.start, to: info.textSpan.start + info.textSpan.length,
  };
}

async function processPending() {
  if (processing) return;
  processing = true;
  while (pending.size) {
    const request = pending.get("diagnostics") ?? pending.get("completion") ?? pending.get("hover")!;
    pending.delete(request.kind);
    try {
      self.postMessage({ id: request.id, result: await handle(request) } satisfies TypeResponse);
    } catch {
      self.postMessage({ id: request.id, error: "Type checking is unavailable. Reload the page to retry." } satisfies TypeResponse);
    }
  }
  processing = false;
}

self.onmessage = (event: MessageEvent<TypeRequest>) => {
  const request = event.data;
  const superseded = pending.get(request.kind);
  if (superseded) self.postMessage({ id: superseded.id, result: superseded.kind === "hover" ? null : [] } satisfies TypeResponse);
  pending.set(request.kind, request);
  void processPending();
};
