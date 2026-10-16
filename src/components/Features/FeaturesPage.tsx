import { useEffect, useMemo, useState } from "preact/hooks";
import { FEATURES } from "../../data/features";
import { getPageSeo } from "../../data/seo";
import { trackEvent } from "../../utils/analytics";
import "./FeaturesPage.css";

export function FeaturesPage() {
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => {
    trackEvent("features_view");
  }, []);

  return (
    <main class="features-page">
      <div class="features-shell">
        <header class="features-head">
          <div class="features-head__left">
            <p class="features-eyebrow">tryjs.app</p>
            <h1>{getPageSeo("/features").heading}</h1>
            <p>
              Open TryJS, write or paste code, and see what happens. Use
              JavaScript or TypeScript, build a Web or React preview, and share
              an example when you need to. No account or project setup required.
            </p>
          </div>
          <div class="features-head__actions">
            <a class="features-btn features-btn--primary" href="/">
              Open Playground
            </a>
            <a
              class="features-btn"
              href="https://github.com/berkinduz/try-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
            <a
              href="https://www.producthunt.com/products/tryjs?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-tryjs"
              target="_blank"
              rel="noopener noreferrer"
              class="features-head__ph"
              title="Find us on Product Hunt"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1083501&theme=dark&t=1771711071779"
                alt="TryJS on Product Hunt"
                width="200"
                height="43"
              />
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

          {FEATURES.map((active, index) => (
            <article
              key={active.id}
              hidden={index !== activeIndex}
              class="features-stage"
              role="tabpanel"
              id={`feature-panel-${active.id}`}
              aria-labelledby={`feature-tab-${active.id}`}
            >
              <section class="stage-copy">
                <span class="stage-copy__index">
                  {String(index + 1).padStart(2, "0")} /{" "}
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
                        (prev) =>
                          (prev - 1 + FEATURES.length) % FEATURES.length,
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
                  loading={index === 0 ? "eager" : "lazy"}
                  width={active.imageWidth}
                  height={active.imageHeight}
                />
              </figure>
            </article>
          ))}

          <div class="stage-progress" aria-hidden>
            <span class="stage-progress__bar" style={{ width: progress }} />
          </div>
        </section>

        <section class="features-questions" aria-labelledby="questions-heading">
          <h2 id="questions-heading">Before you start</h2>
          <details>
            <summary>Do I need an account or a saved playground?</summary>
            <p>
              No. <a href="/">Open TryJS</a> and start typing. Named saves are
              optional and live in this browser. Download a JSON copy to keep
              work outside browser storage or move it to another device.
            </p>
          </details>
          <details>
            <summary>Which playground should I use?</summary>
            <p>
              Use <a href="/">JavaScript or TypeScript</a> for code and console
              output, <a href="/web">Web</a> for HTML, CSS and JavaScript
              together, or <a href="/react">React</a> for JSX components and
              hooks. <a href="/snippets">Runnable examples</a> are available
              when you want a starting point.
            </p>
          </details>
          <details>
            <summary>
              Can I use Node.js packages or run a whole project?
            </summary>
            <p>
              TryJS loads browser-compatible npm modules through esm.sh. It does
              not provide a Node.js server, a local filesystem or a multi-file
              project environment. Package imports and code that makes network
              requests need an internet connection.
            </p>
          </details>
          <details>
            <summary>Where does my code run?</summary>
            <p>
              Editing, execution, TypeScript checks and formatting happen in
              your browser. Package imports contact external CDNs, and code you
              run can make its own network requests. A shared link contains a
              snapshot of your code, so share it only with people who should
              have access.
            </p>
          </details>
        </section>

        <footer class="features-footer">
          <nav class="features-footer__links" aria-label="Footer navigation">
            <a href="/">Playground</a>
            <span class="features-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/web">Web</a>
            <span class="features-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/react">React</a>
            <span class="features-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/snippets">Snippets</a>
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
