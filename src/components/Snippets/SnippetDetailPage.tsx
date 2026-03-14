import { useEffect } from "preact/hooks";
import {
  findSnippetBySlug,
  getAllSnippets,
  type Snippet,
} from "../../data/snippets";
import { encodeToHash } from "../../utils/share";
import { applySeo } from "../../utils/seo";
import "./SnippetsPage.css";

function getRelatedSnippets(current: Snippet): Snippet[] {
  const all = getAllSnippets().filter((s) => s.slug !== current.slug);
  const sameLang = all.filter((s) => s.language === current.language);
  const others = all.filter((s) => s.language !== current.language);
  return [...sameLang, ...others].slice(0, 4);
}

export function SnippetDetailPage({ slug }: { slug: string }) {
  const result = findSnippetBySlug(slug);

  useEffect(() => {
    if (!result) return;
    const { snippet, category } = result;

    return applySeo({
      title: `${snippet.seoTitle} | TryJS`,
      description: snippet.seoDescription,
      canonical: `https://tryjs.app/snippets/${snippet.slug}`,
      jsonLd: [
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
              name: "Code Snippets",
              item: "https://tryjs.app/snippets",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: snippet.title,
              item: `https://tryjs.app/snippets/${snippet.slug}`,
            },
          ],
        },
      ],
      jsonLdId: "snippet-detail-schema",
    });
  }, [slug, result]);

  if (!result) {
    return (
      <main class="snippets-page">
        <div class="snippets-shell">
          <header class="snippets-head">
            <h1>Snippet not found</h1>
            <p>
              The snippet you're looking for doesn't exist.{" "}
              <a href="/snippets">Browse all snippets</a> or{" "}
              <a href="/">open the playground</a>.
            </p>
          </header>
        </div>
      </main>
    );
  }

  const { snippet, category } = result;
  const playgroundUrl = `/${encodeToHash({ code: snippet.code, language: snippet.language })}`;
  const related = getRelatedSnippets(snippet);

  return (
    <main class="snippets-page">
      <div class="snippets-shell">
        <header class="snippets-head">
          <p class="snippets-eyebrow">tryjs.app</p>
          <h1>{snippet.seoTitle}</h1>
          <p>{snippet.seoDescription}</p>
        </header>

        <div class="snippet-detail">
          <nav
            class="snippet-detail__breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">TryJS</a>
            <span aria-hidden>/</span>
            <a href="/snippets">Snippets</a>
            <span aria-hidden>/</span>
            <span>{snippet.title}</span>
          </nav>

          <article class="snippet-detail__card">
            <div class="snippet-detail__header">
              <h2>{snippet.title}</h2>
              <p>{snippet.description}</p>
              <div class="snippet-detail__meta">
                <span class="snippet-card__lang">{snippet.language}</span>
                <span class="snippet-card__lang">{category.name}</span>
              </div>
            </div>

            <div class="snippet-detail__code">
              <pre><code>{snippet.code}</code></pre>
            </div>

            <div class="snippet-detail__actions">
              <a class="snippets-btn snippets-btn--primary" href={playgroundUrl}>
                Run in Playground
              </a>
              <a class="snippets-btn" href="/snippets">
                All Snippets
              </a>
            </div>
          </article>

          {related.length > 0 && (
            <section class="snippet-related">
              <h2>More Snippets</h2>
              <div class="snippets-grid">
                {related.map((s) => (
                  <a
                    key={s.slug}
                    class="snippet-card"
                    href={`/snippets/${s.slug}`}
                  >
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <span class="snippet-card__lang">{s.language}</span>
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
            <a href="/snippets">Snippets</a>
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
