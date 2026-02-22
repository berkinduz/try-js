import { useEffect, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { webHtml, webCss, webJs } from "../../state/editor";
import { autoRunDelay } from "../../state/settings";
import "./WebPreview.css";

interface WebConsoleEntry {
  id: number;
  method: string;
  args: string[];
}

export const webConsoleOutput = signal<WebConsoleEntry[]>([]);
export const webConsoleOpen = signal(false);

let entryId = 0;

/**
 * Bootstrap script injected into the preview iframe.
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
      parent.postMessage({ source: "tryjs-web", type: "console", method: m, args: args }, "*");
      orig.apply(console, arguments);
    };
  });
  window.onerror = function(msg, src, line, col) {
    parent.postMessage({ source: "tryjs-web", type: "console", method: "error", args: [String(msg)] }, "*");
  };
  window.addEventListener("unhandledrejection", function(e) {
    parent.postMessage({ source: "tryjs-web", type: "console", method: "error", args: ["Unhandled rejection: " + String(e.reason)] }, "*");
  });
})();
`;

function buildSrcdoc(htmlCode: string, cssCode: string, jsCode: string): string {
  const safeBootstrap = CONSOLE_BOOTSTRAP.replace(/<\/script/gi, "<\\/script");
  const safeJs = jsCode.replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${cssCode}</style>
<script>${safeBootstrap}<\/script>
</head>
<body>
${htmlCode}
<script>${safeJs}<\/script>
</body>
</html>`;
}

export function WebPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const htmlCode = webHtml.value;
  const cssCode = webCss.value;
  const jsCode = webJs.value;
  const entries = webConsoleOutput.value;
  const isOpen = webConsoleOpen.value;

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "tryjs-web" || data.type !== "console") return;
      webConsoleOutput.value = [
        ...webConsoleOutput.value,
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
      webConsoleOutput.value = [];
      iframe.srcdoc = buildSrcdoc(htmlCode, cssCode, jsCode);
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [htmlCode, cssCode, jsCode]);

  const errorCount = entries.filter((e) => e.method === "error").length;

  return (
    <div class="web-preview">
      <div class="web-preview__header">
        <span class="web-preview__title">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
            <path d="M0 2.5A1.5 1.5 0 011.5 1h13A1.5 1.5 0 0116 2.5v11a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 010 13.5v-11zM1.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-13z"/>
            <path d="M3 4h2v1H3V4zm4 0h6v1H7V4z"/>
          </svg>
          Preview
        </span>
      </div>
      <div class="web-preview__body">
        <iframe
          ref={iframeRef}
          class="web-preview__iframe"
          sandbox="allow-scripts"
          title="Web preview"
        />
        <div class={`web-preview__console ${isOpen ? "open" : ""}`}>
          <button
            type="button"
            class="web-preview__console-toggle"
            onClick={() => { webConsoleOpen.value = !isOpen; }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
              <path d="M2 3l5 4-5 4V3zm6 8h6v1H8v-1z"/>
            </svg>
            Console
            {entries.length > 0 && (
              <span class={`web-preview__console-badge ${errorCount > 0 ? "error" : ""}`}>
                {entries.length}
              </span>
            )}
            <svg
              class="web-preview__console-chevron"
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
            <div class="web-preview__console-list">
              {entries.length === 0 ? (
                <div class="web-preview__console-empty">No output</div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    class={`web-preview__console-entry web-preview__console-entry--${entry.method}`}
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
