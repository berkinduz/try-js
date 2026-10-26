import test from "node:test";
import assert from "node:assert/strict";
import { FEATURE_DEMOS } from "../src/data/feature-demos.ts";
import { FEATURES } from "../src/data/features.ts";
import { FEATURE_DEMO_IDS, isFeatureDemoId, isFeatureDemoActivity, featureDemoId } from "../src/utils/feature-demo-context.ts";
import { encodeToHash, decodeFromHash } from "../src/utils/share.ts";
import { playgroundPath } from "../src/utils/playground.ts";

test("live workflows use complete shareable states and matching full-editor destinations", () => {
  for (const [index, id] of FEATURE_DEMO_IDS.entries()) {
    const demo = FEATURE_DEMOS[id];
    assert.deepEqual(decodeFromHash(encodeToHash(demo.state)), demo.state);
    assert.equal(playgroundPath(demo.state), FEATURES[0].details[index].href);
  }
  assert.equal(featureDemoId(), null, "server rendering is not an embedded demo");
});

test("demo activity accepts only known IDs and bounded ready/open actions", () => {
  assert.equal(isFeatureDemoId("private-code"), false);
  assert.equal(isFeatureDemoId("react-state"), true);
  for (const action of ["loaded", "opened"]) {
    assert.equal(isFeatureDemoActivity({ type: "tryjs:feature-demo", demo: "check-code", action }, "check-code"), true);
  }
  for (const value of [null, {}, { type: "tryjs:feature-demo", demo: "react-state", action: "loaded" },
    { type: "tryjs:feature-demo", demo: "check-code", action: "run-code" }]) {
    assert.equal(isFeatureDemoActivity(value, "check-code"), false);
  }
});
