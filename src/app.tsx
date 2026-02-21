import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Editor } from "./components/Editor/Editor";
import { Console } from "./components/Console/Console";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { SplitPane } from "./components/SplitPane/SplitPane";
import { code, language } from "./state/editor";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileTab, setMobileTab] = useState<"editor" | "console">("editor");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const run = useCallback(() => {
    executeCode(code.value, language.value);
  }, []);

  // Auto-run on code change (always on)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeCode(code.value, language.value);
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [code.value, language.value]);

  // Save code to localStorage on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`jspark:code:${language.value}`, code.value);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code.value, language.value]);

  // Keyboard shortcuts
  useKeyboard([
    { key: "Enter", mod: true, handler: run },
    {
      key: "s",
      mod: true,
      handler: () => {
        localStorage.setItem(`jspark:code:${language.value}`, code.value);
      },
    },
    { key: "l", mod: true, handler: clearConsole },
  ]);

  // Error count for mobile badge
  const errorCount = consoleOutput.value.filter(
    (e) => e.kind === "error" || (e.kind === "console" && e.method === "error")
  ).length;

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
              class={`mobile-tab ${mobileTab === "console" ? "active" : ""}`}
              onClick={() => setMobileTab("console")}
            >
              Console
              {errorCount > 0 && (
                <span class="mobile-tab__badge">{errorCount}</span>
              )}
            </button>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <div style={{ height: "100%", display: mobileTab === "editor" ? "block" : "none" }}>
            <Editor />
          </div>
          <div style={{ height: "100%", display: mobileTab === "console" ? "block" : "none" }}>
            <Console />
          </div>
        </div>
        {!isEmbed && <StatusBar />}
        {isEmbed && <EmbedOpenLink />}
        <Gallery />
        <ScreenshotModal />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div class="app" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!isEmbed && <Toolbar />}
      <SplitPane
        left={<Editor />}
        right={<Console />}
      />
      {!isEmbed && <StatusBar />}
      {isEmbed && <EmbedOpenLink />}
      <Gallery />
      <ScreenshotModal />
      <ToastContainer />
    </div>
  );
}
