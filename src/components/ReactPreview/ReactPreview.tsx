import { useEffect, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { reactCode } from "../../state/editor";
import { autoRunDelay } from "../../state/settings";
import { transpileJsx } from "../../sandbox/transpiler";
import { rewriteImports } from "../../sandbox/transpiler";
import "./ReactPreview.css";

interface ReactConsoleEntry {
  id: number;
  method: string;
  args: string[];
}

export const reactConsoleOutput = signal<ReactConsoleEntry[]>([]);
export const reactConsoleOpen = signal(false);

let entryId = 0;

/**
 * Bootstrap script injected into the React preview iframe.
 * Intercepts console methods and forwards them to the parent via postMessage.
 */
const CONSOLE_BOOTSTRAP = `
(function() {
  var methods = ["log", "warn", "error", "info"];
  methods.forEach(function(m) {
    var orig = console[m];
    console[m] = function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        try {
          args.push(typeof arguments[i] === "object" ? JSON.stringify(arguments[i], null, 2) : String(arguments[i]));
        } catch(e) {
          args.push(String(arguments[i]));
        }
      }
      parent.postMessage({ source: "tryjs-react", type: "console", method: m, args: args }, "*");
      orig.apply(console, arguments);
    };
  });
  window.onerror = function(msg, src, line, col) {
    parent.postMessage({ source: "tryjs-react", type: "console", method: "error", args: [String(msg)] }, "*");
  };
  window.addEventListener("unhandledrejection", function(e) {
    parent.postMessage({ source: "tryjs-react", type: "console", method: "error", args: ["Unhandled rejection: " + String(e.reason)] }, "*");
  });
})();
`;

function buildSrcdoc(userCode: string): string {
  // Transpile JSX → JS
  const transpiled = transpileJsx(userCode);
  if (transpiled.error !== null) {
    const safeBootstrap = CONSOLE_BOOTSTRAP.replace(/<\/script/gi, "<\\/script");
    const errorMsg = transpiled.error.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script>${safeBootstrap}<\/script>
</head>
<body>
<pre style="color: #e74c3c; font-family: monospace; padding: 1rem; white-space: pre-wrap;">${transpiled.error.replace(/</g, "&lt;")}</pre>
<script>console.error('${errorMsg}');<\/script>
</body>
</html>`;
  }

  let jsCode = transpiled.code;

  // Rewrite bare import specifiers (e.g., "react" → "https://esm.sh/react")
  jsCode = rewriteImports(jsCode);

  // Sucrase with jsxRuntime: "automatic" produces:
  //   var _jsxRuntime = require("react/jsx-runtime");
  // We need to replace the require() calls with esm.sh imports at the top.
  // Since we used transforms: ["imports"], all imports become require() calls.
  // We'll convert them back to dynamic imports in a wrapper.

  const safeBootstrap = CONSOLE_BOOTSTRAP.replace(/<\/script/gi, "<\\/script");
  const safeJs = jsCode.replace(/<\/script/gi, "<\\/script");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${safeBootstrap}<\/script>
</head>
<body>
<div id="root"></div>
<script type="module">
// Provide require() shim for Sucrase CJS output
const __modules = {};

async function __loadModules() {
  const React = await import("https://esm.sh/react@18");
  const ReactDOM = await import("https://esm.sh/react-dom@18/client");
  const jsxRuntime = await import("https://esm.sh/react@18/jsx-runtime");

  __modules["react"] = React;
  __modules["react-dom"] = ReactDOM;
  __modules["react-dom/client"] = ReactDOM;
  __modules["react/jsx-runtime"] = jsxRuntime;
}

function require(id) {
  // Strip esm.sh base URL if present
  const clean = id.replace("https://esm.sh/", "");
  const mod = __modules[clean];
  if (mod) return mod;
  throw new Error("Module not found: " + id);
}

try {
  await __loadModules();

  // Execute user code
  const exports = {};
  const module = { exports };
  ${safeJs}

  // Find the default export (the root component)
  const Component = module.exports.default || module.exports;
  if (typeof Component === "function") {
    const React = __modules["react"];
    const ReactDOM = __modules["react-dom/client"];
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(Component));
  }
} catch(e) {
  console.error(e.message || String(e));
  document.getElementById("root").innerHTML =
    '<pre style="color:#e74c3c;font-family:monospace;padding:1rem;white-space:pre-wrap;">' +
    String(e.message || e).replace(/</g, "&lt;") + '</pre>';
}
<\/script>
</body>
</html>`;
}

export function ReactPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const code = reactCode.value;
  const entries = reactConsoleOutput.value;
  const isOpen = reactConsoleOpen.value;

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "tryjs-react" || data.type !== "console") return;
      reactConsoleOutput.value = [
        ...reactConsoleOutput.value,
        { id: ++entryId, method: data.method, args: data.args || [] },
      ];
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ block: "end" });
  }, [entries.length]);

  // Refresh preview on code change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      reactConsoleOutput.value = [];
      iframe.srcdoc = buildSrcdoc(code);
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  const errorCount = entries.filter((e) => e.method === "error").length;

  return (
    <div class="react-preview">
      <div class="react-preview__header">
        <span class="react-preview__title">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
            <path d="M0 2.5A1.5 1.5 0 011.5 1h13A1.5 1.5 0 0116 2.5v11a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 010 13.5v-11zM1.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-13z"/>
            <path d="M3 4h2v1H3V4zm4 0h6v1H7V4z"/>
          </svg>
          Preview
        </span>
      </div>
      <div class="react-preview__body">
        <iframe
          ref={iframeRef}
          class="react-preview__iframe"
          sandbox="allow-scripts"
          title="React preview"
        />
        <div class={`react-preview__console ${isOpen ? "open" : ""}`}>
          <button
            type="button"
            class="react-preview__console-toggle"
            onClick={() => { reactConsoleOpen.value = !isOpen; }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
              <path d="M2 3l5 4-5 4V3zm6 8h6v1H8v-1z"/>
            </svg>
            Console
            {entries.length > 0 && (
              <span class={`react-preview__console-badge ${errorCount > 0 ? "error" : ""}`}>
                {entries.length}
              </span>
            )}
            <svg
              class="react-preview__console-chevron"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          {isOpen && (
            <div class="react-preview__console-list">
              {entries.length === 0 ? (
                <div class="react-preview__console-empty">No output</div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    class={`react-preview__console-entry react-preview__console-entry--${entry.method}`}
                  >
                    {entry.args.join(" ")}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
