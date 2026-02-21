import { useEffect, useRef, useState } from "preact/hooks";
import { language, setLanguage, code } from "../../state/editor";
import type { Language } from "../../state/editor";
import { shareToClipboard, generateEmbedCode } from "../../utils/share";
import { showToast } from "../Toast/Toast";
import { openGallery } from "../Gallery/Gallery";
import "./Toolbar.css";

const GITHUB_URL = "https://github.com/berkinduz/js-park";
const BMC_URL = "https://buymeacoffee.com/berkinduz";

export function Toolbar() {
  const currentLang = language.value;
  const setLang = (lang: Language) => () => setLanguage(lang);

  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click-outside or Escape
  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [shareOpen]);

  const handleCopyLink = async () => {
    setShareOpen(false);
    try {
      const result = await shareToClipboard({
        code: code.value,
        language: language.value,
      });
      if (result.warning) {
        showToast(result.warning, "warning", 4000);
      } else {
        showToast("Link copied to clipboard!");
      }
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleCopyEmbed = async () => {
    setShareOpen(false);
    try {
      const embedCode = generateEmbedCode({
        code: code.value,
        language: language.value,
      });
      await navigator.clipboard.writeText(embedCode);
      showToast("Embed code copied!");
    } catch {
      showToast("Failed to copy embed code", "error");
    }
  };

  return (
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="toolbar__brand">
          <div class="toolbar__lang-toggle">
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--js ${currentLang === "javascript" ? "active" : ""}`}
              onClick={setLang("javascript")}
              title="JavaScript"
              aria-label="JavaScript"
              aria-pressed={currentLang === "javascript"}
            >
              JS
            </button>
            <button
              type="button"
              class={`toolbar__logo toolbar__logo--ts ${currentLang === "typescript" ? "active" : ""}`}
              onClick={setLang("typescript")}
              title="TypeScript"
              aria-label="TypeScript"
              aria-pressed={currentLang === "typescript"}
            >
              TS
            </button>
          </div>
        </div>
      </div>

      <div class="toolbar__right toolbar__right--links">
        <button
          type="button"
          class="toolbar__icon-btn"
          onClick={openGallery}
          title="Browse snippets"
          aria-label="Browse snippets"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <div class="toolbar__share-wrap" ref={shareRef}>
          <button
            type="button"
            class={`toolbar__icon-btn ${shareOpen ? "active" : ""}`}
            onClick={() => setShareOpen(!shareOpen)}
            title="Share"
            aria-label="Share"
            aria-expanded={shareOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
          {shareOpen && (
            <div class="toolbar__dropdown">
              <button
                type="button"
                class="toolbar__dropdown-item"
                onClick={handleCopyLink}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Copy Link
              </button>
              <button
                type="button"
                class="toolbar__dropdown-item"
                onClick={handleCopyEmbed}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Copy Embed Code
              </button>
            </div>
          )}
        </div>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
