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
const outputFile = (path) =>
  path === "/404" ? "404.html" : join(path.slice(1), "index.html");
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
    assert.ok(html.includes("Format code when you choose"));
    assert.ok(html.includes("Keep an idea without creating an account"));
    assert.ok(html.includes("Follow errors and keep useful output"));
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
