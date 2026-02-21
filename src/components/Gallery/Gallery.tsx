import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import { SNIPPET_CATEGORIES } from "../../data/snippets";
import type { Snippet } from "../../data/snippets";
import { setCode, setLanguage, language } from "../../state/editor";
import { clearConsole } from "../../state/console";
import "./Gallery.css";

export const galleryOpen = signal(false);

export function openGallery() {
  galleryOpen.value = true;
}

function closeGallery() {
  galleryOpen.value = false;
}

function loadSnippet(snippet: Snippet) {
  clearConsole();
  if (snippet.language !== language.value) {
    setLanguage(snippet.language);
  }
  setCode(snippet.code);
  closeGallery();
}

export function Gallery() {
  const isOpen = galleryOpen.value;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div class="gallery-backdrop" onClick={closeGallery}>
      <div class="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div class="gallery-header">
          <h2 class="gallery-title">Snippets</h2>
          <button
            type="button"
            class="gallery-close"
            onClick={closeGallery}
            aria-label="Close gallery"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="gallery-body">
          {SNIPPET_CATEGORIES.map((category) => (
            <div key={category.name} class="gallery-category">
              <h3 class="gallery-category-name">{category.name}</h3>
              <div class="gallery-grid">
                {category.snippets.map((snippet) => (
                  <button
                    key={snippet.title}
                    type="button"
                    class="gallery-card"
                    onClick={() => loadSnippet(snippet)}
                  >
                    <span class="gallery-card-title">{snippet.title}</span>
                    <span class="gallery-card-desc">{snippet.description}</span>
                    <span class={`gallery-card-lang gallery-card-lang--${snippet.language === "typescript" ? "ts" : "js"}`}>
                      {snippet.language === "typescript" ? "TS" : "JS"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
