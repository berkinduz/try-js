import test from "node:test";
import assert from "node:assert/strict";
import { getIndexablePaths, getPageSeo, SITE_URL } from "../src/data/seo.ts";
import { getAllSnippets } from "../src/data/snippets.ts";
import { FEATURES } from "../src/data/features.ts";
import { renderSeoHead, serializeSchema } from "../src/utils/seo.ts";

test("only real public pages are indexable, with unique descriptions and canonical URLs", () => {
  const paths = getIndexablePaths();
  assert.equal(new Set(paths).size, paths.length);
  assert.equal(paths.length, 5 + getAllSnippets().length);
  const pages = paths.map(getPageSeo);
  assert.equal(new Set(pages.map((page) => page.title)).size, paths.length);
  assert.equal(
    new Set(pages.map((page) => page.description)).size,
    paths.length,
  );
  for (const page of pages) {
    assert.equal(page.status, 200);
    assert.match(page.robots, /^index,/);
    assert.equal(page.canonical, `${SITE_URL}${page.path}`);
    assert.ok(page.title.includes("TryJS"));
    assert.ok(page.description.length > 80);
    assert.deepEqual(getPageSeo(`${page.path}/`), page);
  }
});

test("embed and invalid routes cannot inherit the homepage canonical or schema", () => {
  for (const path of [
    "/embed",
    "/embed/",
    "/not-a-page",
    "/snippets/not-a-snippet",
    "/constructor",
    "/toString",
    "/404",
  ]) {
    const page = getPageSeo(path);
    assert.match(page.robots, /^noindex,/);
    assert.equal(page.canonical, undefined);
    assert.deepEqual(page.schema, []);
    assert.equal(page.status, path.startsWith("/embed") ? 200 : 404);
    assert.doesNotMatch(
      renderSeoHead(page),
      /rel="canonical"|property="og:url"|application\/ld\+json/,
    );
  }
});

test("examples schema describes the entire visible collection and links to real details", () => {
  const collection = getPageSeo("/snippets").schema.find(
    (item) => item["@type"] === "CollectionPage",
  )!;
  const list = collection.mainEntity as {
    numberOfItems: number;
    itemListElement: { position: number; url: string }[];
  };
  assert.equal(list.numberOfItems, getAllSnippets().length);
  assert.equal(list.itemListElement.length, list.numberOfItems);
  list.itemListElement.forEach((item, index) => {
    assert.equal(item.position, index + 1);
    assert.equal(getPageSeo(new URL(item.url).pathname).type, "article");
  });
});

test("structured data has stable identities, real features and no invented review or FAQ claims", () => {
  for (const path of getIndexablePaths()) {
    const page = getPageSeo(path);
    const graph = JSON.parse(serializeSchema(page.schema));
    assert.equal(graph["@context"], "https://schema.org");
    assert.equal(
      new Set(
        graph["@graph"].map((item: Record<string, unknown>) => item["@id"]),
      ).size,
      page.schema.length,
    );
    assert.doesNotMatch(
      JSON.stringify(graph),
      /aggregateRating|reviewRating|FAQPage|no limitations|never lose/,
    );
  }
  const app = getPageSeo("/").schema.find(
    (item) => item["@type"] === "WebApplication",
  )!;
  const features = (app.featureList as string[]).join(" ");
  assert.match(features, /formatting/);
  assert.match(features, /copy actions/);
  assert.match(features, /Source navigation/);
  assert.match(features, /browser-local saves/);
});

test("HTML serialization preserves literal content and cannot close a structured-data script", () => {
  const page = {
    ...getPageSeo("/"),
    title: 'A < B & "quoted" $&',
    description: "Don't turn <code> into markup",
  };
  const head = renderSeoHead(page);
  assert.ok(
    head.includes("<title>A &lt; B &amp; &quot;quoted&quot; $&amp;</title>"),
  );
  assert.ok(head.includes('content="Don&#39;t turn &lt;code&gt; into markup"'));
  const value = '</script><script>alert("example")</script>';
  const serialized = serializeSchema([{ "@type": "WebPage", name: value }]);
  assert.ok(!serialized.includes("<"));
  assert.equal(JSON.parse(serialized)["@graph"][0].name, value);
});

test("Features schema follows the visible narrative and links to each section", () => {
  const page = getPageSeo("/features");
  const webPage = page.schema.find((item) => item["@type"] === "WebPage")!;
  const list = webPage.mainEntity as {
    numberOfItems: number;
    itemListElement: {
      position: number;
      name: string;
      description: string;
      url: string;
      item: { "@id": string; description: string };
    }[];
  };
  assert.deepEqual(
    FEATURES.map((section) => section.id),
    ["try-code", "understand-results", "share-or-save", "editor-comforts"],
  );
  assert.equal(list.numberOfItems, FEATURES.length);
  assert.equal(list.itemListElement.length, FEATURES.length);
  list.itemListElement.forEach((item, index) => {
    const section = FEATURES[index];
    assert.equal(item.position, index + 1);
    assert.equal(item.name, section.title);
    assert.equal(item.description, section.summary);
    assert.equal(item.url, `${page.canonical}#${section.id}`);
    assert.equal(item.item["@id"], item.url);
    for (const detail of section.details) {
      assert.ok(item.item.description.includes(detail.description));
      if (detail.href) assert.ok(getIndexablePaths().includes(detail.href));
    }
  });
});
