import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { Editor } from "./components/Editor/Editor";
import { Console } from "./components/Console/Console";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { SplitPane } from "./components/SplitPane/SplitPane";
import { code, language, mode, saveDraft, draftStorageUnavailable, playgroundVersion } from "./state/editor";
import { clearConsole, consoleOutput } from "./state/console";
import { autoRunDelay } from "./state/settings";
import { executeCode, stopExecution } from "./sandbox/executor";
import { useKeyboard } from "./hooks/useKeyboard";
import { ToastContainer, showToast } from "./components/Toast/Toast";
import { Gallery } from "./components/Gallery/Gallery";
import { ScreenshotModal } from "./components/Screenshot/ScreenshotModal";
import { embedMode } from "./state/ui";
import { EmbedOpenLink } from "./components/Playgrounds/EmbedOpenLink";
import { PlaygroundLibrary } from "./components/Playgrounds/PlaygroundLibrary";
import { trackEvent, trackPlaygroundEntered } from "./utils/analytics";
import { MOBILE_BREAKPOINT } from "./utils/constants";
import { WebPlaygroundPage } from "./components/WebPlayground/WebPlaygroundPage";
import { isCurrentLocation } from "./sandbox/source-location";
import type { SourceLocation } from "./sandbox/source-location";
import { NotFoundPage } from "./components/NotFoundPage";
import { getPageSeo, normalizePath } from "./data/seo";
import { applySeo } from "./utils/seo";

export function App() {
  const [, setLocation] = useState(window.location.pathname);
  const path = normalizePath(window.location.pathname);
  const isEmbed = embedMode.value;
  const currentMode = mode.value;
  const surface = currentMode === "js" ? language.value : currentMode;
  const seo = getPageSeo(path);
  useEffect(() => {
    const onPopState = () => setLocation(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useLayoutEffect(() => { applySeo(getPageSeo(window.location.pathname)); }, [path, currentMode]);
  useEffect(() => {
    if (!isEmbed && seo.status !== 404) trackPlaygroundEntered(surface);
  }, [isEmbed, seo.status, surface]);

  if (seo.status === 404) return <NotFoundPage />;

  // Opening or starting a document cancels the previous editor and sandbox lifetime.
  const playgroundKey = playgroundVersion.value;
  const heading = getPageSeo(currentMode === "web" ? "/web" : currentMode === "react" ? "/react" : "/").heading;
  return <>
    <main class="playground" aria-label={heading}>
      <h1 class="sr-only">{heading}</h1>
      {currentMode === "web" || currentMode === "react" ? <WebPlaygroundPage key={playgroundKey} /> : <JsPlayground key={playgroundKey} />}
    </main>
    {!isEmbed && <PlaygroundLibrary />}
    <Gallery />
    <ScreenshotModal />
    <ToastContainer />
    <DraftStorageNotice />
  </>;
}

function DraftStorageNotice() {
  const unavailable = draftStorageUnavailable.value;
  useEffect(() => {
    if (unavailable) showToast("Autosave is unavailable in this browser. Download the playground (.json) to keep your work.", "warning", 7000);
  }, [unavailable]);
  return null;
}

function JsPlayground() {
  const isEmbed = embedMode.value;
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileTab, setMobileTab] = useState<"editor" | "console">("editor");
  const [navigation, setNavigation] = useState<SourceLocation | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const currentSource = { code: code.value, language: language.value, version: playgroundVersion.value };
  const navigateToError = useCallback((location: SourceLocation) => {
    const current = mode.value === "js" ? { code: code.value, language: language.value, version: playgroundVersion.value } : null;
    if (!isCurrentLocation(location, current)) return;
    setMobileTab("editor");
    setNavigation({ ...location });
  }, []);

  useEffect(() => {
    clearConsole();
    return () => stopExecution();
  }, []);

  // Track main playground view
  useEffect(() => {
    trackEvent("playground_view", { language: language.value });
  }, []);

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      setNavigation(null);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const run = useCallback(() => {
    trackEvent("code_run", { language: language.value, trigger: "manual" });
    executeCode(code.value, language.value, "manual");
  }, []);

  // Auto-run on code change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeCode(code.value, language.value, "auto");
    }, autoRunDelay.value);

    return () => clearTimeout(debounceRef.current);
  }, [code.value, language.value]);

  // Save code to localStorage on change (debounced)
  useEffect(() => {
    if (isEmbed) return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [code.value, language.value]);

  // Keyboard shortcuts
  useKeyboard([
    { key: "Enter", mod: true, handler: run },
    ...(isEmbed ? [{ key: "s", mod: true, handler: saveDraft }] : []),
    { key: "l", mod: true, handler: clearConsole },
  ]);

  // Error count for mobile badge
  const errorCount = consoleOutput.value.filter(
    (e) => e.kind === "error" || (e.kind === "console" && e.method === "error")
  ).length;

  if (isMobile && isEmbed) {
    return <div class="app" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div class="embed-mobile-layout"><Editor navigation={navigation} /><Console currentSource={currentSource} onNavigate={navigateToError} /></div>
      <EmbedOpenLink />
    </div>;
  }

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
            <Editor navigation={navigation} />
          </div>
          <div style={{ height: "100%", display: mobileTab !== "editor" ? "block" : "none" }}>
            <Console currentSource={currentSource} onNavigate={navigateToError} />
          </div>
        </div>
        {!isEmbed && <StatusBar />}
        {isEmbed && <EmbedOpenLink />}
      </div>
    );
  }

  return (
    <div class="app" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!isEmbed && <Toolbar />}
      <SplitPane
        left={<Editor navigation={navigation} />}
        right={<Console currentSource={currentSource} onNavigate={navigateToError} />}
      />
      {!isEmbed && <StatusBar />}
      {isEmbed && <EmbedOpenLink />}
    </div>
  );
}
