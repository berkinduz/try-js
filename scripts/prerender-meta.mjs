/**
 * Post-build script: stamps route-specific meta tags into copies of index.html.
 *
 * For each known route, this script:
 *  - Replaces <title>, meta description, og:url, og:title, og:description,
 *    twitter:title, twitter:description, and canonical link
 *  - Writes the result to dist/{route}/index.html
 *
 * This ensures crawlers (Google, social bots) see the correct meta without
 * needing JS execution — critical for SPA SEO.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://tryjs.app";

// ── Main pages (hardcoded meta) ──────────────────────────────────────────

const MAIN_PAGES = [
  {
    route: "/web",
    title: "Web Playground Online — HTML, CSS & JavaScript Editor | TryJS",
    description:
      "Free online web playground. Write HTML, CSS, and JavaScript in a tabbed editor with live preview. Switch to React mode for JSX with hooks and npm imports — all in your browser.",
  },
  {
    route: "/regex",
    title:
      "Regex Playground Online — Test Regular Expressions Instantly | TryJS",
    description:
      "Free online regex tester and playground. Write regular expressions, see matches highlighted in real-time, explore capture groups, and browse a library of common regex patterns — all in your browser.",
  },
  {
    route: "/snippets",
    title:
      "JavaScript & TypeScript Code Snippets — Runnable Examples | TryJS",
    description:
      "Browse runnable JavaScript and TypeScript code snippets. Closures, async/await, promises, destructuring, generics, type guards, and more — all editable in TryJS playground.",
  },
  {
    route: "/features",
    title:
      "TryJS Features — NPM Imports, Snippets, Web & React Playground, Regex, Sharing & Export",
    description:
      "Explore TryJS features: import npm packages, browse code snippets, build with HTML/CSS/JS or React in Web Playground, test regex patterns, share runnable links, and export code as images.",
  },
];

// ── Extract detail pages from source data files ──────────────────────────

function extractSnippetMeta() {
  const src = readFileSync(
    join(ROOT, "src/data/snippets.ts"),
    "utf-8"
  );
  const pages = [];
  // Match each snippet object: find slug, seoTitle, seoDescription
  const slugRe = /slug:\s*"([^"]+)"/g;
  const titleRe = /seoTitle:\s*"([^"]+)"/g;
  const descRe = /seoDescription:\s*"([^"]+)"/g;

  const slugs = [...src.matchAll(slugRe)].map((m) => m[1]);
  const titles = [...src.matchAll(titleRe)].map((m) => m[1]);
  const descs = [...src.matchAll(descRe)].map((m) => m[1]);

  for (let i = 0; i < slugs.length; i++) {
    pages.push({
      route: `/snippets/${slugs[i]}`,
      title: `${titles[i]} | TryJS`,
      description: descs[i],
    });
  }
  return pages;
}

function extractRegexMeta() {
  const src = readFileSync(
    join(ROOT, "src/data/regexPatterns.ts"),
    "utf-8"
  );
  const pages = [];
  const slugRe = /slug:\s*"([^"]+)"/g;
  const titleRe = /seoTitle:\s*"([^"]+)"/g;
  const descRe = /seoDescription:\s*(?:"([^"]+)"|`([^`]+)`)/g;

  const slugs = [...src.matchAll(slugRe)].map((m) => m[1]);
  const titles = [...src.matchAll(titleRe)].map((m) => m[1]);
  const descs = [...src.matchAll(descRe)].map((m) => m[1] || m[2]);

  for (let i = 0; i < slugs.length; i++) {
    pages.push({
      route: `/regex/${slugs[i]}`,
      title: `${titles[i]} | TryJS`,
      description: descs[i],
    });
  }
  return pages;
}

// ── Stamp meta tags into HTML ────────────────────────────────────────────

function stampMeta(html, { route, title, description }) {
  const url = `${BASE_URL}${route}`;

  return html
    // <title>
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    // meta description
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    // canonical
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${url}$2`
    )
    // og:url
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${url}$2`
    )
    // og:title
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    // og:description
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    // twitter:title
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    // twitter:description
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    );
}

// ── Main ─────────────────────────────────────────────────────────────────

const baseHtml = readFileSync(join(DIST, "index.html"), "utf-8");

const allPages = [
  ...MAIN_PAGES,
  ...extractSnippetMeta(),
  ...extractRegexMeta(),
];

let count = 0;
for (const page of allPages) {
  const stamped = stampMeta(baseHtml, page);
  const dir = join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), stamped);
  count++;
}

console.log(`✓ Prerendered meta tags for ${count} routes`);
