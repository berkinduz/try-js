import { useEffect, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { reactCode, reactCss } from "../../state/editor";
import { autoRunDelay } from "../../state/settings";
import { PREVIEW_CONSOLE_FORMATTER } from "../../sandbox/preview-console-formatter";
import { buildReactDocument } from "../../sandbox/react-document";
import { CopyOutputButton } from "../Console/CopyOutputButton";
import {
  isSuccessfulRunEligible,
  trackSuccessfulRun,
} from "../../utils/analytics";
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
  var generation = __TRYJS_GENERATION__;
  var hadError = false;
${PREVIEW_CONSOLE_FORMATTER}
  var methods = ["log", "warn", "error", "info"];
  methods.forEach(function(m) {
    var orig = console[m];
    console[m] = function() {
      if (m === "error") hadError = true;
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(formatConsoleArg(arguments[i]));
      }
      parent.postMessage({ source: "tryjs-react", generation: generation, type: "console", method: m, args: args }, "*");
      orig.apply(console, arguments);
    };
  });
  window.onerror = function(msg, src, line, col) {
    hadError = true;
    parent.postMessage({ source: "tryjs-react", generation: generation, type: "console", method: "error", args: [String(msg)] }, "*");
  };
  window.addEventListener("unhandledrejection", function(e) {
    hadError = true;
    parent.postMessage({ source: "tryjs-react", generation: generation, type: "console", method: "error", args: ["Unhandled rejection: " + String(e.reason)] }, "*");
  });
  window.__tryjsReportReactSuccess = function() {
    setTimeout(function() {
      if (!hadError) {
        parent.postMessage({ source: "tryjs-react", generation: generation, type: "preview-success" }, "*");
      }
    }, 0);
  };
})();
`;

function buildSrcdoc(userCode: string, userCss: string, generation: number): string {
  return buildReactDocument(userCode, userCss, generation, CONSOLE_BOOTSTRAP);
}

export function ReactPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const eligibleGenerationRef = useRef<number | null>(null);

  const code = reactCode.value;
  const css = reactCss.value;
  const entries = reactConsoleOutput.value;
  const isOpen = reactConsoleOpen.value;

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "tryjs-react") return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (data.generation !== generationRef.current) return;
      if (data.type === "preview-success") {
        trackSuccessfulRun(
          "react",
          "auto",
          eligibleGenerationRef.current === data.generation,
        );
        return;
      }
      if (data.type !== "console") return;
      reactConsoleOutput.value = [
        ...reactConsoleOutput.value,
        { id: ++entryId, method: data.method, args: data.args || [] },
      ].slice(-500);
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
      const generation = ++generationRef.current;
      eligibleGenerationRef.current = isSuccessfulRunEligible("auto")
        ? generation
        : null;
      reactConsoleOutput.value = [];
      iframe.srcdoc = buildSrcdoc(code, css, generation);
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [code, css]);

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
          sandbox="allow-scripts allow-forms"
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
                    class={`react-preview__console-entry react-preview__console-entry--${entry.method} console-output-row`}
                  >
                    <span class="console-output-text">{entry.args.join(" ")}</span>
                    <CopyOutputButton getText={() => entry.args.join(" ")} />
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
