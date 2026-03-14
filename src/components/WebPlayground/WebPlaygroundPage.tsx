import { useEffect, useRef, useState } from "preact/hooks";
import { WebEditor } from "../WebEditor/WebEditor";
import { WebPreview, webConsoleOutput } from "../WebPreview/WebPreview";
import { ReactEditor } from "../ReactEditor/ReactEditor";
import { ReactPreview, reactConsoleOutput } from "../ReactPreview/ReactPreview";
import { SplitPane } from "../SplitPane/SplitPane";
import { StatusBar } from "../StatusBar/StatusBar";
import { ToastContainer } from "../Toast/Toast";
import { ToolbarLinks } from "../Toolbar/ToolbarLinks";
import { mode, webHtml, webCss, webJs, reactCode, reactCss } from "../../state/editor";
import { clearConsole } from "../../state/console";
import { useKeyboard } from "../../hooks/useKeyboard";
import { MOBILE_BREAKPOINT } from "../../utils/constants";
import { applySeo } from "../../utils/seo";
import "./WebPlaygroundPage.css";

type WebSubMode = "vanilla" | "react";

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
  const reactCssVal = reactCss.value;

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
      localStorage.setItem("jspark:react:css", reactCssVal);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reactCodeVal, reactCssVal, subMode]);

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
          localStorage.setItem("jspark:react:css", reactCss.value);
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

        <ToolbarLinks currentPath="/web" />
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
