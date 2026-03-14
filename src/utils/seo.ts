/**
 * Centralized SEO helper for per-page meta tag management.
 * Updates title, description, canonical, Open Graph, and Twitter Card tags.
 * Returns a cleanup function that restores all previous values.
 */

export interface SeoConfig {
  title: string;
  description: string;
  canonical: string;
  /** Override OG image; defaults to homepage image */
  ogImage?: string;
  /** JSON-LD structured data to inject (array of schema objects) */
  jsonLd?: Record<string, unknown>[];
  /** Unique ID for the JSON-LD script tag so it can be cleaned up */
  jsonLdId?: string;
}

const BASE_URL = "https://tryjs.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-tryjs.png`;

function setMetaContent(selector: string, content: string): string {
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  const prev = el?.getAttribute("content") ?? "";
  if (el) el.setAttribute("content", content);
  return prev;
}

export function applySeo(config: SeoConfig): () => void {
  const prevTitle = document.title;
  document.title = config.title;

  // Description
  const prevDesc = setMetaContent('meta[name="description"]', config.description);

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const prevCanonical = canonical?.getAttribute("href") ?? "";
  if (canonical) canonical.setAttribute("href", config.canonical);

  // Open Graph
  const prevOgTitle = setMetaContent('meta[property="og:title"]', config.title);
  const prevOgDesc = setMetaContent('meta[property="og:description"]', config.description);
  const prevOgUrl = setMetaContent('meta[property="og:url"]', config.canonical);
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const prevOgImage = setMetaContent('meta[property="og:image"]', ogImage);

  // Twitter Card
  const prevTwTitle = setMetaContent('meta[name="twitter:title"]', config.title);
  const prevTwDesc = setMetaContent('meta[name="twitter:description"]', config.description);
  const prevTwImage = setMetaContent('meta[name="twitter:image"]', ogImage);

  // JSON-LD structured data
  if (config.jsonLd && config.jsonLdId) {
    // Remove existing if present (e.g. on subMode change)
    document.getElementById(config.jsonLdId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = config.jsonLdId;
    if (config.jsonLd.length === 1) {
      script.textContent = JSON.stringify(config.jsonLd[0]);
    } else {
      script.textContent = JSON.stringify(config.jsonLd);
    }
    document.head.appendChild(script);
  }

  return () => {
    document.title = prevTitle;
    setMetaContent('meta[name="description"]', prevDesc);
    if (canonical) canonical.setAttribute("href", prevCanonical);
    setMetaContent('meta[property="og:title"]', prevOgTitle);
    setMetaContent('meta[property="og:description"]', prevOgDesc);
    setMetaContent('meta[property="og:url"]', prevOgUrl);
    setMetaContent('meta[property="og:image"]', prevOgImage);
    setMetaContent('meta[name="twitter:title"]', prevTwTitle);
    setMetaContent('meta[name="twitter:description"]', prevTwDesc);
    setMetaContent('meta[name="twitter:image"]', prevTwImage);
    if (config.jsonLdId) {
      document.getElementById(config.jsonLdId)?.remove();
    }
  };
}
