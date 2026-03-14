import { useEffect, useRef, useState, useCallback } from "preact/hooks";
import { ReactEditor } from "../ReactEditor/ReactEditor";
import { ReactPreview } from "../ReactPreview/ReactPreview";
import { SplitPane } from "../SplitPane/SplitPane";
import { reactCode, setReactCode, mode } from "../../state/editor";
import { MOBILE_BREAKPOINT } from "../../utils/constants";
import "../../components/Snippets/SnippetsPage.css";

export function ReactPlaygroundPage() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Ensure react mode is active so editor/preview work correctly
  useEffect(() => {
    mode.value = "react";
  }, []);

  // SEO meta tags
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "React Playground Online — Write & Run React JSX Instantly | TryJS";

    const desc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    const prevDesc = desc?.getAttribute("content") ?? "";
    if (desc) {
      desc.setAttribute(
        "content",
        "Free online React playground. Write React components with JSX, see live preview instantly, import npm packages, and use hooks like useState and useEffect — all in your browser. No setup required."
      );
    }

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    const prevCanonical = canonical?.getAttribute("href") ?? "";
    if (canonical) {
      canonical.setAttribute("href", "https://tryjs.app/react");
    }

    return () => {
      document.title = prevTitle;
      if (desc) desc.setAttribute("content", prevDesc);
      if (canonical) canonical.setAttribute("href", prevCanonical);
    };
  }, []);

  return (
    <main class="snippets-page">
      <div class="snippets-shell">
        <header class="snippets-head">
          <p class="snippets-eyebrow">tryjs.app</p>
          <h1>React Playground</h1>
          <p>
            Write React components with JSX and see them render in real-time.
            Use hooks like useState and useEffect, import npm packages, and
            prototype UI ideas — all in your browser with zero setup.
          </p>
          <nav class="snippets-nav">
            <a class="snippets-btn snippets-btn--primary" href="/">
              JS Playground
            </a>
            <a class="snippets-btn" href="/regex">
              Regex Tester
            </a>
            <a class="snippets-btn" href="/snippets">
              Code Snippets
            </a>
            <a class="snippets-btn" href="/features">
              Features
            </a>
          </nav>
        </header>

        {/* Interactive playground */}
        <div style={{ marginTop: "24px" }}>
          <h2
            style={{
              margin: "0 0 12px 2px",
              fontSize: "18px",
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
            }}
          >
            Interactive Editor
          </h2>
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--border)",
              height: isMobile ? "500px" : "520px",
            }}
          >
            {isMobile ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    class={`mobile-tab ${mobileTab === "editor" ? "active" : ""}`}
                    onClick={() => setMobileTab("editor")}
                    style={{ flex: 1 }}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    class={`mobile-tab ${mobileTab === "preview" ? "active" : ""}`}
                    onClick={() => setMobileTab("preview")}
                    style={{ flex: 1 }}
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
                    <ReactEditor />
                  </div>
                  <div
                    style={{
                      height: "100%",
                      display: mobileTab === "preview" ? "block" : "none",
                    }}
                  >
                    <ReactPreview />
                  </div>
                </div>
              </div>
            ) : (
              <SplitPane left={<ReactEditor />} right={<ReactPreview />} />
            )}
          </div>
        </div>

        {/* Feature highlights */}
        <section class="snippets-category" style={{ marginTop: "48px" }}>
          <h2>What You Can Do</h2>
          <div class="snippets-grid">
            <div class="snippet-card">
              <h3>React Hooks</h3>
              <p>
                Use useState, useEffect, useRef, useMemo and other React hooks
                out of the box. Build interactive components instantly.
              </p>
              <span class="snippet-card__lang">hooks</span>
            </div>
            <div class="snippet-card">
              <h3>NPM Imports</h3>
              <p>
                Import any npm package with a standard import statement.
                Packages are loaded from esm.sh automatically.
              </p>
              <span class="snippet-card__lang">imports</span>
            </div>
            <div class="snippet-card">
              <h3>Live Preview</h3>
              <p>
                See your component render in real-time as you type. The preview
                updates automatically with smart debouncing.
              </p>
              <span class="snippet-card__lang">preview</span>
            </div>
            <div class="snippet-card">
              <h3>Console Output</h3>
              <p>
                Built-in console captures logs, warnings, and errors from your
                React components for easy debugging.
              </p>
              <span class="snippet-card__lang">console</span>
            </div>
          </div>
        </section>

        <footer class="snippets-footer">
          <nav class="snippets-footer__links" aria-label="Footer navigation">
            <a href="/">Playground</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/regex">Regex</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/snippets">Snippets</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/features">Features</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a
              href="https://github.com/berkinduz/try-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
          <p class="snippets-footer__copy">
            Built by{" "}
            <a
              href="https://github.com/berkinduz"
              target="_blank"
              rel="noopener noreferrer"
            >
              berkinduz
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
