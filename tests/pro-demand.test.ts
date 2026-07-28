import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readSource = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("the app exposes an honest teacher-focused Pro concept route", async () => {
  const app = await readSource("../src/app.tsx");

  assert.match(app, /path === "\/for-teachers"/);
  assert.match(app, /<ForTeachersPage\s*\/>/);
});

test("web and React playgrounds show a contextual tracked teacher CTA", async () => {
  const playground = await readSource(
    "../src/components/WebPlayground/WebPlaygroundPage.tsx",
  );

  assert.match(playground, /href="\/for-teachers"/);
  assert.match(
    playground,
    /trackProInterest\("web_preview", "pricing"\)/,
  );
  assert.match(playground, /Teach or publish runnable examples\?/);
  assert.match(playground, /web-sub-toggle__pro-context/);
});

test("the teacher page labels proposed Pro capabilities as unavailable", async () => {
  const page = await readSource(
    "../src/components/ForTeachers/ForTeachersPage.tsx",
  );

  assert.match(page, /Saved examples/);
  assert.match(page, /Private examples/);
  assert.match(page, /Custom branding/);
  assert.match(page, /not available yet/i);
  assert.match(page, /No payment/i);
  assert.match(page, /href=\{EARLY_ACCESS_URL\}/);
  assert.match(page, /trackProLandingView\(\)/);
  assert.match(
    page,
    /trackProInterest\("for_teachers_page", "early_access"\)/,
  );
  assert.doesNotMatch(page, /^\s*<form\b/m);
});

test("early access uses a transparent public GitHub issue", async () => {
  const demand = await readSource("../src/utils/pro-demand.ts");

  assert.match(
    demand,
    /https:\/\/github\.com\/berkinduz\/try-js\/issues\/new\?/,
  );
  assert.match(demand, /Request TryJS Pro early access/);
  assert.match(demand, /teacher or technical author/);
});

test("the route is prerendered, discoverable, and has decision metrics", async () => {
  const [prerender, sitemap, metrics] = await Promise.all([
    readSource("../scripts/prerender-meta.mjs"),
    readSource("../public/sitemap.xml"),
    readSource("../docs/pro-demand-validation.md"),
  ]);

  assert.match(prerender, /route: "\/for-teachers"/);
  assert.match(sitemap, /https:\/\/tryjs\.app\/for-teachers/);
  assert.match(metrics, /30-day test window/i);
  assert.match(metrics, /Success threshold/i);
  assert.match(metrics, /Stop threshold/i);
  assert.match(metrics, /pro_interest/);
});
