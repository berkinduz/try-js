import { useEffect } from "preact/hooks";
import { SNIPPET_CATEGORIES } from "../../data/snippets";
import { getPageSeo } from "../../data/seo";
import { trackEvent } from "../../utils/analytics";
import "./SnippetsPage.css";

export function SnippetsPage() {
  useEffect(() => { trackEvent("snippets_index_view"); }, []);

  return (
    <main class="snippets-page">
      <div class="snippets-shell">
        <header class="snippets-head">
          <p class="snippets-eyebrow">tryjs.app</p>
          <h1>{getPageSeo("/snippets").heading}</h1>
          <p>
            Start from working JavaScript, async, and TypeScript examples, then
            open them in the TryJS playground to edit, run, share, or extend.
          </p>
          <nav class="snippets-nav">
            <a class="snippets-btn snippets-btn--primary" href="/">
              Open Playground
            </a>
            <a class="snippets-btn" href="/web">
              Web Playground
            </a>
            <a class="snippets-btn" href="/react">
              React Playground
            </a>
            <a class="snippets-btn" href="/features">
              Features
            </a>
          </nav>
        </header>

        {SNIPPET_CATEGORIES.map((category) => (
          <section class="snippets-category" key={category.name}>
            <h2>{category.name}</h2>
            <div class="snippets-grid">
              {category.snippets.map((snippet) => (
                <a
                  key={snippet.slug}
                  class="snippet-card"
                  href={`/snippets/${snippet.slug}`}
                >
                  <h3>{snippet.title}</h3>
                  <p>{snippet.description}</p>
                  <span class="snippet-card__lang">{snippet.language}</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <footer class="snippets-footer">
          <nav class="snippets-footer__links" aria-label="Footer navigation">
            <a href="/">Playground</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/web">Web</a>
            <span class="snippets-footer__dot" aria-hidden>
              ·
            </span>
            <a href="/react">React</a>
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
