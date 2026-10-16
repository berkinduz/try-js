import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  getIndexablePaths,
  getPageSeo,
  SITE_URL,
  SOCIAL_IMAGE,
} from "../src/data/seo.ts";
import { escapeHtml, serializeSchema } from "../src/utils/seo.ts";
import { FEATURES, FEATURE_IMAGES } from "../src/data/features.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const base = process.argv[2];
const paths = [...getIndexablePaths(), "/embed", "/404"];
const attribute = (tag, key) =>
  tag.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`))?.[1];
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(
    (match) => match[0],
  );
const escapeText = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const outputFile = (path) =>
  path === "/404" ? "404.html" : join(path.slice(1), "index.html");
// Read the dimensions from the image itself, not just its declared HTML attributes.
function webpDimensions(bytes) {
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  for (let offset = 12; offset + 8 < bytes.length;) {
    const kind = bytes.toString("ascii", offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (kind === "VP8 ")
      return [
        bytes.readUInt16LE(data + 6) & 0x3fff,
        bytes.readUInt16LE(data + 8) & 0x3fff,
      ];
    if (kind === "VP8L") {
      const size = bytes.readUInt32LE(data + 1);
      return [(size & 0x3fff) + 1, ((size >>> 14) & 0x3fff) + 1];
    }
    if (kind === "VP8X")
      return [
        bytes.readUIntLE(data + 4, 3) + 1,
        bytes.readUIntLE(data + 7, 3) + 1,
      ];
    offset = data + length + (length % 2);
  }
  throw new Error("WebP image has no dimension header");
}

const getText = async (path) => {
  if (!base) return readFile(join(dist, outputFile(path)), "utf8");
  const response = await fetch(new URL(path, base));
  assert.equal(
    response.status,
    getPageSeo(path).status,
    `${path}: HTTP status`,
  );
  assert.match(
    response.headers.get("content-type") ?? "",
    /text\/html/,
    `${path}: Content-Type`,
  );
  if (path === "/embed")
    assert.match(
      response.headers.get("x-robots-tag") ?? "",
      /noindex/,
      "/embed: HTTP noindex",
    );
  return response.text();
};

for (const path of paths) {
  const page = getPageSeo(path);
  const html = await getText(path);
  const head = html.split("</head>")[0];
  assert.equal((head.match(/<title>/g) ?? []).length, 1, `${path}: one title`);
  assert.ok(
    head.includes(`<title>${escapeHtml(page.title)}</title>`),
    `${path}: correct title`,
  );
  const editorRoute = ["/", "/web", "/react", "/embed"].includes(path);
  const hasEditorPreload = tags(head, "link").some(
    (tag) =>
      attribute(tag, "rel") === "modulepreload" &&
      /\/assets\/app-[^/]+\.js$/.test(attribute(tag, "href") ?? ""),
  );
  assert.equal(
    hasEditorPreload,
    editorRoute,
    `${path}: only editors preload the editor runtime`,
  );
  if (editorRoute) {
    const body = html.split("<body>")[1];
    const enhanced = body.replace(/<noscript>[\s\S]*?<\/noscript>/g, "");
    const noscript = body.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
    assert.ok(
      enhanced.includes('id="startup-skeleton"') &&
        enhanced.includes('aria-busy="true"'),
      `${path}: initial editor skeleton`,
    );
    assert.ok(
      !enhanced.includes(escapeHtml(page.description)),
      `${path}: no temporary description screen`,
    );
    assert.ok(
      noscript.includes(escapeHtml(page.description)) &&
        noscript.includes('href="/features"'),
      `${path}: useful no-JavaScript fallback`,
    );
    assert.ok(
      head.includes('id="startup-styles"'),
      `${path}: first paint has critical skeleton styles`,
    );
    assert.ok(
      !head.includes(".page-loading"),
      `${path}: old loading-page styles removed`,
    );
  }
  const metas = tags(head, "meta");
  const keys = metas
    .map((tag) => attribute(tag, "name") ?? attribute(tag, "property"))
    .filter(Boolean);
  assert.equal(
    keys.length,
    new Set(keys).size + 1,
    `${path}: only theme-color repeats with distinct media queries`,
  );
  for (const [name, value] of [
    ["description", page.description],
    ["robots", page.robots],
    ["og:title", page.title],
    ["og:description", page.description],
    ["twitter:title", page.title],
    ["twitter:description", page.description],
    ["og:image", SOCIAL_IMAGE.url],
  ]) {
    const tag = metas.find(
      (tag) =>
        attribute(tag, "name") === name || attribute(tag, "property") === name,
    );
    assert.ok(tag, `${path}: ${name} exists`);
    assert.equal(
      attribute(tag, "content"),
      escapeHtml(value),
      `${path}: ${name} agrees with route data`,
    );
  }
  const canonicals = tags(head, "link").filter(
    (tag) => attribute(tag, "rel") === "canonical",
  );
  assert.equal(
    canonicals.length,
    page.canonical ? 1 : 0,
    `${path}: canonical count`,
  );
  if (page.canonical)
    assert.equal(attribute(canonicals[0], "href"), page.canonical);
  const schemaScripts = [
    ...head.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(
    schemaScripts.length,
    page.schema.length ? 1 : 0,
    `${path}: one schema graph`,
  );
  if (page.schema.length)
    assert.deepEqual(
      JSON.parse(schemaScripts[0][1]),
      JSON.parse(serializeSchema(page.schema)),
      `${path}: schema agrees with route data`,
    );
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    `${path}: one primary heading`,
  );
  assert.ok(
    !html.includes('class="seo-content"'),
    `${path}: no detached SEO-only article`,
  );
  assert.ok(!head.includes('name="keywords"'), `${path}: no keyword list`);
  for (const tag of tags(html, "a")) {
    const href = attribute(tag, "href");
    if (!href) continue;
    const target = new URL(href.replace(/&amp;/g, "&"), `${SITE_URL}${path}`);
    if (target.origin === SITE_URL)
      assert.ok(
        getIndexablePaths().includes(target.pathname),
        `${path}: real internal link ${target.pathname}`,
      );
  }
  if (!base) {
    for (const tag of [
      ...tags(html, "script"),
      ...tags(html, "img"),
      ...tags(head, "link").filter(
        (tag) => attribute(tag, "rel") === "stylesheet",
      ),
    ]) {
      const src = attribute(tag, "src") ?? attribute(tag, "href");
      if (src?.startsWith("/")) await readFile(join(dist, src));
    }
  }
  if (path === "/features") {
    const body = html.slice(html.indexOf("<body"));
    assert.ok(
      !body.includes('role="tablist"'),
      "Features is a readable page, not a tabbed gallery",
    );
    let previousHeading = -1;
    for (const section of FEATURES) {
      const heading = `<h2 id="${section.id}-heading">${escapeText(section.title)}</h2>`;
      const position = body.indexOf(heading);
      assert.ok(
        position > previousHeading,
        `Features: ${section.id} is visible in narrative order`,
      );
      previousHeading = position;
      assert.ok(
        body.includes(`id="${section.id}"`),
        `Features: ${section.id} has a schema link target`,
      );
      assert.ok(
        body.includes(escapeText(section.summary)),
        `Features: ${section.id} summary is visible`,
      );
      for (const detail of section.details) {
        assert.ok(
          body.includes(`<h3>${escapeText(detail.title)}</h3>`),
          `Features: ${detail.title} is visible`,
        );
        assert.ok(
          body.includes(escapeText(detail.description)),
          `Features: ${detail.title} description is visible`,
        );
      }
    }
    for (const image of Object.values(FEATURE_IMAGES)) {
      for (const variant of [
        image,
        image.mobile,
        ...(image.tablet ? [image.tablet] : []),
      ]) {
        const tag = [...tags(body, "img"), ...tags(body, "source")].find(
          (tag) =>
            attribute(tag, "src") === variant.src ||
            attribute(tag, "srcset") === variant.src,
        );
        assert.ok(tag, `Features: ${variant.src} is rendered`);
        assert.equal(attribute(tag, "width"), String(variant.width));
        assert.equal(attribute(tag, "height"), String(variant.height));
        const bytes = base
          ? Buffer.from(
              await (await fetch(new URL(variant.src, base))).arrayBuffer(),
            )
          : await readFile(join(dist, variant.src));
        assert.deepEqual(
          webpDimensions(bytes),
          [variant.width, variant.height],
          `${variant.src}: real image dimensions`,
        );
      }
      const tag = tags(body, "img").find(
        (tag) => attribute(tag, "src") === image.src,
      );
      assert.equal(
        attribute(tag, "alt"),
        escapeHtml(image.alt),
        "Features: descriptive image alt text",
      );
    }
    assert.match(
      body,
      /loading="eager"[^>]*fetchPriority="high"/i,
      "Features: main screenshot loads eagerly",
    );
  }
  if (path.startsWith("/snippets/"))
    assert.ok(
      html.includes("Run in Playground") && html.includes("How It Works"),
      `${path}: actual article prerendered`,
    );
}

const sitemap = base
  ? await (await fetch(new URL("/sitemap.xml", base))).text()
  : await readFile(join(dist, "sitemap.xml"), "utf8");
assert.deepEqual(
  new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])),
  new Set(getIndexablePaths().map((path) => `${SITE_URL}${path}`)),
  "sitemap contains exactly the canonical indexable pages",
);
assert.ok(!sitemap.includes("<lastmod>"), "no misleading build-time lastmod");
const png = base
  ? Buffer.from(
      await (await fetch(new URL("/og-tryjs.png", base))).arrayBuffer(),
    )
  : await readFile(join(dist, "og-tryjs.png"));
assert.equal(
  png.subarray(1, 4).toString(),
  "PNG",
  "social card is an actual PNG",
);
assert.equal(png.readUInt32BE(16), SOCIAL_IMAGE.width);
assert.equal(png.readUInt32BE(20), SOCIAL_IMAGE.height);

if (base) {
  for (const path of [
    "/seo-audit-missing-page",
    "/snippets/seo-audit-missing-example",
    "/images/seo-audit-missing.png",
    "/constructor",
  ]) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 404, `${path}: genuine HTTP 404`);
    assert.ok(
      (await response.text()).includes("Page not found"),
      `${path}: useful 404 body`,
    );
  }
  for (const [path, destination] of [
    ["/web/", "/web"],
    ["/react/", "/react"],
    ["/index.html", "/"],
    ["/web/index.html", "/web"],
    ["/for-teachers", "/"],
    ["/regex/example", "/"],
  ]) {
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    assert.ok(
      [301, 308].includes(response.status),
      `${path}: permanent redirect`,
    );
    assert.equal(
      new URL(response.headers.get("location"), base).pathname,
      destination,
      `${path}: redirect target`,
    );
  }
}
console.log(
  `✓ SEO verified: ${paths.length} HTML documents, canonical URLs, structured data, internal links, social image and sitemap${base ? ", live 404s and redirects" : ""}`,
);
