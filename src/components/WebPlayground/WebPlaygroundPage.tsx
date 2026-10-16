import { useEffect, useRef, useState } from "preact/hooks";
import { WebEditor } from "../WebEditor/WebEditor";
import { WebPreview, webConsoleOutput } from "../WebPreview/WebPreview";
import { ReactEditor } from "../ReactEditor/ReactEditor";
import { ReactPreview, reactConsoleOutput } from "../ReactPreview/ReactPreview";
import { SplitPane } from "../SplitPane/SplitPane";
import { StatusBar } from "../StatusBar/StatusBar";
import { Toolbar } from "../Toolbar/Toolbar";
import { mode, setMode, saveDraft, webHtml, webCss, webJs, reactCode, reactCss } from "../../state/editor";
import { embedMode } from "../../state/ui";
import { writeLocal } from "../../utils/storage";
import { ShareMenu } from "../Playgrounds/ShareMenu";
import { EmbedOpenLink } from "../Playgrounds/EmbedOpenLink";
import { useKeyboard } from "../../hooks/useKeyboard";
import { MOBILE_BREAKPOINT } from "../../utils/constants";
import { trackEvent } from "../../utils/analytics";
import "./WebPlaygroundPage.css";

type WebSubMode = "vanilla" | "react";

export function WebPlaygroundPage() {
  const isEmbed = embedMode.value;
  const subMode: WebSubMode = mode.value === "react" ? "react" : "vanilla";
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Switch subMode and update URL for SEO
  const switchSubMode = (m: WebSubMode) => {
    if (m === subMode) return;
    trackEvent("web_submode_switch", { from: subMode, to: m });
    setMode(m === "react" ? "react" : "web");
    setMobileTab("editor");
    writeLocal("jspark:webSubMode", m);
    const newPath = m === "react" ? "/react" : "/web";
    window.history.pushState(null, "", newPath);
  };

  useEffect(() => {
    trackEvent("web_playground_view", { mode: subMode === "react" ? "react" : "vanilla" });
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
    if (isEmbed || subMode !== "vanilla") return;
    const timer = setTimeout(() => { saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [webHtmlVal, webCssVal, webJsVal, subMode]);

  // Save react code to localStorage (debounced)
  useEffect(() => {
    if (isEmbed || subMode !== "react") return;
    const timer = setTimeout(() => { saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [reactCodeVal, reactCssVal, subMode]);

  // Keyboard shortcuts
  useKeyboard([
    ...(isEmbed ? [{ key: "s", mod: true, handler: saveDraft }] : []),
    { key: "l", mod: true, handler: () => {
      if (subMode === "react") reactConsoleOutput.value = [];
      else webConsoleOutput.value = [];
    } },
  ]);

  return (
    <div
      class="app"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Shared toolbar with JS/TS/Web buttons */}
      {!isEmbed && <Toolbar />}

      {/* Vanilla/React sub-toggle (only show when Web is active) */}
      {!isEmbed && <div class="web-sub-toggle">
        <a
          href="/web"
          class={`web-sub-toggle__btn ${subMode === "vanilla" ? "active" : ""}`}
          aria-current={subMode === "vanilla" ? "page" : undefined}
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            switchSubMode("vanilla");
          }}
        >
          Vanilla
        </a>
        <a
          href="/react"
          class={`web-sub-toggle__btn ${subMode === "react" ? "active" : ""}`}
          aria-current={subMode === "react" ? "page" : undefined}
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            switchSubMode("react");
          }}
        >
          React
        </a>
        <ShareMenu label />
      </div>}

      {/* Editor + Preview */}
      {isMobile && isEmbed ? (
        <div class="embed-mobile-layout">
          {subMode === "react" ? <ReactEditor /> : <WebEditor />}
          {subMode === "react" ? <ReactPreview /> : <WebPreview />}
        </div>
      ) : isMobile ? (
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

      {!isEmbed && <StatusBar />}
      {isEmbed && <EmbedOpenLink />}
    </div>
  );
}
