import { useEffect } from "preact/hooks";
import { SNIPPET_CATEGORIES } from "../../data/snippets";
import "./SnippetsPage.css";

export function SnippetsPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "JavaScript & TypeScript Code Snippets — Runnable Examples | TryJS";

    const desc = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null;
    const prevDesc = desc?.getAttribute("content") ?? "";
    if (desc) {
      desc.setAttribute(
        "content",
        "Browse runnable JavaScript and TypeScript code snippets. Closures, async/await, promises, destructuring, generics, type guards, and more — all editable in TryJS playground.",
      );
    }

    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    const prevCanonical = canonical?.getAttribute("href") ?? "";
    if (canonical) {
      canonical.setAttribute("href", "https://tryjs.app/snippets");
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
          <h1>JavaScript & TypeScript Snippets</h1>
          <p>
            Runnable code examples covering JS fundamentals, async patterns, and
            TypeScript essentials. Click any snippet to see the code, then open
            it in the playground to edit and run.
          </p>
          <nav class="snippets-nav">
            <a class="snippets-btn snippets-btn--primary" href="/">
              Open Playground
            </a>
            <a class="snippets-btn" href="/web">
              Web Playground
            </a>
            <a class="snippets-btn" href="/regex">
              Regex Playground
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
            <a href="/regex">Regex</a>
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
