import assert from "node:assert/strict";

const baseUrl = new URL(process.argv[2] ?? process.env.EMBED_BASE_URL ?? "https://tryjs.app");
const cacheBust = `verify=${Date.now()}`;

async function fetchPage(pathname) {
  const url = new URL(pathname, baseUrl);
  url.search = cacheBust;
  const response = await fetch(url, { redirect: "follow" });
  assert.equal(response.status, 200, `${url.pathname} returned ${response.status}`);
  return { response, html: await response.text(), url };
}

const regularPages = await Promise.all([
  fetchPage("/"),
  fetchPage("/features"),
  fetchPage("/embed/not-an-embed-route"),
]);
const embed = await fetchPage("/embed");

for (const page of regularPages) {
  assert.equal(
    page.response.headers.get("x-frame-options"),
    "SAMEORIGIN",
    `${page.url.pathname} must keep X-Frame-Options: SAMEORIGIN`,
  );
  assert.equal(
    page.response.headers.get("content-security-policy"),
    "frame-ancestors 'self'",
    `${page.url.pathname} must only allow same-origin framing`,
  );
}
assert.equal(
  embed.response.headers.get("x-frame-options"),
  null,
  "the dedicated embed route must not send X-Frame-Options",
);
assert.equal(
  embed.response.headers.get("content-security-policy"),
  "frame-ancestors *",
  "the dedicated embed route must explicitly allow third-party framing",
);
assert.ok(
  embed.html.includes('location.pathname.replace(/\\/+$/, "")'),
  "the embed document must detect embed mode from its dedicated path",
);

console.log(`Embed policy verified at ${embed.url.origin}`);
console.log("  regular routes -> SAMEORIGIN + frame-ancestors 'self'");
console.log("  /embed        -> no X-Frame-Options + frame-ancestors *");
