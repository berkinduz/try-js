import { REACT_VERSION, moduleSpecifiers, parsePackageSpecifier, rewriteImports, transpileJsx } from "./transpiler.ts";

/** Keep user source inside a module, so static imports and default exports retain normal ESM semantics. */
export function buildReactDocument(code: string, css: string, generation: number, consoleBootstrap: string): string {
  const bootstrap = consoleBootstrap.replace(/__TRYJS_GENERATION__/g, String(generation)).replace(/<\/script/gi, "<\\/script");
  let moduleCode: string;
  try {
    const result = transpileJsx(code);
    if (result.error !== null) throw new Error(result.error);
    moduleCode = rewriteImports(result.code, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<!doctype html><html><head><meta charset="utf-8"><script>${bootstrap}</script></head><body><pre id="error" style="color:#e74c3c;white-space:pre-wrap;padding:1rem"></pre><script>document.getElementById("error").textContent=${JSON.stringify(message).replace(/</g, "\\u003c")};console.error(${JSON.stringify(message).replace(/</g, "\\u003c")});</script></body></html>`;
  }
  const source = JSON.stringify(moduleCode).replace(/</g, "\\u003c");
  const dependencies = moduleSpecifiers(moduleCode).flatMap((specifier) => {
    if (!specifier.value.startsWith("https://esm.sh/")) return [];
    const url = new URL(specifier.value);
    const pkg = parsePackageSpecifier(url.pathname.slice(1));
    if (!pkg) return [];
    const plain = new URL(url);
    plain.searchParams.delete("external");
    return [{ from: specifier.from, to: specifier.to, external: url.href, plain: plain.href,
      metadata: `https://cdn.jsdelivr.net/npm/${pkg.name}${pkg.version ? `@${pkg.version}` : ""}/package.json` }];
  });
  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  const react = `https://esm.sh/react@${REACT_VERSION}`;
  const reactDom = `https://esm.sh/react-dom@${REACT_VERSION}`;
  const imports = JSON.stringify({ imports: {
    react,
    "react/": `${react}/`,
    "react-dom": `${reactDom}?external=react`,
    "react-dom/client": `${reactDom}/client?external=react`,
    "react-dom/": `${reactDom}/`,
  } });
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${safeCss}</style><script>${bootstrap}</script><script type="importmap">${imports}</script></head><body><div id="root"><p style="font:13px system-ui;color:#777;padding:1rem">Loading preview…</p></div><script type="module">
import * as React from "react";
import { createRoot } from "react-dom/client";
let moduleUrl;
async function reactDependencyMode(dependency) {
  // A package without runtime dependencies cannot introduce another React instance.
  // Use its cached standard ESM build instead of asking the CDN for an unnecessary custom build.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(dependency.metadata, { signal: controller.signal });
    if (response.ok) {
      const metadata = await response.json();
      const peers = metadata.peerDependencies || {};
      const dependencies = { ...metadata.dependencies, ...metadata.optionalDependencies };
      if (Object.keys(dependencies).length === 0) {
        if (Object.keys(peers).length === 0) return "none";
        if (peers.react && !peers["react-dom"]) return "react";
      }
    }
  } catch { /* Preserve the shared-React build when metadata cannot be verified. */ }
  finally { clearTimeout(timeout); }
  return "all";
}
function showError(error) {
  console.error(error && error.message || String(error));
  const pre = document.createElement("pre");
  pre.style.cssText = "color:#e74c3c;font-family:monospace;padding:1rem;white-space:pre-wrap";
  const message = error && error.message || String(error);
  pre.textContent = /Failed to fetch dynamically imported module/.test(message)
    ? "Could not load a module. Check the package name, version, or connection, then edit or reload to retry."
    : message;
  document.getElementById("root").replaceChildren(pre);
}
try {
  let source = ${source};
  const dependencies = ${JSON.stringify(dependencies)};
  const metadataRequests = new Map();
  const urls = await Promise.all(dependencies.map(dependency => {
    if (!metadataRequests.has(dependency.metadata)) metadataRequests.set(dependency.metadata, reactDependencyMode(dependency));
    return metadataRequests.get(dependency.metadata).then(mode => {
      if (mode === "none") return dependency.plain;
      if (mode === "react") {
        const url = new URL(dependency.external);
        url.searchParams.set("external", "react");
        return url.href;
      }
      return dependency.external;
    });
  }));
  for (let index = dependencies.length - 1; index >= 0; index--) {
    const dependency = dependencies[index];
    source = source.slice(0, dependency.from) + JSON.stringify(urls[index]) + source.slice(dependency.to);
  }
  moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  const { default: Component } = await import(moduleUrl);
  if (!Component) throw new Error("Export a React component as the default export.");
  class ErrorBoundary extends React.Component {
    state = { error: null };
    static getDerivedStateFromError(error) { return { error }; }
    componentDidCatch(error) { console.error(error && error.message || String(error)); }
    render() {
      return this.state.error
        ? React.createElement("pre", { style: { color: "#e74c3c", padding: "1rem", whiteSpace: "pre-wrap" } }, String(this.state.error.message || this.state.error))
        : this.props.children;
    }
  }
  function ReportReady() {
    React.useEffect(() => { window.__tryjsReportReactSuccess(); }, []);
    return null;
  }
  createRoot(document.getElementById("root"), { onUncaughtError: showError }).render(
    React.createElement(ErrorBoundary, null, React.createElement(Component), React.createElement(ReportReady))
  );
} catch (error) { showError(error); }
finally { if (moduleUrl) URL.revokeObjectURL(moduleUrl); }
</script></body></html>`;
}
