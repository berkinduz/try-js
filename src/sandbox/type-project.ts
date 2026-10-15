import { createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import { setupTypeAcquisition } from "@typescript/ata";
import type ts from "typescript";
import { moduleSpecifiers, parsePackageSpecifier } from "./module-imports.ts";

type TypeScript = typeof ts;

/** Official libraries and acquired package declarations share one virtual filesystem. */
export function createTypeProject(compiler: TypeScript, libraries: Map<string, string>) {
  const files = new Map(libraries);
  files.set("/input.ts", "\n");
  files.set("/input.tsx", "\n");
  const environment = createVirtualTypeScriptEnvironment(
    createSystem(files), ["/input.ts", "/input.tsx"], compiler,
    {
      target: compiler.ScriptTarget.ES2024,
      module: compiler.ModuleKind.ESNext,
      moduleDetection: compiler.ModuleDetectionKind.Force,
      moduleResolution: compiler.ModuleResolutionKind.Bundler,
      jsx: compiler.JsxEmit.ReactJSX,
      lib: ["lib.es2024.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.dom.asynciterable.d.ts"],
      strict: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      types: [],
      noEmit: true,
    },
  );
  return {
    files,
    environment,
    update(source: string, jsx = false) {
      const fileName = jsx ? "/input.tsx" : "/input.ts";
      const otherFile = jsx ? "/input.ts" : "/input.tsx";
      if (files.get(otherFile) !== "\n") environment.updateFile(otherFile, "\n");
      if (files.get(fileName) !== (source || "\n")) environment.updateFile(fileName, source || "\n");
      return fileName;
    },
    addFile(path: string, source: string) {
      if (files.has(path)) environment.updateFile(path, source);
      else environment.createFile(path, source);
    },
  };
}

export type TypeProject = ReturnType<typeof createTypeProject>;

export function packageRequests(source: string): { name: string; version?: string }[] {
  const requests = new Map<string, { name: string; version?: string }>();
  for (const specifier of moduleSpecifiers(source)) {
    const pkg = parsePackageSpecifier(specifier.value);
    if (pkg) requests.set(`${pkg.name}@${pkg.version ?? "latest"}`, { name: pkg.name, version: pkg.version });
  }
  return [...requests.values()].slice(0, 8);
}

/** A fresh acquisition per package set also permits retry after a temporary CDN failure. */
export async function acquirePackageTypes(
  compiler: TypeScript, project: TypeProject, source: string, fetcher: typeof fetch = fetch,
): Promise<void> {
  const requests = packageRequests(source);
  if (!requests.length) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let count = 0;
  let bytes = 0;
  const boundedFetch: typeof fetch = async (input, init) => {
    if (++count > 400) throw new Error("Package type download limit reached.");
    const url = new URL(String(input));
    if (!["cdn.jsdelivr.net", "data.jsdelivr.com"].includes(url.hostname) || url.protocol !== "https:") {
      throw new Error("Unsupported package type source.");
    }
    const response = await fetcher(input, { ...init, signal: controller.signal });
    const body = await response.text();
    bytes += body.length;
    if (bytes > 5_000_000 || controller.signal.aborted) throw new Error("Package types exceeded the download budget.");
    return new Response(body, { status: response.status, headers: response.headers });
  };
  const acquisition = setupTypeAcquisition({
    projectName: "TryJS",
    typescript: compiler,
    fetcher: boundedFetch,
    logger: { log() {}, error() {}, groupCollapsed() {}, groupEnd() {} },
    delegate: {
      receivedFile(code, path) {
        if (controller.signal.aborted) return;
        project.addFile(path, code);
        for (const request of requests) {
          if (!request.version) continue;
          const prefix = `/node_modules/${request.name}`;
          const dtName = request.name.startsWith("@") ? request.name.slice(1).replace("/", "__") : request.name;
          const dtPrefix = `/node_modules/@types/${dtName}`;
          const matched = path.startsWith(prefix + "/") ? prefix : path.startsWith(dtPrefix + "/") ? dtPrefix : null;
          if (matched) {
            project.addFile(`/node_modules/${request.name}@${request.version}${path.slice(matched.length)}`, code);
          }
        }
      },
    },
  });
  try {
    await acquisition(requests.map((pkg, index) =>
      `import type * as p${index} from ${JSON.stringify(pkg.name)}; // types: ${pkg.version ?? "latest"}`,
    ).join("\n"));
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}
