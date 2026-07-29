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

test("every playground exposes a tracked educator entry point without covering the editor", async () => {
  const [app, playground, toolbar, toolbarStyles] = await Promise.all([
    readSource("../src/app.tsx"),
    readSource("../src/components/WebPlayground/WebPlaygroundPage.tsx"),
    readSource("../src/components/Toolbar/ToolbarLinks.tsx"),
    readSource("../src/components/Toolbar/Toolbar.css"),
  ]);

  assert.match(app, /<Toolbar\s*\/>/);
  assert.match(playground, /<Toolbar\s*\/>/);
  assert.match(toolbar, /href="\/for-teachers"/);
  assert.match(toolbar, /Teach with TryJS/);
  assert.match(toolbar, /toolbar__educator-label--mobile">\s*Teach/);
  assert.match(toolbar, /trackProInterest\("toolbar", "educator_workflow"\)/);
  assert.match(toolbar, /toolbar__bmc toolbar__mobile-optional/);
  assert.match(toolbar, /toolbar__dropdown-item--mobile/);
  assert.match(
    toolbarStyles,
    /\.toolbar__educator\s*\{[^}]*display:\s*inline-flex[^}]*\}/s,
  );
  assert.match(
    toolbarStyles,
    /@media \(max-width: 360px\)[\s\S]*\.toolbar__mobile-optional\s*\{[^}]*display:\s*none/s,
  );
  assert.match(
    toolbarStyles,
    /@media \(max-width: 360px\)[\s\S]*\.toolbar__dropdown-item--mobile\s*\{[^}]*display:\s*flex/s,
  );
});

test("web and React playgrounds explain the contextual educator benefit", async () => {
  const playground = await readSource(
    "../src/components/WebPlayground/WebPlaygroundPage.tsx",
  );

  assert.match(playground, /href="\/for-teachers"/);
  assert.match(
    playground,
    /trackProInterest\("web_preview", "educator_workflow"\)/,
  );
  assert.match(playground, /Build lessons with runnable examples/);
  assert.match(playground, /web-sub-toggle__pro-mobile/);
  assert.match(playground, /Educator workflow →/);
  assert.match(playground, /web-sub-toggle__pro-context/);
});

test("the teacher page explains the real teacher-to-learner workflow", async () => {
  const [page, styles] = await Promise.all([
    readSource("../src/components/ForTeachers/ForTeachersPage.tsx"),
    readSource("../src/components/ForTeachers/ForTeachersPage.css"),
  ]);

  assert.match(page, /Turn one code example into a runnable lesson/);
  assert.match(page, /Create/);
  assert.match(page, /Share or embed/);
  assert.match(page, /Edit, run, and reset/);
  assert.match(page, /Open the working learner example/);
  assert.match(page, /encodeToHash/);
  assert.match(page, /Works free today/);
  assert.match(page, /JavaScript and TypeScript/);
  assert.match(page, /Web and React playgrounds/);
  assert.match(page, /do not have share or embed controls yet/);
  assert.match(styles, /width:\s*min\(1120px, calc\(100% - 24px\)\)/);
});

test("the teacher page separates free behavior from unavailable Pro proposals", async () => {
  const page = await readSource(
    "../src/components/ForTeachers/ForTeachersPage.tsx",
  );

  assert.match(page, /Pro ideas we are testing/);
  assert.match(page, /Organized library/);
  assert.match(page, /Saved examples/);
  assert.match(page, /Private examples/);
  assert.match(page, /Your branding/);
  assert.match(page, /not available yet/i);
  assert.match(page, /No payment/i);
  assert.match(page, /href=\{EDUCATOR_FEEDBACK_URL\}/);
  assert.match(page, /trackProLandingView\(\)/);
  assert.match(
    page,
    /trackProInterest\("for_teachers_page", "willingness_to_pay"\)/,
  );
  assert.doesNotMatch(page, /^\s*<form\b/m);
});

test("educator feedback uses a transparent public GitHub issue", async () => {
  const [demand, page] = await Promise.all([
    readSource("../src/utils/pro-demand.ts"),
    readSource("../src/components/ForTeachers/ForTeachersPage.tsx"),
  ]);

  assert.match(
    demand,
    /https:\/\/github\.com\/berkinduz\/try-js\/issues\/new\?/,
  );
  assert.match(demand, /Share educator workflow and Pro interest/);
  assert.match(demand, /teacher or technical author/);
  assert.match(demand, /Would you pay for/);
  assert.match(page, /opens GitHub/);
});

test("the route is prerendered, discoverable, and has decision metrics", async () => {
  const [prerender, sitemap, metrics] = await Promise.all([
    readSource("../scripts/prerender-meta.mjs"),
    readSource("../public/sitemap.xml"),
    readSource("../docs/pro-demand-validation.md"),
  ]);

  assert.match(prerender, /route: "\/for-teachers"/);
  assert.match(prerender, /Sharing and embedding are available in JavaScript and TypeScript/);
  assert.match(sitemap, /https:\/\/tryjs\.app\/for-teachers/);
  assert.match(metrics, /14-day test window/i);
  assert.match(metrics, /production deployment of this correction/i);
  assert.match(metrics, /willingness_to_pay/);
  assert.match(metrics, /Success threshold/i);
  assert.match(metrics, /Stop threshold/i);
  assert.match(metrics, /pro_interest/);
});
