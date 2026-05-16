/**
 * Post-build script: stamps route-specific meta tags AND body SEO content
 * into copies of index.html for each known route.
 *
 * For each known route, this script:
 *  - Replaces <title>, meta description, og:url, og:title, og:description,
 *    twitter:title, twitter:description, and canonical link
 *  - Replaces the <section class="seo-content"> body block with
 *    route-specific HTML content so crawlers see correct H1/text
 *  - Writes the result to dist/{route}/index.html
 *
 * This ensures crawlers (Google, social bots) see the correct meta AND
 * body content without needing JS execution — critical for SPA SEO.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://tryjs.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-tryjs.png`;

// ── Route-specific body SEO content (replaces <section class="seo-content">) ──

function makeSeoSection(ariaLabel, h1, paragraphs) {
  const body = paragraphs
    .map((p) => {
      if (p.startsWith("<h2>")) return p;
      return `<p>${p}</p>`;
    })
    .join("\n      ");
  return `<section class="seo-content" id="about" aria-label="${ariaLabel}">
      <h1>${h1}</h1>
      ${body}
    </section>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function makeSnippetSeoSection(snippet) {
  const parts = [
    `<p>${escapeHtml(snippet.seoDescription)}</p>`,
  ];

  if (snippet.longDescription) {
    parts.push("<h2>Overview</h2>");
    parts.push(`<p>${escapeHtml(snippet.longDescription)}</p>`);
  }

  if (snippet.howItWorks?.length) {
    parts.push("<h2>How It Works</h2>");
    for (const section of snippet.howItWorks) {
      parts.push(`<h3>${escapeHtml(section.heading)}</h3>`);
      parts.push(`<p>${escapeHtml(section.body)}</p>`);
    }
  }

  if (snippet.commonMistakes?.length) {
    parts.push("<h2>Common Mistakes</h2>");
    parts.push(
      `<ul>${snippet.commonMistakes
        .map((mistake) => `<li>${escapeHtml(mistake)}</li>`)
        .join("")}</ul>`
    );
  }

  if (snippet.whenToUse) {
    parts.push("<h2>When to Use It</h2>");
    parts.push(`<p>${escapeHtml(snippet.whenToUse)}</p>`);
  }

  parts.push("<h2>Runnable Example</h2>");
  parts.push(`<pre><code>${escapeHtml(snippet.code)}</code></pre>`);
  parts.push(
    `<p>Open this example in the <a href="https://tryjs.app/">TryJS playground</a> to edit and run the code instantly in your browser — no signup needed.</p>`
  );

  if (snippet.faq?.length) {
    parts.push("<h2>Frequently Asked Questions</h2>");
    for (const item of snippet.faq) {
      parts.push(`<h3>${escapeHtml(item.question)}</h3>`);
      parts.push(`<p>${escapeHtml(item.answer)}</p>`);
    }
  }

  return `<section class="seo-content" id="about" aria-label="About ${escapeHtml(snippet.seoTitle)}">
      <h1>${escapeHtml(snippet.seoTitle)} | TryJS</h1>
      ${parts.join("\n      ")}
    </section>`;
}

function schemaScript(data) {
  return `<script type="application/ld+json">
      ${JSON.stringify(data, null, 8)}
    </script>`;
}

function buildStaticJsonLd(page) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TryJS",
      alternateName: "TryJS JavaScript Playground",
      url: `${BASE_URL}/`,
    },
  ];

  if (page.schema) {
    schemas.push(...page.schema);
  } else {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: `${BASE_URL}${page.route}`,
      isPartOf: {
        "@type": "WebSite",
        name: "TryJS",
        url: `${BASE_URL}/`,
      },
    });
  }

  return `<!-- Structured data: route-specific -->
    ${schemas.map(schemaScript).join("\n\n    ")}`;
}

const MAIN_PAGES = [
  {
    route: "/web",
    title: "Web Playground Online — HTML, CSS & JavaScript Editor | TryJS",
    description:
      "Free online web playground. Write HTML, CSS, and JavaScript in a tabbed editor with live preview. Build and prototype web pages directly in your browser — no setup required.",
    ogImage: "/tryjs_web.png",
    ogImageAlt: "TryJS Web Playground — HTML, CSS and JavaScript editor with live preview",
    body: makeSeoSection(
      "About TryJS Web Playground",
      "Web Playground Online — HTML, CSS & JavaScript Editor | TryJS",
      [
        "Free online web playground. Write HTML, CSS, and JavaScript in a tabbed editor with live preview. Build and prototype web pages directly in your browser — no setup required.",
        "<h2>HTML, CSS & JavaScript</h2>",
        "Write HTML, CSS, and JavaScript in a tabbed editor with live preview. No local server or bundler needed.",
        "<h2>Instant Preview</h2>",
        "See changes as you type. The built-in console captures logs, warnings, and errors.",
        "<h2>Looking for React?</h2>",
        "Try the <a href=\"https://tryjs.app/react\">TryJS React Playground</a> for JSX, hooks, and npm imports with live component preview.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads.",
      ]
    ),
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "TryJS Web Playground",
        description:
          "Free online web playground for writing HTML, CSS, and JavaScript with live preview.",
        url: "https://tryjs.app/web",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  {
    route: "/react",
    title: "React Playground Online — Write & Run React JSX Instantly | TryJS",
    description:
      "Free online React playground. Write React components with JSX, use hooks, import npm packages, and see live preview — all in your browser. No setup required.",
    ogImage: "/tryjs_web.png",
    ogImageAlt: "TryJS React Playground — JSX, hooks and npm imports with live preview",
    body: makeSeoSection(
      "About TryJS React Playground",
      "React Playground Online — Write & Run React JSX Instantly | TryJS",
      [
        "Free online React playground. Write React components with JSX, use hooks, import npm packages, and see live preview — all in your browser. No setup required.",
        "<h2>React JSX & Hooks</h2>",
        "Write React components with JSX, useState, useEffect, useRef, and more. Powered by React 19.",
        "<h2>NPM Packages</h2>",
        "Import npm packages via esm.sh. Try popular libraries instantly.",
        "<h2>Instant Preview</h2>",
        "See live component preview with instant updates as you type.",
        "<h2>Prefer plain HTML, CSS & JS?</h2>",
        "Use the <a href=\"https://tryjs.app/web\">TryJS Web Playground</a> for a tabbed HTML / CSS / JavaScript editor with live preview.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads.",
      ]
    ),
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "TryJS React Playground",
        description:
          "Free online React playground for writing JSX components with hooks, npm imports, and live preview.",
        url: "https://tryjs.app/react",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  },
  {
    route: "/snippets",
    title:
      "Runnable JavaScript Examples for the TryJS Playground",
    description:
      "Start from runnable JavaScript and TypeScript examples, then edit and run them in the TryJS playground. Covers JS fundamentals, async patterns, and TypeScript essentials.",
    body: makeSeoSection(
      "About TryJS Runnable Examples",
      "Runnable JavaScript Examples for the TryJS Playground",
      [
        "Start from runnable JavaScript and TypeScript examples, then edit and run them in the TryJS playground. These examples are supporting material for the playground, not a separate snippet-sharing product.",
        "<h2>JS Fundamentals</h2>",
        "Load map, filter, reduce, destructuring, spread and rest operators, closures, hoisting, optional chaining, nullish coalescing, and memoization examples directly into the playground.",
        "<h2>Async Patterns</h2>",
        "Run promises, async/await, Promise.all, Promise.race, Promise.allSettled, async iterators, and JavaScript event loop examples without setting up a local project.",
        "<h2>TypeScript Essentials</h2>",
        "Explore generics, type guards, utility types, and discriminated unions in runnable TypeScript examples that compile in the browser.",
        "<h2>Open in the Playground</h2>",
        "Every example is editable in TryJS, with the same live console, TypeScript support, npm imports, and shareable URLs as the main playground.",
      ]
    ),
  },
  {
    route: "/features",
    title:
      "TryJS Features — JS, TypeScript, Web & React Playground",
    description:
      "Explore TryJS features: run JavaScript and TypeScript online, build HTML/CSS/JS and React previews, import npm packages, share links, and export code images.",
    body: makeSeoSection(
      "About TryJS Features",
      "TryJS Features — Online JavaScript & TypeScript Playground",
      [
        "Explore TryJS features: run JavaScript and TypeScript online, import npm packages, build with HTML/CSS/JS or React, share runnable links, and export code as images.",
        "<h2>JavaScript & TypeScript Playground</h2>",
        "Write JavaScript or TypeScript and run it instantly in the browser with live console output, in-browser TypeScript transpilation, and sandboxed execution.",
        "<h2>Web & React Playground</h2>",
        "Build vanilla HTML pages or React components with JSX, hooks, and npm imports — all with live preview in the browser. Toggle between modes with a single click.",
        "<h2>NPM Imports</h2>",
        "Import packages through esm.sh without installing node_modules or configuring a bundler.",
        "<h2>Share & Export</h2>",
        "Generate shareable URLs that preserve editor state, embed the playground as an iframe in blog posts, or export code as styled PNG images with gradient backgrounds.",
        "<h2>Runnable Examples</h2>",
        "Use the examples library as a starting point when you want working JavaScript, async, or TypeScript patterns loaded into the playground.",
      ]
    ),
  },
];

// ── Extract detail pages from source data files ──────────────────────────

async function extractSnippetMeta() {
  const src = readFileSync(join(ROOT, "src/data/snippets.ts"), "utf-8");
  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`;
  const { SNIPPET_CATEGORIES } = await import(dataUrl);

  return SNIPPET_CATEGORIES.flatMap((category) =>
    category.snippets.map((snippet) => {
      const url = `${BASE_URL}/snippets/${snippet.slug}`;
      return {
        route: `/snippets/${snippet.slug}`,
        title: `${snippet.seoTitle} | TryJS`,
        description: snippet.seoDescription,
        body: makeSnippetSeoSection(snippet),
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: snippet.seoTitle,
            description: snippet.seoDescription,
            url,
            mainEntityOfPage: url,
            inLanguage: "en",
            keywords: snippet.keywords?.join(", "),
            author: {
              "@type": "Person",
              name: "berkinduz",
              url: "https://github.com/berkinduz",
            },
            publisher: {
              "@type": "Organization",
              name: "TryJS",
              url: BASE_URL,
            },
            proficiencyLevel: "Beginner",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "TryJS",
                item: `${BASE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Runnable Examples",
                item: `${BASE_URL}/snippets`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: snippet.title,
                item: url,
              },
            ],
          },
          ...(snippet.faq?.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: snippet.faq.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: f.answer,
                    },
                  })),
                },
              ]
            : []),
        ],
      };
    })
  );
}

// ── Stamp meta tags into HTML <head> ─────────────────────────────────────

function stampMeta(html, { route, title, description, ogImage, ogImageAlt }) {
  const url = `${BASE_URL}${route}`;
  const imageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${BASE_URL}${ogImage}`
    : DEFAULT_OG_IMAGE;
  const imageAlt = ogImageAlt || title;

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${url}$2`
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${url}$2`
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
      `$1${imageUrl}$2`
    )
    .replace(
      /(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/,
      `$1${imageAlt}$2`
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
      `$1${imageUrl}$2`
    )
    .replace(
      /(<meta\s+name="twitter:image:alt"\s+content=")[^"]*(")/,
      `$1${imageAlt}$2`
    );
}

// ── Stamp body SEO content into HTML <body> ──────────────────────────────

// Matches the entire <section class="seo-content">...</section> block
const SEO_SECTION_RE = /<section class="seo-content"[\s\S]*?<\/section>/;

function stampBody(html, bodyContent) {
  return html.replace(SEO_SECTION_RE, bodyContent);
}

function stampStaticJsonLd(html, page) {
  return html.replace(
    /<!-- Structured data: WebSite -->[\s\S]*?<!-- Umami analytics/,
    `${buildStaticJsonLd(page)}\n\n    <!-- Umami analytics`
  );
}

// ── Main ─────────────────────────────────────────────────────────────────

const baseHtml = readFileSync(join(DIST, "index.html"), "utf-8");

const allPages = [
  ...MAIN_PAGES,
  ...(await extractSnippetMeta()),
];

let count = 0;
for (const page of allPages) {
  let stamped = stampMeta(baseHtml, page);
  stamped = stampStaticJsonLd(stamped, page);
  stamped = stampBody(stamped, page.body);
  const dir = join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), stamped);
  count++;
}

console.log(`✓ Prerendered meta + body SEO content for ${count} routes`);

// ── Refresh sitemap lastmod dates to build time ──────────────────────────

const today = new Date().toISOString().slice(0, 10);
const sitemapPath = join(DIST, "sitemap.xml");
try {
  const sitemapSrc = readFileSync(sitemapPath, "utf-8");
  const refreshed = sitemapSrc.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  writeFileSync(sitemapPath, refreshed);
  console.log(`✓ Sitemap lastmod dates refreshed to ${today}`);
} catch (err) {
  console.warn(`⚠ Could not refresh sitemap: ${err.message}`);
}
