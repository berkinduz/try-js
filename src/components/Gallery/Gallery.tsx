import { useEffect, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import type { Example } from "../../data/examples";
import { exampleLabel } from "../../data/examples";
import { applyPlayground } from "../../state/editor";
import { clearConsole } from "../../state/console";
import { trackEvent, trackExampleActivity } from "../../utils/analytics";
import { startGalleryExample } from "../../utils/example-context";
import { showToast } from "../Toast/Toast";
import { ExampleSearch, useExampleSearch } from "../Snippets/ExampleSearch";
import "../Snippets/SnippetsPage.css";
import "./Gallery.css";

export const galleryOpen = signal(false);
let opener: HTMLElement | null = null;
export function openGallery() {
  opener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  galleryOpen.value = true;
}
function closeGallery() {
  galleryOpen.value = false;
  opener?.focus({ preventScroll: true });
}

function loadExample(example: Example) {
  try {
    applyPlayground(example.state);
  } catch (cause) {
    showToast(
      cause instanceof Error
        ? cause.message
        : "This example could not be opened.",
      "error",
    );
    return;
  }
  clearConsole();
  startGalleryExample(example.slug);
  trackEvent("snippet_load", {
    title: example.title,
    language: example.language,
  });
  trackExampleActivity("loaded", example.slug, "gallery");
  closeGallery();
  requestAnimationFrame(() => {
    const editor = Array.from(
      document.querySelectorAll<HTMLElement>(".cm-content"),
    ).find((element) => element.getClientRects().length > 0);
    editor?.focus({ preventScroll: true });
  });
}

export function Gallery() {
  const isOpen = galleryOpen.value;
  const search = useExampleSearch();
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeGallery();
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          "button, input, select, a[href]",
        ) ?? [],
      ).filter((item) => item.getClientRects().length > 0);
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div class="gallery-backdrop" onClick={closeGallery}>
      <div
        class="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-title"
        ref={modalRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div class="gallery-header">
          <h2 id="gallery-title" class="gallery-title">
            Examples
          </h2>
          <button
            type="button"
            class="gallery-close"
            onClick={closeGallery}
            aria-label="Close examples"
          >
            ×
          </button>
        </div>
        <div class="gallery-search">
          <ExampleSearch search={search} compact autoFocus />
        </div>
        <div class="gallery-body">
          {search.results.length ? (
            <div class="gallery-grid">
              {search.results.map((example) => (
                <div class="gallery-example" key={example.slug}>
                  <button
                    type="button"
                    class="gallery-card"
                    onClick={() => loadExample(example)}
                  >
                    <span class="gallery-card-title">{example.title}</span>
                    <span class="gallery-card-desc">{example.description}</span>
                    <span class="gallery-card-lang">
                      {exampleLabel(example)} · Load example →
                    </span>
                  </button>
                  <a href={`/snippets/${example.slug}`} class="gallery-details">
                    Live page & explanation ↗
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p class="gallery-empty">
              No examples found.{" "}
              <button
                type="button"
                class="examples-text-button"
                onClick={search.reset}
              >
                Clear filters
              </button>
            </p>
          )}
        </div>
        <div class="gallery-footer">
          <a href="/snippets">Explore the example library ↗</a>
        </div>
      </div>
    </div>
  );
}
