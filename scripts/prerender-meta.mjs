import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import preact from "@preact/preset-vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
// A build-only bundle renders the same informational components the browser uses.
// No SSR runtime or renderer is shipped to the client.
const renderDir = join(root, ".vite", "prerender");
await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: [preact()],
  build: {
    ssr: join(root, "scripts/render-pages.tsx"),
    outDir: renderDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "render.mjs" } },
  },
});
const { pagePaths, indexablePaths, renderPage, renderSitemap } = await import(
  pathToFileURL(join(renderDir, "render.mjs")).href
);
const template = await readFile(join(dist, "index.html"), "utf8");
const manifest = JSON.parse(
  await readFile(join(dist, ".vite/manifest.json"), "utf8"),
);
function pageAssets(path) {
  const entry =
    path === "/features"
      ? "src/components/Features/FeaturesPage.tsx"
      : path === "/snippets"
        ? "src/components/Snippets/SnippetsPage.tsx"
        : path.startsWith("/snippets/")
          ? "src/components/Snippets/SnippetDetailPage.tsx"
          : path === "/404"
            ? "src/components/NotFoundPage.tsx"
            : "src/app.tsx";
  const styles = new Set();
  const modules = new Set();
  const editor = ["/", "/web", "/react", "/embed"].includes(path);
  const visited = new Set();
  function collect(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing manifest entry for ${key}`);
    for (const css of chunk.css ?? []) styles.add(css);
    if (
      editor &&
      chunk.file.endsWith(".js") &&
      !template.includes(`src="/${chunk.file}"`)
    )
      modules.add(chunk.file);
    for (const dependency of chunk.imports ?? []) collect(dependency);
  }
  collect(entry);
  const links = [...styles]
    .filter((css) => !template.includes(`href="/${css}"`))
    .map((css) => `<link rel="stylesheet" href="/${css}" />`);
  return [
    ...links,
    ...[...modules].map(
      (file) => `<link rel="modulepreload" crossorigin href="/${file}" />`,
    ),
  ].join("\n");
}
for (const path of pagePaths) {
  const output =
    path === "/404"
      ? join(dist, "404.html")
      : join(dist, path.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    renderPage(template, path).replace(
      "</head>",
      () => `${pageAssets(path)}\n</head>`,
    ),
  );
}
await writeFile(join(dist, "sitemap.xml"), renderSitemap());
console.log(
  `✓ Prerendered ${indexablePaths.length} indexable pages, an embed page and a 404 page`,
);
