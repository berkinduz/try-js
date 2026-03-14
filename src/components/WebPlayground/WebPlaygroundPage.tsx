import { useEffect, useRef, useState } from "preact/hooks";
import { WebEditor } from "../WebEditor/WebEditor";
import { WebPreview, webConsoleOutput } from "../WebPreview/WebPreview";
import { ReactEditor } from "../ReactEditor/ReactEditor";
import { ReactPreview, reactConsoleOutput } from "../ReactPreview/ReactPreview";
import { SplitPane } from "../SplitPane/SplitPane";
import { StatusBar } from "../StatusBar/StatusBar";
import { ToastContainer } from "../Toast/Toast";
import { mode, webHtml, webCss, webJs, reactCode } from "../../state/editor";
import { clearConsole } from "../../state/console";
import { useKeyboard } from "../../hooks/useKeyboard";
import { MOBILE_BREAKPOINT } from "../../utils/constants";
import { applySeo } from "../../utils/seo";
import "./WebPlaygroundPage.css";

type WebSubMode = "vanilla" | "react";

const GITHUB_URL = "https://github.com/berkinduz/js-park";
const BMC_URL = "https://buymeacoffee.com/berkinduz";

export function WebPlaygroundPage() {
  const stored = localStorage.getItem("jspark:webSubMode");
  const initial: WebSubMode = stored === "react" ? "react" : "vanilla";
  const [subMode, setSubMode] = useState<WebSubMode>(initial);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync global mode with subMode
  useEffect(() => {
    mode.value = subMode === "react" ? "react" : "web";
  }, [subMode]);

  // Persist subMode choice
  const switchSubMode = (m: WebSubMode) => {
    setSubMode(m);
    setMobileTab("editor");
    localStorage.setItem("jspark:webSubMode", m);
  };

  // SEO meta tags
  useEffect(() => {
    const isReact = subMode === "react";
    return applySeo({
      title: isReact
        ? "React Playground Online — Write & Run React JSX Instantly | TryJS"
        : "Web Playground Online — HTML, CSS & JavaScript Editor | TryJS",
      description: isReact
        ? "Free online React playground. Write React components with JSX, see live preview instantly, import npm packages, and use hooks — all in your browser. No setup required."
        : "Free online web playground. Write HTML, CSS, and JavaScript in a tabbed editor with live preview. Build and prototype web pages directly in your browser — no setup required.",
      canonical: "https://tryjs.app/web",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: isReact
            ? "TryJS — React Playground"
            : "TryJS — Web Playground",
          description: isReact
            ? "Free online React playground with JSX, hooks, npm imports, and live preview."
            : "Free online web playground with HTML, CSS, and JavaScript tabbed editor and live preview.",
          url: "https://tryjs.app/web",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: isReact
            ? [
                "React JSX editor with live preview",
                "React hooks (useState, useEffect, useRef, useMemo)",
                "NPM package imports via esm.sh",
                "Built-in console for debugging",
                "Toggle between Vanilla and React modes",
              ]
            : [
                "HTML, CSS, and JavaScript tabbed editor",
                "Live preview updates as you type",
                "Built-in console for debugging",
                "Toggle between Vanilla and React modes",
              ],
        },
      ],
      jsonLdId: "web-page-schema",
    });
  }, [subMode]);

  // Clear stale console when switching sub-mode
  useEffect(() => {
    if (subMode === "vanilla") {
      reactConsoleOutput.value = [];
    } else {
      webConsoleOutput.value = [];
    }
  }, [subMode]);

  // Save web code to localStorage (debounced)
  const webHtmlVal = webHtml.value;
  const webCssVal = webCss.value;
  const webJsVal = webJs.value;
  const reactCodeVal = reactCode.value;

  useEffect(() => {
    if (subMode !== "vanilla") return;
    const timer = setTimeout(() => {
      localStorage.setItem("jspark:web:html", webHtmlVal);
      localStorage.setItem("jspark:web:css", webCssVal);
      localStorage.setItem("jspark:web:js", webJsVal);
    }, 1000);
    return () => clearTimeout(timer);
  }, [webHtmlVal, webCssVal, webJsVal, subMode]);

  // Save react code to localStorage (debounced)
  useEffect(() => {
    if (subMode !== "react") return;
    const timer = setTimeout(() => {
      localStorage.setItem("jspark:react:code", reactCodeVal);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reactCodeVal, subMode]);

  // Keyboard shortcuts
  useKeyboard([
    {
      key: "s",
      mod: true,
      handler: () => {
        if (subMode === "vanilla") {
          localStorage.setItem("jspark:web:html", webHtml.value);
          localStorage.setItem("jspark:web:css", webCss.value);
          localStorage.setItem("jspark:web:js", webJs.value);
        } else {
          localStorage.setItem("jspark:react:code", reactCode.value);
        }
      },
    },
    { key: "l", mod: true, handler: clearConsole },
  ]);

  return (
    <div
      class="app"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Custom toolbar */}
      <div class="toolbar">
        <div class="toolbar__left">
          <div class="toolbar__brand">
            <a
              href="/"
              class="toolbar__back-btn"
              title="Back to JS/TS playground"
              aria-label="Back to JS/TS playground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </a>
            <div class="web-page-toggle">
              <button
                type="button"
                class={`web-page-toggle__btn web-page-toggle__btn--vanilla ${subMode === "vanilla" ? "active" : ""}`}
                onClick={() => switchSubMode("vanilla")}
              >
                <span class="web-page-toggle__short">HTML</span>
                <span class="web-page-toggle__full">Vanilla</span>
              </button>
              <button
                type="button"
                class={`web-page-toggle__btn web-page-toggle__btn--react ${subMode === "react" ? "active" : ""}`}
                onClick={() => switchSubMode("react")}
              >
                <span class="web-page-toggle__short">JSX</span>
                <span class="web-page-toggle__full">React</span>
              </button>
            </div>
          </div>
        </div>

        <div class="toolbar__right toolbar__right--links">
          <a
            href="/regex"
            class="toolbar__explore"
            title="Regex Playground"
            aria-label="Regex Playground"
          >
            <span class="toolbar__explore-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </span>
            Regex
          </a>
          <a
            href={BMC_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="toolbar__link toolbar__bmc"
            title="Buy Me a Coffee"
            aria-label="Buy Me a Coffee"
          >
            <span class="toolbar__bmc-text">Buy Me a Coffee</span>
            <span class="toolbar__bmc-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 8h1a4 4 0 110 8h-1M2 8h14v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <path d="M6 2v3M10 2v3M14 2v3" />
              </svg>
            </span>
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="toolbar__icon-btn toolbar__link"
            title="GitHub repository"
            aria-label="GitHub repository"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Editor + Preview */}
      {isMobile ? (
        <>
          <div class="mobile-tabs">
            <button
              class={`mobile-tab ${mobileTab === "editor" ? "active" : ""}`}
              onClick={() => setMobileTab("editor")}
            >
              Editor
            </button>
            <button
              class={`mobile-tab ${mobileTab === "preview" ? "active" : ""}`}
              onClick={() => setMobileTab("preview")}
            >
              Preview
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                display: mobileTab === "editor" ? "block" : "none",
              }}
            >
              {subMode === "react" ? <ReactEditor /> : <WebEditor />}
            </div>
            <div
              style={{
                height: "100%",
                display: mobileTab === "preview" ? "block" : "none",
              }}
            >
              {subMode === "react" ? <ReactPreview /> : <WebPreview />}
            </div>
          </div>
        </>
      ) : (
        <SplitPane
          left={subMode === "react" ? <ReactEditor /> : <WebEditor />}
          right={subMode === "react" ? <ReactPreview /> : <WebPreview />}
        />
      )}

      <StatusBar />
      <ToastContainer />
    </div>
  );
}
