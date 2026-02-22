import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Editor } from "./components/Editor/Editor";
import { Console } from "./components/Console/Console";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { SplitPane } from "./components/SplitPane/SplitPane";
import { WebEditor } from "./components/WebEditor/WebEditor";
import { WebPreview, webConsoleOutput } from "./components/WebPreview/WebPreview";
import { code, language, mode, webHtml, webCss, webJs } from "./state/editor";
import { clearConsole, consoleOutput } from "./state/console";
import { autoRunDelay } from "./state/settings";
import { executeCode } from "./sandbox/executor";
import { useKeyboard } from "./hooks/useKeyboard";
import { ToastContainer } from "./components/Toast/Toast";
import { Gallery } from "./components/Gallery/Gallery";
import { ScreenshotModal } from "./components/Screenshot/ScreenshotModal";
import { embedMode } from "./state/ui";
import { encodeToHash } from "./utils/share";
import { MOBILE_BREAKPOINT } from "./utils/constants";
import { FeaturesPage } from "./components/Features/FeaturesPage";

function EmbedOpenLink() {
  const hash = encodeToHash({ code: code.value, language: language.value });
  const url = `https://tryjs.app/${hash}`;
  return (
    <a
      class="embed-open-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open in TryJS
    </a>
  );
}

export function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isFeaturesPage = path === "/features";

  if (isFeaturesPage) {
    return <FeaturesPage />;
  }

  const isEmbed = embedMode.value;
  const isWeb = mode.value === "web";
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileTab, setMobileTab] = useState<"editor" | "console" | "preview">("editor");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset mobile tab and clear stale console when mode changes
  useEffect(() => {
    setMobileTab("editor");
    if (!isWeb) {
      webConsoleOutput.value = [];
    }
  }, [isWeb]);

  const run = useCallback(() => {
    if (mode.value === "web") return;
    executeCode(code.value, language.value);
  }, []);

  // Auto-run on code change (JS/TS mode only — web mode preview handles its own refresh)
  useEffect(() => {
    if (isWeb) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeCode(code.value, language.value);
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [code.value, language.value, isWeb]);

  // Save code to localStorage on change (debounced)
  useEffect(() => {
    if (isWeb) return;
    const timer = setTimeout(() => {
      localStorage.setItem(`jspark:code:${language.value}`, code.value);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code.value, language.value, isWeb]);

  // Save web code to localStorage (debounced)
  useEffect(() => {
    if (!isWeb) return;
    const timer = setTimeout(() => {
      localStorage.setItem("jspark:web:html", webHtml.value);
      localStorage.setItem("jspark:web:css", webCss.value);
      localStorage.setItem("jspark:web:js", webJs.value);
    }, 1000);
    return () => clearTimeout(timer);
  }, [webHtml.value, webCss.value, webJs.value, isWeb]);

  // Keyboard shortcuts
  useKeyboard([
    { key: "Enter", mod: true, handler: run },
    {
      key: "s",
      mod: true,
      handler: () => {
        if (isWeb) {
          localStorage.setItem("jspark:web:html", webHtml.value);
          localStorage.setItem("jspark:web:css", webCss.value);
          localStorage.setItem("jspark:web:js", webJs.value);
        } else {
          localStorage.setItem(`jspark:code:${language.value}`, code.value);
        }
      },
    },
    { key: "l", mod: true, handler: clearConsole },
  ]);

  // Error count for mobile badge (JS/TS mode only)
  const errorCount = consoleOutput.value.filter(
    (e) => e.kind === "error" || (e.kind === "console" && e.method === "error")
  ).length;

  // Determine the right second tab label for mobile
  const secondTabLabel = isWeb ? "Preview" : "Console";
  const secondTabId = isWeb ? "preview" : "console";

  if (isMobile) {
    return (
      <div class="app" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {!isEmbed && <Toolbar />}
        {!isEmbed && (
          <div class="mobile-tabs">
            <button
              class={`mobile-tab ${mobileTab === "editor" ? "active" : ""}`}
              onClick={() => setMobileTab("editor")}
            >
              Editor
            </button>
            <button
              class={`mobile-tab ${mobileTab === secondTabId ? "active" : ""}`}
              onClick={() => setMobileTab(secondTabId as any)}
            >
              {secondTabLabel}
              {!isWeb && errorCount > 0 && (
                <span class="mobile-tab__badge">{errorCount}</span>
              )}
            </button>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <div style={{ height: "100%", display: mobileTab === "editor" ? "block" : "none" }}>
            {isWeb ? <WebEditor /> : <Editor />}
          </div>
          <div style={{ height: "100%", display: mobileTab !== "editor" ? "block" : "none" }}>
            {isWeb ? <WebPreview /> : <Console />}
          </div>
        </div>
        {!isEmbed && <StatusBar />}
        {isEmbed && <EmbedOpenLink />}
        {!isWeb && <Gallery />}
        {!isWeb && <ScreenshotModal />}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div class="app" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!isEmbed && <Toolbar />}
      <SplitPane
        left={isWeb ? <WebEditor /> : <Editor />}
        right={isWeb ? <WebPreview /> : <Console />}
      />
      {!isEmbed && <StatusBar />}
      {isEmbed && <EmbedOpenLink />}
      {!isWeb && <Gallery />}
      {!isWeb && <ScreenshotModal />}
      <ToastContainer />
    </div>
  );
}
