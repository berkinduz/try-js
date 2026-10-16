import { SEO_SCHEMA_ID, SOCIAL_IMAGE } from "../data/seo.ts";
import type { PageSeo } from "../data/seo.ts";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function serializeSchema(schema: Record<string, unknown>[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schema,
  }).replace(/</g, "\\u003c");
}

function metaValues(page: PageSeo): ["name" | "property", string, string][] {
  return [
    ["name", "description", page.description],
    ["name", "robots", page.robots],
    ["property", "og:type", page.type],
    ["property", "og:site_name", "TryJS"],
    ["property", "og:locale", "en_US"],
    ["property", "og:title", page.title],
    ["property", "og:description", page.description],
    ["property", "og:image", SOCIAL_IMAGE.url],
    ["property", "og:image:alt", SOCIAL_IMAGE.alt],
    ["property", "og:image:width", String(SOCIAL_IMAGE.width)],
    ["property", "og:image:height", String(SOCIAL_IMAGE.height)],
    ["property", "og:image:type", "image/png"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", page.title],
    ["name", "twitter:description", page.description],
    ["name", "twitter:image", SOCIAL_IMAGE.url],
    ["name", "twitter:image:alt", SOCIAL_IMAGE.alt],
    ...(page.canonical
      ? [["property", "og:url", page.canonical] as ["property", string, string]]
      : []),
  ];
}

export function renderSeoHead(page: PageSeo): string {
  return [
    `<title>${escapeHtml(page.title)}</title>`,
    ...metaValues(page).map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...(page.canonical
      ? [`<link rel="canonical" href="${escapeHtml(page.canonical)}" />`]
      : []),
    ...(page.schema.length
      ? [
          `<script type="application/ld+json" id="${SEO_SCHEMA_ID}">${serializeSchema(page.schema)}</script>`,
        ]
      : []),
  ].join("\n    ");
}

/** Replace the route's head in place; a transition must never restore stale metadata. */
export function applySeo(page: PageSeo): void {
  document.title = page.title;
  for (const [attribute, key, value] of metaValues(page)) {
    const existing = [
      ...document.head.querySelectorAll<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      ),
    ];
    const element = existing.shift() ?? document.createElement("meta");
    element.setAttribute(attribute, key);
    element.content = value;
    if (!element.parentNode) document.head.appendChild(element);
    existing.forEach((duplicate) => duplicate.remove());
  }
  const canonicals = [
    ...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
  ];
  const canonical = canonicals.shift() ?? document.createElement("link");
  canonicals.forEach((duplicate) => duplicate.remove());
  if (page.canonical) {
    canonical.rel = "canonical";
    canonical.href = page.canonical;
    if (!canonical.parentNode) document.head.appendChild(canonical);
  } else {
    canonical.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
  }
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((element) => element.remove());
  if (page.schema.length) {
    const element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = SEO_SCHEMA_ID;
    element.textContent = serializeSchema(page.schema);
    document.head.appendChild(element);
  }
}
