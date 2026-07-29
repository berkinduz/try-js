import { useState, useEffect, useRef } from "preact/hooks";
import { trackProInterest, trackSupportClick } from "../../utils/analytics";
import "./Toolbar.css";

const GITHUB_URL = "https://github.com/berkinduz/try-js";
const BMC_URL = "https://buymeacoffee.com/berkinduz";

export function ToolbarLinks(_: { currentPath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  return (
    <div class="toolbar__right toolbar__right--links">
      <a
        href="/for-teachers"
        class="toolbar__educator"
        title="Create runnable lessons and article examples"
        onClick={() => trackProInterest("toolbar", "educator_workflow")}
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
          aria-hidden="true"
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <span class="toolbar__educator-label toolbar__educator-label--desktop">
          Teach with TryJS
        </span>
        <span class="toolbar__educator-label toolbar__educator-label--mobile">
          Teach
        </span>
      </a>

      <div class="toolbar__menu-wrapper" ref={menuRef}>
        <button
          type="button"
          class={`toolbar__icon-btn toolbar__menu-trigger ${menuOpen ? "active" : ""}`}
          title="More"
          aria-label="More options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
        {menuOpen && (
          <div class="toolbar__dropdown">
            <a
              href="/snippets"
              class="toolbar__dropdown-item"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
                <line x1="14" y1="4" x2="10" y2="20" />
              </svg>
              Snippets
            </a>
            <a
              href="/features"
              class="toolbar__dropdown-item"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Features
            </a>
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="toolbar__dropdown-item toolbar__dropdown-item--mobile"
              onClick={() => {
                setMenuOpen(false);
                trackSupportClick("toolbar");
              }}
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
                <path d="M18 8h1a4 4 0 110 8h-1M2 8h14v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <path d="M6 2v3M10 2v3M14 2v3" />
              </svg>
              Buy Me a Coffee
            </a>
          </div>
        )}
      </div>

      <a
        href={BMC_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="toolbar__link toolbar__bmc toolbar__mobile-optional"
        title="Buy Me a Coffee"
        aria-label="Buy Me a Coffee"
        onClick={() => trackSupportClick("toolbar")}
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
  );
}
