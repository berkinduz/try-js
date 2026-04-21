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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://tryjs.app";

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

const MAIN_PAGES = [
  {
    route: "/web",
    title: "Web & React Playground Online — HTML, CSS, JS & React JSX Editor | TryJS",
    description:
      "Free online web and React playground. Write HTML, CSS, and JavaScript with live preview, or switch to React mode for JSX with hooks and npm imports — all in your browser. No setup required.",
    body: makeSeoSection(
      "About TryJS Web Playground",
      "Web Playground Online — HTML, CSS & JavaScript Editor | TryJS",
      [
        "Free online web and React playground. Write HTML, CSS, and JavaScript with live preview, or switch to React mode for JSX with hooks and npm imports — all in your browser. No setup required.",
        "<h2>Vanilla HTML/CSS/JS Mode</h2>",
        "Write HTML, CSS, and JavaScript in a tabbed editor with live preview. Build and prototype web pages directly in the browser — no local server or bundler needed.",
        "<h2>React JSX Mode</h2>",
        "Write React components with JSX, useState, useEffect, and import npm packages via esm.sh. See live component preview powered by React 19 with instant updates as you type.",
        "<h2>Instant Preview & Console</h2>",
        "The built-in console captures logs, warnings, and errors. Toggle between Vanilla and React modes with one click. All code runs locally in your browser.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads, no server-side code execution.",
      ]
    ),
  },
  {
    route: "/regex",
    title:
      "Regex Playground Online — Test Regular Expressions Instantly | TryJS",
    description:
      "Free online regex tester and playground. Write regular expressions, see matches highlighted in real-time, explore capture groups, and browse a library of common regex patterns — all in your browser.",
    body: makeSeoSection(
      "About TryJS Regex Playground",
      "Regex Playground Online — Test Regular Expressions Instantly | TryJS",
      [
        "Free online regex tester and playground. Write regular expressions, see matches highlighted in real-time, explore capture groups, and browse a library of common regex patterns — all in your browser.",
        "<h2>Real-Time Match Highlighting</h2>",
        "Write a pattern, paste your test string, and see matches highlighted instantly. Toggle flags (g, i, m, s, u, d) and inspect capture groups and match indices.",
        "<h2>Explain Mode</h2>",
        "Break down any regex into human-readable steps. Understand how your pattern works without guessing. Perfect for learning and debugging complex regular expressions.",
        "<h2>Common Patterns Library</h2>",
        "Browse curated regex patterns for email validation, URL matching, phone numbers, IP addresses, password strength, date formats, HTML tags, credit cards, UUIDs, and more.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads, no server-side code execution.",
      ]
    ),
  },
  {
    route: "/snippets",
    title:
      "JavaScript & TypeScript Code Snippets — Runnable Examples | TryJS",
    description:
      "Browse runnable JavaScript and TypeScript code snippets. Closures, async/await, promises, destructuring, generics, type guards, and more — all editable in TryJS playground.",
    body: makeSeoSection(
      "About TryJS Code Snippets",
      "JavaScript & TypeScript Code Snippets — Runnable Examples | TryJS",
      [
        "Browse runnable JavaScript and TypeScript code snippets. Closures, async/await, promises, destructuring, generics, type guards, and more — all editable in the TryJS playground.",
        "<h2>JS Fundamentals</h2>",
        "Learn map, filter, reduce, destructuring, spread and rest operators, closures, hoisting, optional chaining, nullish coalescing, and memoization with runnable examples.",
        "<h2>Async Patterns</h2>",
        "Master promises, async/await, Promise.all, Promise.race, Promise.allSettled, async iterators, and the JavaScript event loop with interactive code snippets.",
        "<h2>TypeScript Essentials</h2>",
        "Explore generics, type guards, utility types, and discriminated unions in runnable TypeScript examples that compile in the browser instantly.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads, no server-side code execution.",
      ]
    ),
  },
  {
    route: "/features",
    title:
      "TryJS Features — NPM Imports, Snippets, Web & React Playground, Regex, Sharing & Export",
    description:
      "Explore TryJS features: import npm packages, browse code snippets, build with HTML/CSS/JS or React in Web Playground, test regex patterns, share runnable links, and export code as images.",
    body: makeSeoSection(
      "About TryJS Features",
      "TryJS Features — Online JavaScript & TypeScript Playground",
      [
        "Explore TryJS features: import npm packages, browse runnable code snippets, build with HTML/CSS/JS or React in Web Playground, test regex patterns, share runnable links, and export code as images.",
        "<h2>Start from Runnable Patterns</h2>",
        "Browse snippet cards for async flows, JS fundamentals, and TypeScript essentials. One click loads complete examples into the editor so you can experiment immediately.",
        "<h2>Web & React Playground</h2>",
        "Build vanilla HTML pages or React components with JSX, hooks, and npm imports — all with live preview in the browser. Toggle between modes with a single click.",
        "<h2>Regex Tester</h2>",
        "Write regular expressions, paste test strings, and see matches highlighted in real-time with capture group inspection and human-readable Explain mode.",
        "<h2>Share & Export</h2>",
        "Generate shareable URLs that preserve editor state, embed the playground as an iframe in blog posts, or export code as styled PNG images with gradient backgrounds.",
        "<h2>Free & Open Source</h2>",
        "TryJS is completely free under the MIT license. No signup, no ads, no server-side code execution.",
      ]
    ),
  },
];

// ── Extract detail pages from source data files ──────────────────────────

function extractSnippetMeta() {
  const src = readFileSync(join(ROOT, "src/data/snippets.ts"), "utf-8");
  const pages = [];
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
      body: makeSeoSection(
        `About ${titles[i]}`,
        `${titles[i]} | TryJS`,
        [
          descs[i],
          "Open this example in the <a href=\"https://tryjs.app/\">TryJS playground</a> to edit and run the code instantly in your browser — no signup needed.",
        ]
      ),
    });
  }
  return pages;
}

function extractRegexMeta() {
  const src = readFileSync(join(ROOT, "src/data/regexPatterns.ts"), "utf-8");
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
      body: makeSeoSection(
        `About ${titles[i]}`,
        `${titles[i]} | TryJS`,
        [
          descs[i],
          "Test this pattern in the <a href=\"https://tryjs.app/regex\">TryJS Regex Playground</a> — write your own test string, toggle flags, and inspect matches in real time.",
        ]
      ),
    });
  }
  return pages;
}

// ── Stamp meta tags into HTML <head> ─────────────────────────────────────

function stampMeta(html, { route, title, description }) {
  const url = `${BASE_URL}${route}`;

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
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    );
}

// ── Stamp body SEO content into HTML <body> ──────────────────────────────

// Matches the entire <section class="seo-content">...</section> block
const SEO_SECTION_RE = /<section class="seo-content"[\s\S]*?<\/section>/;

function stampBody(html, bodyContent) {
  return html.replace(SEO_SECTION_RE, bodyContent);
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
  let stamped = stampMeta(baseHtml, page);
  stamped = stampBody(stamped, page.body);
  const dir = join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), stamped);
  count++;
}

console.log(`✓ Prerendered meta + body SEO content for ${count} routes`);
