import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import {
  getAllExamples,
  findExample,
  filterExamples,
  relatedExamples,
  exampleSources,
} from "../src/data/examples.ts";
import * as ids from "../src/data/example-ids.ts";
import { parsePlayground } from "../src/utils/playground.ts";
import { encodeToHash, decodeFromHash } from "../src/utils/share.ts";
import { getPageSeo } from "../src/data/seo.ts";
import {
  REACT_VERSION,
  VUE_VERSION,
  ZOD_VERSION,
} from "../src/utils/runtime-versions.ts";

test("the searchable catalog preserves every old URL and every supported playground round-trips", () => {
  const examples = getAllExamples();
  assert.equal(
    new Set(examples.map((example) => example.slug)).size,
    examples.length,
  );
  assert.deepEqual(
    new Set(examples.map((example) => example.slug)),
    new Set(ids.EXAMPLE_IDS),
  );
  for (const example of examples) {
    assert.equal(getPageSeo(`/snippets/${example.slug}`).status, 200);
    assert.ok(parsePlayground(example.state));
    assert.deepEqual(
      decodeFromHash(encodeToHash(example.state)),
      parsePlayground(example.state),
    );
    assert.ok(
      example.tryThis.length > 20 && example.expectedResult.length > 20,
    );
    assert.ok(example.tags.length >= 2 && example.howItWorks?.length);
    assert.ok(
      exampleSources(example).every((source) => source.code.length > 0),
    );
  }
  for (const slug of ["map-set", "deep-clone", "event-loop", "generics"])
    assert.ok(findExample(slug));
  assert.deepEqual(
    new Set(examples.map((example) => example.technology)),
    new Set(["JavaScript", "TypeScript", "React", "Web"]),
  );
});

test("search combines task and package words with independent technology and goal filters", () => {
  assert.equal(
    filterExamples(" zOd validation ", "TypeScript", "solve")[0]?.slug,
    "zod-validation",
  );
  assert.equal(filterExamples("vue")[0]?.slug, "vue-reactivity");
  assert.equal(filterExamples("useActionState")[0]?.slug, "react-form-actions");
  assert.equal(filterExamples("Vue", "React").length, 0);
  assert.ok(
    filterExamples("", "React", "build").every(
      (example) => example.state.mode === "react",
    ),
  );
  assert.equal(filterExamples("no-such-package-or-task").length, 0);
  assert.equal(filterExamples("").length, getAllExamples().length);
});

test("related examples favor an actual shared task or technology and never include themselves", () => {
  const example = findExample("react-optimistic-ui")!;
  const related = relatedExamples(example);
  assert.equal(related[0].slug, "react-form-actions");
  assert.ok(related.every((item) => item.slug !== example.slug));
  assert.equal(new Set(related.map((item) => item.slug)).size, related.length);
});

test("package versions shown to users match the imports and shared React runtime", () => {
  assert.ok(
    findExample("zod-validation")!.state.code.includes(`zod@${ZOD_VERSION}`),
  );
  const vue = findExample("vue-reactivity")!;
  assert.ok(
    vue.state.mode === "web" && vue.state.webJs.includes(`vue@${VUE_VERSION}`),
  );
  for (const example of getAllExamples().filter(
    (item) => item.state.mode === "react",
  ))
    assert.ok(example.environment.includes(REACT_VERSION));
});

function context(embedded = true, search = "?example=deduplicate-objects") {
  const messages: { data: unknown; origin: string }[] = [];
  const exports: Record<string, any> = {};
  const browser: any = {
    location: {
      pathname: embedded ? "/embed" : "/",
      search,
      origin: "https://tryjs.app",
    },
  };
  browser.parent = embedded
    ? {
        postMessage(data: unknown, origin: string) {
          messages.push({ data, origin });
        },
      }
    : browser;
  vm.runInNewContext(
    transform(
      readFileSync(
        new URL("../src/utils/example-context.ts", import.meta.url),
        "utf8",
      ),
      { transforms: ["typescript", "imports"] },
    ).code,
    {
      exports,
      window: browser,
      URLSearchParams,
      require: () => ids,
    },
  );
  return { api: exports, messages, browser };
}

test("an inline example needs its own user edit before activation and reports no code or user values", () => {
  const { api, messages } = context();
  api.reportExampleActivity("loaded");
  api.reportExampleActivity("activated");
  assert.equal(messages.length, 1);
  api.reportExampleActivity("edited");
  api.reportExampleActivity("edited");
  api.reportExampleActivity("activated");
  api.reportExampleActivity("activated");
  assert.deepEqual(
    messages.map((item) => (item.data as any).action),
    ["loaded", "edited", "activated"],
  );
  for (const message of messages) {
    assert.equal(message.origin, "https://tryjs.app");
    assert.deepEqual(Object.keys(message.data as object).sort(), [
      "action",
      "slug",
      "type",
    ]);
  }
});

test("an unknown example cannot claim an inline context and a gallery replacement clears eligibility", () => {
  assert.equal(
    context(true, "?example=private-code-or-url").api.isExampleEmbed(),
    false,
  );
  const { api } = context(false);
  assert.equal(api.isExampleEmbed(), false);
  api.startGalleryExample("deduplicate-objects");
  api.reportExampleActivity("edited");
  assert.equal(api.hasExampleEdit(), true);
  api.startGalleryExample("react-form-actions");
  assert.equal(api.hasExampleEdit(), false);
  assert.equal(api.reportExampleActivity("activated"), null);
  api.clearGalleryExample();
  assert.equal(api.hasExampleContext(), false);
  assert.equal(api.reportExampleActivity("edited"), null);
  assert.equal(
    api.isExampleActivity(
      {
        type: "tryjs:example",
        slug: "deduplicate-objects",
        action: "activated",
      },
      "react-form-actions",
    ),
    false,
  );
});
