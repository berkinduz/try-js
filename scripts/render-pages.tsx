import { render } from "preact-render-to-string";
import { FeaturesPage } from "../src/components/Features/FeaturesPage";
import { SnippetsPage } from "../src/components/Snippets/SnippetsPage";
import { SnippetDetailPage } from "../src/components/Snippets/SnippetDetailPage";
import { PlaygroundLoading } from "../src/components/Playgrounds/PlaygroundLoading";
import startupStyles from "../src/components/Playgrounds/PlaygroundLoading.css?inline";
import { NotFoundPage } from "../src/components/NotFoundPage";
import { getIndexablePaths, getPageSeo, SITE_URL } from "../src/data/seo";
import { escapeHtml, renderSeoHead } from "../src/utils/seo";

export { getPageSeo };

export const indexablePaths = getIndexablePaths();
export const pagePaths = [...indexablePaths, "/embed", "/404"];

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
      <PlaygroundLoading path={path} />
    );
  const startup = ["/", "/web", "/react", "/embed"].includes(path);
  return template
    .replace(
      "</head>",
      () =>
        `${startup ? `<style id="startup-styles">${startupStyles}</style>` : ""}</head>`,
    )
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
