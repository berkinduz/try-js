import { useEffect } from "preact/hooks";
import { FEATURES, FEATURE_IMAGES } from "../../data/features";
import type { FeatureDetail, ProductImage } from "../../data/features";
import { getPageSeo } from "../../data/seo";
import {
  trackEvent,
  trackFeaturesPlaygroundClick,
} from "../../utils/analytics";
import "./FeaturesPage.css";

function ProductScreenshot({
  image,
  eager = false,
}: {
  image: ProductImage;
  eager?: boolean;
}) {
  return (
    <picture>
      <source
        media="(max-width: 600px)"
        srcSet={image.mobile.src}
        width={image.mobile.width}
        height={image.mobile.height}
      />
      {image.tablet && (
        <source
          media="(max-width: 1000px)"
          srcSet={image.tablet.src}
          width={image.tablet.width}
          height={image.tablet.height}
        />
      )}
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}

function FeatureCopy({
  detail,
  placement = "mode",
}: {
  detail: FeatureDetail;
  placement?: "mode" | "use-case";
}) {
  return (
    <div class="features-detail">
      <h3>{detail.title}</h3>
      <p>{detail.description}</p>
      {detail.href && (
        <a
          class="features-text-link"
          href={detail.href}
          onClick={() => trackFeaturesPlaygroundClick(detail.href, placement)}
        >
          {detail.linkLabel}
        </a>
      )}
    </div>
  );
}

export function FeaturesPage() {
  useEffect(() => {
    trackEvent("features_view");
  }, []);
  const [useCases, code, results, sharing, comforts] = FEATURES;

  return (
    <div class="features-page">
      <a class="features-skip" href="#features-content">
        Skip to content
      </a>
      <div class="features-shell">
        <header class="features-nav">
          <a
            class="features-brand"
            href="/"
            aria-label="TryJS playground"
            onClick={() => trackFeaturesPlaygroundClick("/", "navigation")}
          >
            <img src="/favicon.svg" width="32" height="32" alt="" />
            <span>TryJS</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="/snippets">Examples</a>
            <a
              href="https://github.com/berkinduz/try-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </header>

        <main id="features-content" tabIndex={-1}>
          <section class="features-intro" aria-labelledby="features-heading">
            <div>
              <h1 id="features-heading">{getPageSeo("/features").heading}</h1>
              <p class="features-intro__copy">
                A small playground for JavaScript, TypeScript, Web and React.
                Write or paste code and see the result, right in your browser.
              </p>
            </div>
            <div class="features-intro__action">
              <a
                class="features-open"
                href="/"
                onClick={() => trackFeaturesPlaygroundClick("/", "hero")}
              >
                Open Playground
              </a>
              <p>No account. No project setup.</p>
            </div>
          </section>

          <figure class="features-product">
            <ProductScreenshot image={FEATURE_IMAGES.playground} eager />
            <figcaption>Your code and its output, in one place.</figcaption>
          </figure>

          <section
            class="features-use-cases features-section"
            id={useCases.id}
            aria-labelledby={`${useCases.id}-heading`}
          >
            <div class="features-section-heading">
              <h2 id={`${useCases.id}-heading`}>{useCases.title}</h2>
              <p>{useCases.summary}</p>
            </div>
            <div class="features-use-cases__grid">
              {useCases.details.map((detail) => (
                <article class="features-use-case" key={detail.title}>
                  {detail.image && (
                    <img
                      class="features-use-case__image"
                      src={detail.image.src}
                      width={detail.image.width}
                      height={detail.image.height}
                      alt={detail.image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <FeatureCopy detail={detail} placement="use-case" />
                </article>
              ))}
            </div>
          </section>

          <section
            class="features-code features-section"
            id={code.id}
            aria-labelledby={`${code.id}-heading`}
          >
            <div class="features-section-heading">
              <h2 id={`${code.id}-heading`}>{code.title}</h2>
              <p>{code.summary}</p>
            </div>
            <div class="features-modes">
              {code.details.map((detail) => (
                <FeatureCopy key={detail.title} detail={detail} />
              ))}
            </div>
            <p class="features-example-link">
              Want a starting point?{" "}
              <a href="/snippets">Browse runnable examples</a> and make one your
              own.
            </p>
          </section>

          <section
            class="features-results features-section"
            id={results.id}
            aria-labelledby={`${results.id}-heading`}
          >
            <div class="features-results__copy">
              <div class="features-section-heading">
                <h2 id={`${results.id}-heading`}>{results.title}</h2>
                <p>{results.summary}</p>
              </div>
              <div class="features-results__details">
                {results.details.map((detail) => (
                  <FeatureCopy key={detail.title} detail={detail} />
                ))}
              </div>
            </div>
            <figure class="features-console">
              <ProductScreenshot image={FEATURE_IMAGES.console} />
              <figcaption>
                A missing item, an error, and a link back to the code.
              </figcaption>
            </figure>
          </section>

          <section
            class="features-sharing features-section"
            id={sharing.id}
            aria-labelledby={`${sharing.id}-heading`}
          >
            <div class="features-section-heading">
              <h2 id={`${sharing.id}-heading`}>{sharing.title}</h2>
              <p>{sharing.summary}</p>
            </div>
            <div class="features-sharing__body">
              <div class="features-sharing__details">
                {sharing.details.map((detail) => (
                  <FeatureCopy key={detail.title} detail={detail} />
                ))}
                <p class="features-sharing__note">
                  Shared links contain your code. Send them to people who should
                  have access.
                </p>
              </div>
              <figure class="features-saves">
                <ProductScreenshot image={FEATURE_IMAGES.saves} />
                <figcaption>For the ideas you want to come back to.</figcaption>
              </figure>
            </div>
          </section>

          <section
            class="features-comforts"
            id={comforts.id}
            aria-labelledby={`${comforts.id}-heading`}
          >
            <div class="features-section-heading">
              <h2 id={`${comforts.id}-heading`}>{comforts.title}</h2>
              <p>{comforts.summary}</p>
            </div>
            <div class="features-comforts__details">
              {comforts.details.map((detail) => (
                <FeatureCopy key={detail.title} detail={detail} />
              ))}
            </div>
          </section>

          <section
            class="features-questions features-section"
            aria-labelledby="questions-heading"
          >
            <div class="features-section-heading">
              <h2 id="questions-heading">Before you start</h2>
              <p>A few practical details.</p>
            </div>
            <div class="features-questions__list">
              <details>
                <summary>Do I need an account or a saved playground?</summary>
                <p>
                  No.{" "}
                  <a
                    href="/"
                    onClick={() => trackFeaturesPlaygroundClick("/", "faq")}
                  >
                    Open TryJS
                  </a>{" "}
                  and start typing. Named saves are optional and live in this
                  browser. Download a JSON copy to keep work outside browser
                  storage or move it to another device.
                </p>
              </details>
              <details>
                <summary>Which playground should I use?</summary>
                <p>
                  Use{" "}
                  <a
                    href="/"
                    onClick={() => trackFeaturesPlaygroundClick("/", "faq")}
                  >
                    JavaScript or TypeScript
                  </a>{" "}
                  for code and console output,{" "}
                  <a
                    href="/web"
                    onClick={() => trackFeaturesPlaygroundClick("/web", "faq")}
                  >
                    Web
                  </a>{" "}
                  for HTML, CSS and JavaScript together, or{" "}
                  <a
                    href="/react"
                    onClick={() =>
                      trackFeaturesPlaygroundClick("/react", "faq")
                    }
                  >
                    React
                  </a>{" "}
                  for JSX components and hooks.{" "}
                  <a href="/snippets">Runnable examples</a> are available when
                  you want a starting point.
                </p>
              </details>
              <details>
                <summary>
                  Can I use Node.js packages or a whole project?
                </summary>
                <p>
                  TryJS loads browser-compatible npm modules through esm.sh. It
                  does not provide a Node.js server, a local filesystem or a
                  multi-file project environment. Package imports and code that
                  makes network requests need an internet connection.
                </p>
              </details>
              <details>
                <summary>Where does my code run?</summary>
                <p>
                  Editing, execution, TypeScript checks and formatting happen in
                  your browser. Package imports contact external CDNs, and code
                  you run can make its own network requests. Shared links
                  contain a snapshot of your code.
                </p>
              </details>
            </div>
          </section>

          <section class="features-start" aria-labelledby="start-heading">
            <h2 id="start-heading">Have something to try?</h2>
            <a
              class="features-open"
              href="/"
              onClick={() => trackFeaturesPlaygroundClick("/", "closing")}
            >
              Open Playground
            </a>
          </section>
        </main>

        <footer class="features-footer">
          <nav aria-label="More from TryJS">
            <a
              href="/"
              onClick={() => trackFeaturesPlaygroundClick("/", "footer")}
            >
              JS / TS
            </a>
            <a
              href="/web"
              onClick={() => trackFeaturesPlaygroundClick("/web", "footer")}
            >
              Web
            </a>
            <a
              href="/react"
              onClick={() => trackFeaturesPlaygroundClick("/react", "footer")}
            >
              React
            </a>
            <a href="/snippets">Examples</a>
            <a
              href="https://github.com/berkinduz/try-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source on GitHub
            </a>
          </nav>
          <p>
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
    </div>
  );
}
