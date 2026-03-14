import { useState, useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact";
import "./Toolbar.css";

const GITHUB_URL = "https://github.com/berkinduz/js-park";
const BMC_URL = "https://buymeacoffee.com/berkinduz";

interface Playground {
  path: string;
  label: string;
  title: string;
  icon: JSX.Element;
}

const ALL_PLAYGROUNDS: Playground[] = [
  {
    path: "/",
    label: "JS/TS",
    title: "JavaScript & TypeScript Playground",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1z" />
        <path d="M9 17V10l-2 3" />
        <path d="M15 10c-1.5 0-2 .5-2 1.5s.5 1.5 2 2 2 .5 2 1.5-.5 1.5-2 1.5" />
      </svg>
    ),
  },
  {
    path: "/web",
    label: "Web",
    title: "Web & React Playground",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    path: "/regex",
    label: "Regex",
    title: "Regex Playground",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

interface ToolbarLinksProps {
  currentPath: string;
}

export function ToolbarLinks({ currentPath }: ToolbarLinksProps) {
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

  const otherPlaygrounds = ALL_PLAYGROUNDS.filter(
    (pg) => pg.path !== currentPath
  );

  return (
    <div class="toolbar__right toolbar__right--links">
      {otherPlaygrounds.length > 0 && (
        <>
          <nav class="toolbar__playgrounds" aria-label="Other Playgrounds">
            <span class="toolbar__playgrounds-label">Other Playgrounds</span>
            <div class="toolbar__playgrounds-links">
              {otherPlaygrounds.map((pg) => (
                <a
                  key={pg.path}
                  href={pg.path}
                  class="toolbar__pg-link"
                  title={pg.title}
                >
                  {pg.icon}
                  {pg.label}
                </a>
              ))}
            </div>
          </nav>
          <div class="toolbar__separator" />
        </>
      )}

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
  );
}
