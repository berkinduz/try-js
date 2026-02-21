import { useEffect, useMemo, useState } from "preact/hooks";
import "./FeaturesPage.css";

type FeatureItem = {
  id: string;
  tab: string;
  title: string;
  summary: string;
  points: string[];
  image: string;
  imageAlt: string;
};

const FEATURES: FeatureItem[] = [
  {
    id: "npm-imports",
    tab: "NPM Imports",
    title: "Run package-based examples without setup churn",
    summary:
      "Bare specifiers are rewritten to esm.sh and executed inside the sandbox, so experiments stay fast.",
    points: [
      "Use imports directly in editor code",
      "No local install, no bundler config",
      "Good for trying APIs before committing",
    ],
    image: "/tryjs_import.png",
    imageAlt: "TryJS NPM imports code example",
  },
  {
    id: "snippets",
    tab: "Snippets",
    title: "Start from runnable patterns, not blank files",
    summary:
      "Snippet cards load complete examples for async flows, JS fundamentals, and TypeScript essentials.",
    points: [
      "One click to load and run",
      "Good defaults for teaching and demos",
      "Quick path from idea to variation",
    ],
    image: "/tryjs.png",
    imageAlt: "TryJS snippet gallery and editor preview",
  },
  {
    id: "share-embed",
    tab: "Share / Embed",
    title: "Send runnable context instead of static code blocks",
    summary:
      "Share links preserve editor state, and embeds let docs include live examples with minimal overhead.",
    points: [
      "URL sharing with code state",
      "Iframe embed for docs and blog posts",
      "Selection-level sharing for focused examples",
    ],
    image: "/embed_code.png",
    imageAlt: "TryJS share and embed capabilities",
  },
  {
    id: "export-png",
    tab: "Export PNG",
    title: "Produce consistent code visuals in one pass",
    summary:
      "Export with frame, padding, syntax theme, and background presets for release notes and social content.",
    points: [
      "Uniform output dimensions",
      "Gradient and transparent backgrounds",
      "Download or copy-to-clipboard flow",
    ],
    image: "/export_image.png",
    imageAlt: "TryJS export to image preview",
  },
];

export function FeaturesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = FEATURES[activeIndex];

  const onTabsKeyDown = (event: KeyboardEvent) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight")
      nextIndex = (activeIndex + 1) % FEATURES.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (activeIndex - 1 + FEATURES.length) % FEATURES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = FEATURES.length - 1;
    else return;

    event.preventDefault();
    setActiveIndex(nextIndex);
    const nextTab = document.getElementById(
      `feature-tab-${FEATURES[nextIndex].id}`,
    );
    nextTab?.focus();
  };

  const progress = useMemo(
    () => `${(((activeIndex + 1) / FEATURES.length) * 100).toFixed(0)}%`,
    [activeIndex],
  );

  // Set page-specific meta for /features
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "TryJS Features — NPM Imports, Snippets, Sharing & Export";

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(
        `meta[${attr}="${key}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    setMeta(
      "name",
      "description",
      "Explore TryJS features: import npm packages, browse code snippets, share runnable links, embed playgrounds, and export code as images.",
    );

    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    const prevCanonical = canonical?.getAttribute("href") ?? "";
    if (canonical) {
      canonical.setAttribute("href", "https://tryjs.app/features");
    }

    return () => {
      document.title = prevTitle;
      if (canonical) canonical.setAttribute("href", prevCanonical);
    };
  }, []);

  return (
    <main class="features-page">
      <div class="features-shell">
        <header class="features-head">
          <div class="features-head__left">
            <p class="features-eyebrow">tryjs.app</p>
            <h1>Online JavaScript &amp; TypeScript Playground</h1>
            <p>
              TryJS is a fast JavaScript and TypeScript playground for testing
              ideas, importing npm packages, sharing runnable examples, and
              exporting code visuals.
            </p>
          </div>
          <div class="features-head__actions">
            <a class="features-btn features-btn--primary" href="/">
              Open Playground
            </a>
            <a
              class="features-btn"
              href="https://github.com/berkinduz/js-park"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          </div>
        </header>

        <section class="features-deck" aria-label="Feature showcase">
          <div
            class="features-tabs"
            role="tablist"
            aria-label="Feature tabs"
            onKeyDown={onTabsKeyDown}
          >
            {FEATURES.map((feature, idx) => (
              <button
                key={feature.id}
                id={`feature-tab-${feature.id}`}
                type="button"
                role="tab"
                aria-controls={`feature-panel-${feature.id}`}
                aria-selected={idx === activeIndex}
                tabIndex={idx === activeIndex ? 0 : -1}
                class={`features-tab ${idx === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                {feature.tab}
              </button>
            ))}
          </div>

          <article
            class="features-stage"
            role="tabpanel"
            id={`feature-panel-${active.id}`}
            aria-labelledby={`feature-tab-${active.id}`}
          >
            <section class="stage-copy">
              <span class="stage-copy__index">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(FEATURES.length).padStart(2, "0")}
              </span>
              <h2>{active.title}</h2>
              <p class="stage-copy__summary">{active.summary}</p>
              <ul class="stage-points">
                {active.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div class="stage-nav">
                <button
                  type="button"
                  class="stage-nav__btn"
                  onClick={() =>
                    setActiveIndex(
                      (prev) => (prev - 1 + FEATURES.length) % FEATURES.length,
                    )
                  }
                  aria-label="Previous feature"
                >
                  Prev
                </button>
                <button
                  type="button"
                  class="stage-nav__btn"
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % FEATURES.length)
                  }
                  aria-label="Next feature"
                >
                  Next
                </button>
              </div>
            </section>

            <figure class="stage-media">
              <img
                key={active.id}
                src={active.image}
                alt={active.imageAlt}
                loading="lazy"
                width="1200"
                height="630"
              />
            </figure>
          </article>

          <div class="stage-progress" aria-hidden>
            <span class="stage-progress__bar" style={{ width: progress }} />
          </div>
        </section>

        <footer class="features-footer">
          <a
            href="https://www.producthunt.com/products/tryjs?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-tryjs"
            target="_blank"
            rel="noopener noreferrer"
            class="features-footer__ph"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1083501&theme=dark&t=1771711071779"
              alt="TryJS - Write & run JS/TS in your browser — instantly, for free | Product Hunt"
              width="250"
              height="54"
            />
          </a>
          <nav class="features-footer__links" aria-label="Footer navigation">
            <a href="/">Playground</a>
            <span class="features-footer__dot" aria-hidden>
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
          <p class="features-footer__copy">
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
