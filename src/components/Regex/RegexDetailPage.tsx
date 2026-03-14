import { useEffect, useState, useCallback } from "preact/hooks";
import {
  findRegexBySlug,
  getAllRegexPatterns,
  type RegexPattern,
} from "../../data/regexPatterns";
import { RegexPlayground } from "./RegexPlayground";
import { applySeo } from "../../utils/seo";
import "./RegexPage.css";
import "../../components/Snippets/SnippetsPage.css";

function getRelatedPatterns(current: RegexPattern): RegexPattern[] {
  const all = getAllRegexPatterns().filter((p) => p.slug !== current.slug);
  const sameCat = all.filter((p) => p.category === current.category);
  const others = all.filter((p) => p.category !== current.category);
  return [...sameCat, ...others].slice(0, 4);
}

function CopyablePattern({ pattern, flags }: { pattern: string; flags: string }) {
  const [copied, setCopied] = useState(false);
  const text = `/${pattern}/${flags}`;
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <div class="regex-detail__pattern">
      <code>{text}</code>
      <button
        type="button"
        class="regex-copy-btn"
        onClick={handleCopy}
        title="Copy regex"
        aria-label="Copy regex"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function RegexDetailPage({ slug }: { slug: string }) {
  const pattern = findRegexBySlug(slug);

  useEffect(() => {
    if (!pattern) return;

    return applySeo({
      title: `${pattern.seoTitle} | TryJS`,
      description: pattern.seoDescription,
      canonical: `https://tryjs.app/regex/${pattern.slug}`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: pattern.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "TryJS",
              item: "https://tryjs.app/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Regex Playground",
              item: "https://tryjs.app/regex",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: pattern.title,
              item: `https://tryjs.app/regex/${pattern.slug}`,
            },
          ],
        },
      ],
      jsonLdId: "regex-detail-schema",
    });
  }, [slug, pattern]);

  if (!pattern) {
    return (
      <main class="snippets-page">
        <div class="snippets-shell">
          <header class="snippets-head">
            <h1>Pattern not found</h1>
            <p>
              The regex pattern you're looking for doesn't exist.{" "}
              <a href="/regex">Browse all regex patterns</a> or{" "}
              <a href="/">open the playground</a>.
            </p>
          </header>
        </div>
      </main>
    );
  }

  const related = getRelatedPatterns(pattern);

  return (
    <main class="snippets-page">
      <div class="snippets-shell">
        <header class="snippets-head">
          <p class="snippets-eyebrow">tryjs.app</p>
          <h1>{pattern.seoTitle}</h1>
          <p>{pattern.seoDescription}</p>
        </header>

        <div class="regex-detail">
          <nav
            class="snippet-detail__breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">TryJS</a>
            <span aria-hidden>/</span>
            <a href="/regex">Regex</a>
            <span aria-hidden>/</span>
            <span>{pattern.title}</span>
          </nav>

          <article class="regex-detail__card">
            <div class="regex-detail__header">
              <h2>{pattern.title}</h2>
              <p>{pattern.description}</p>
              <div class="regex-detail__meta">
                <span class="snippet-card__lang">{pattern.category}</span>
                <span class="snippet-card__lang">regex</span>
              </div>
            </div>

            {/* Pattern display */}
            <CopyablePattern pattern={pattern.pattern} flags={pattern.flags} />

            {/* Explanation */}
            <div class="regex-detail__section">
              <h3>Explanation</h3>
              <p>{pattern.explanation}</p>
            </div>

            {/* Step-by-step breakdown */}
            <div class="regex-detail__section">
              <h3>Step-by-Step Breakdown</h3>
              <ul class="regex-explain__list">
                {pattern.breakdown.map((b, i) => (
                  <li key={i} class="regex-explain__item">
                    <span class="regex-explain__token">{b.part}</span>
                    <span class="regex-explain__desc">{b.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use cases */}
            <div class="regex-detail__section">
              <h3>Common Use Cases</h3>
              <ul>
                {pattern.useCases.map((uc, i) => (
                  <li key={i}>{uc}</li>
                ))}
              </ul>
            </div>
          </article>

          {/* Interactive tester */}
          <section style={{ marginTop: "24px" }}>
            <h2 style={{ margin: "0 0 12px 2px", fontSize: "18px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              Try It — Interactive Tester
            </h2>
            <RegexPlayground
              key={pattern.slug}
              initialPattern={pattern.pattern}
              initialFlags={pattern.flags}
              initialTestInput={pattern.testInput}
            />
          </section>

          {/* FAQ */}
          {pattern.faq.length > 0 && (
            <section class="snippet-seo" style={{ marginTop: "24px" }}>
              <h2>Frequently Asked Questions</h2>
              {pattern.faq.map((f, i) => (
                <div key={i} style={{ marginBottom: i < pattern.faq.length - 1 ? "14px" : "0" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "14px", color: "var(--text-primary)" }}>
                    {f.question}
                  </h3>
                  <p style={{ margin: 0 }}>{f.answer}</p>
                </div>
              ))}
            </section>
          )}

          {/* Related patterns */}
          {related.length > 0 && (
            <section class="snippet-related" style={{ marginTop: "24px" }}>
              <h2>More Regex Patterns</h2>
              <div class="snippets-grid">
                {related.map((p) => (
                  <a
                    key={p.slug}
                    class="snippet-card"
                    href={`/regex/${p.slug}`}
                  >
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <span class="snippet-card__lang">{p.category}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

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
