import { useEffect } from "preact/hooks";
import { getRegexCategories } from "../../data/regexPatterns";
import { RegexPlayground } from "./RegexPlayground";
import "./RegexPage.css";
import "../../components/Snippets/SnippetsPage.css";

export function RegexPage() {
  const categories = getRegexCategories();

  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "Regex Playground Online — Test Regular Expressions Instantly | TryJS";

    const desc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    const prevDesc = desc?.getAttribute("content") ?? "";
    if (desc) {
      desc.setAttribute(
        "content",
        "Free online regex tester and playground. Write regular expressions, see matches highlighted in real-time, explore capture groups, and browse a library of common regex patterns — all in your browser."
      );
    }

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    const prevCanonical = canonical?.getAttribute("href") ?? "";
    if (canonical) {
      canonical.setAttribute("href", "https://tryjs.app/regex");
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
          <h1>Regex Playground</h1>
          <p>
            Test regular expressions in real-time. Write a pattern, paste your
            test string, and see matches highlighted instantly. Toggle flags,
            inspect capture groups, and use the "Explain" mode to break down any
            regex into human-readable steps.
          </p>
          <nav class="snippets-nav">
            <a class="snippets-btn snippets-btn--primary" href="/">
              JS Playground
            </a>
            <a class="snippets-btn" href="/snippets">
              Code Snippets
            </a>
            <a class="snippets-btn" href="/features">
              Features
            </a>
          </nav>
        </header>

        {/* Interactive playground */}
        <div class="regex-playground" style={{ marginTop: "24px" }}>
          <h2 style={{ margin: "0 0 12px 2px", fontSize: "18px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            Interactive Tester
          </h2>
          <RegexPlayground
            initialPattern={"\\b\\w+@\\w+\\.\\w{2,}\\b"}
            initialFlags="gi"
            initialTestInput={"alice@example.com\nBob.smith@Company.co.uk\nnot-an-email\njane@test.org"}
          />
        </div>

        {/* Pattern library */}
        {categories.map((cat) => (
          <section class="snippets-category" key={cat.name}>
            <h2>{cat.name}</h2>
            <div class="snippets-grid">
              {cat.patterns.map((p) => (
                <a
                  key={p.slug}
                  class="snippet-card"
                  href={`/regex/${p.slug}`}
                >
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <span class="snippet-card__lang">regex</span>
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
            <a href="/snippets">Snippets</a>
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
