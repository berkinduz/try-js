import { render } from "preact-render-to-string";
import { FeaturesPage } from "../src/components/Features/FeaturesPage";
import { SnippetsPage } from "../src/components/Snippets/SnippetsPage";
import { SnippetDetailPage } from "../src/components/Snippets/SnippetDetailPage";
import { NotFoundPage } from "../src/components/NotFoundPage";
import { getIndexablePaths, getPageSeo, SITE_URL } from "../src/data/seo";
import { escapeHtml, renderSeoHead } from "../src/utils/seo";

export { getPageSeo };

export const indexablePaths = getIndexablePaths();
export const pagePaths = [...indexablePaths, "/embed", "/404"];

function PageLoading({ path }: { path: string }) {
  const seo = getPageSeo(path);
  return (
    <main class="page-loading">
      <h1>{seo.heading}</h1>
      <p>{seo.description}</p>
      <p role="status">
        Loading the editor… JavaScript is required to edit and run code.
      </p>
      <nav aria-label="TryJS pages">
        <a href="/">JavaScript / TypeScript</a>
        <a href="/web">Web</a>
        <a href="/react">React</a>
        <a href="/features">Features</a>
        <a href="/snippets">Examples</a>
      </nav>
    </main>
  );
}

export function renderPage(template: string, path: string): string {
  const seo = getPageSeo(path);
  const content =
    seo.status === 404 ? (
      <NotFoundPage />
    ) : path === "/features" ? (
      <FeaturesPage />
    ) : path === "/snippets" ? (
      <SnippetsPage />
    ) : path.startsWith("/snippets/") ? (
      <SnippetDetailPage slug={path.slice("/snippets/".length)} />
    ) : (
      <PageLoading path={path} />
    );
  return template
    .replace(
      /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,
      () => `<!-- seo:start -->\n${renderSeoHead(seo)}\n<!-- seo:end -->`,
    )
    .replace(
      /<!-- app:start -->[\s\S]*?<!-- app:end -->/,
      () => `<!-- app:start -->${render(content)}<!-- app:end -->`,
    );
}

// No build-time lastmod: deployment time is not the last significant content edit.
export function renderSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePaths.map((path) => `  <url><loc>${escapeHtml(`${SITE_URL}${path}`)}</loc></url>`).join("\n")}\n</urlset>\n`;
}
