import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { transform } from "sucrase";
import * as policy from "../src/utils/analytics-policy.ts";

function analytics(hostname = "tryjs.app", pathname = "/") {
  const delivered: string[] = [];
  const payloads: { name: string; props: unknown }[] = [];
  const vercel: string[] = [];
  const notifications: string[] = [];
  const session = new Map<string, string>();
  const listeners = new Map<string, () => void>();
  const deadlines = new Map<number, () => void>();
  let timeoutId = 0;
  const script = {
    getAttribute() { return "tryjs.app,www.tryjs.app"; },
    addEventListener(type: string, callback: () => void) { listeners.set(type, callback); },
    removeEventListener(type: string) { listeners.delete(type); },
  };
  const browser = {
    dispatchEvent(event: Event) { notifications.push(event.type); return true; },
    location: { hostname, pathname }, umami: undefined as { track: (name: string, props?: unknown) => void | Promise<unknown> } | undefined,
    setTimeout(callback: () => void) { const id = ++timeoutId; deadlines.set(id, callback); return id; },
    clearTimeout(id: number) { deadlines.delete(id); },
    localStorage: { getItem: () => null, setItem() {} },
    sessionStorage: { getItem: (key: string) => session.get(key) ?? null, setItem: (key: string, value: string) => session.set(key, value) },
  };
  const exports: Record<string, any> = {};
  const modules: Record<string, unknown> = {
    "@vercel/analytics": { track(name: string) { vercel.push(name); } }, "./analytics-policy": policy,
  };
  vm.runInNewContext(transform(readFileSync(new URL("../src/utils/analytics.ts", import.meta.url), "utf8"), { transforms: ["typescript", "imports"] }).code, {
    exports, window: browser, Event, document: { getElementById: () => script }, require: (id: string) => modules[id],
  });
  return { api: exports, delivered, payloads, vercel, browser, listeners, deadlines, notifications,
    ready() { browser.umami = { track(name: string, props?: unknown) { delivered.push(name); payloads.push({ name, props }); } }; listeners.get("load")?.(); } };
}

test("startup and early events wait for the deferred tracker and are delivered once in order", () => {
  const state = analytics();
  state.api.initializeAnalytics(); state.api.trackEvent("first_meaningful_edit", { surface: "javascript" });
  assert.equal(state.delivered.length, 0);
  assert.equal(state.deadlines.size, 1);
  state.ready(); state.api.trackEvent("playground_saved", { action: "create" });
  assert.deepEqual(state.delivered, ["visitor_classified", "first_meaningful_edit", "playground_saved"]);
  assert.deepEqual(state.vercel, state.delivered);
  assert.equal(state.deadlines.size, 0);
  assert.equal(state.listeners.size, 0);
});

test("blocked tracker has bounded memory and clears listeners after one deadline or error", () => {
  const state = analytics();
  for (let i = 0; i < 100; i++) state.api.trackEvent(`event_${i}`);
  assert.equal(state.deadlines.size, 1);
  state.ready(); assert.equal(state.delivered.length, 50);
  for (const outcome of ["timeout", "error"]) {
    const blocked = analytics(); blocked.api.trackEvent("startup");
    if (outcome === "timeout") [...blocked.deadlines.values()][0]();
    else blocked.listeners.get("error")?.();
    assert.equal(blocked.deadlines.size, 0); assert.equal(blocked.listeners.size, 0);
    blocked.ready(); assert.equal(blocked.delivered.length, 0);
  }
});

test("local and preview checks do not pollute the production Umami report", () => {
  const state = analytics("localhost");
  state.ready(); state.api.trackEvent("playground_saved");
  assert.equal(state.delivered.length, 0);
  assert.equal(state.deadlines.size, 0);
});

test("synchronous and asynchronous tracker failures never interrupt editing", async () => {
  const state = analytics(); state.ready();
  state.browser.umami!.track = () => { throw new Error("Blocked"); };
  assert.doesNotThrow(() => state.api.trackEvent("playground_saved"));
  state.browser.umami!.track = () => Promise.reject(new Error("Network blocked"));
  state.api.trackEvent("playground_opened");
  await new Promise(resolve => setImmediate(resolve));
});

test("activation starts once per tab at the first playground surface, including direct Web and React entries", () => {
  for (const surface of ["javascript", "typescript", "web", "react"]) {
    const state = analytics();
    state.api.trackPlaygroundEntered(surface);
    state.api.trackPlaygroundEntered("react");
    state.api.trackPlaygroundEntered(surface);
    state.ready();
    assert.deepEqual(state.delivered, ["playground_entered"]);
    assert.equal(JSON.stringify(state.payloads[0].props), JSON.stringify({ surface }));
  }
  const embed = analytics("tryjs.app", "/embed");
  embed.ready(); embed.api.trackPlaygroundEntered("javascript");
  assert.deepEqual(embed.delivered, []);
});

test("Features clicks send only an enumerated destination and placement", () => {
  const state = analytics(); state.ready();
  for (const href of ["/", "/web", "/react"]) state.api.trackFeaturesPlaygroundClick(href, "hero");
  for (const href of [undefined, "/snippets", "https://example.com/private", "/#code=secret"]) {
    state.api.trackFeaturesPlaygroundClick(href, "footer");
  }
  assert.deepEqual(state.delivered, Array(3).fill("features_playground_clicked"));
  assert.equal(JSON.stringify(state.payloads.map(item => item.props)), JSON.stringify([
    { target: "js-ts", placement: "hero" }, { target: "web", placement: "hero" }, { target: "react", placement: "hero" },
  ]));
});

test("empty-state views are deduplicated and quick example loads cannot activate an unedited tab", () => {
  const state = analytics(); state.ready();
  for (const surface of ["javascript", "typescript"]) {
    state.api.trackEmptyEditorViewed(surface);
    state.api.trackEmptyEditorViewed(surface);
  }
  state.api.trackQuickExampleLoaded("javascript");
  state.api.trackSuccessfulRun("javascript", "auto", state.api.isSuccessfulRunEligible("auto"));
  assert.deepEqual(state.delivered, ["editor_empty_viewed", "editor_empty_viewed", "quick_example_loaded"]);
  assert.deepEqual(state.notifications, []);
  state.api.trackFirstMeaningfulEdit("javascript", "const number = 2;", "const number = 4;");
  state.api.trackSuccessfulRun("javascript", "auto", state.api.isSuccessfulRunEligible("auto"));
  assert.deepEqual(state.delivered.slice(3), ["first_meaningful_edit", "successful_run", "activation_completed"]);
  assert.deepEqual(state.notifications, [policy.ACTIVATION_COMPLETED_EVENT]);

  for (const path of ["/embed", "/embed/"]) {
    const embed = analytics("tryjs.app", path); embed.ready();
    embed.api.trackEmptyEditorViewed("javascript");
    embed.api.trackQuickExampleLoaded("javascript");
    assert.deepEqual(embed.delivered, []);
  }
});

test("feedback invitation measures its first click separately from being shown", () => {
  const state = analytics(); state.ready();
  state.api.trackUsageInviteViewed("javascript");
  state.api.trackUsageInviteViewed("web");
  assert.deepEqual(state.delivered, ["usage_invite_viewed"]);
  state.api.trackUsageQuestionOpened("web", "invite");
  state.api.trackUsageQuestionOpened("react", "statusbar");
  assert.equal(JSON.stringify(state.payloads[1].props), JSON.stringify({ surface: "web", placement: "invite" }));
  state.api.trackUsageInviteDismissed("javascript");
  state.api.trackUsageInviteDismissed("web");
  assert.deepEqual(state.delivered, ["usage_invite_viewed", "usage_question_opened", "usage_invite_dismissed"]);
  assert.deepEqual(state.notifications, []);
  const invalid = analytics(); invalid.ready();
  invalid.api.trackUsageQuestionOpened("javascript", "private URL");
  assert.deepEqual(invalid.delivered, []);
  invalid.api.trackUsageQuestionOpened("javascript", "invite");
  assert.deepEqual(invalid.delivered, ["usage_question_opened"]);
  for (const path of ["/embed", "/embed/"]) {
    const embed = analytics("tryjs.app", path); embed.ready();
    embed.api.trackUsageInviteViewed("javascript");
    embed.api.trackUsageInviteDismissed("javascript");
    assert.deepEqual(embed.delivered, []);
  }
});

test("optional usage feedback is once per tab and accepts only the bounded intent values", () => {
  const state = analytics(); state.ready();
  for (const surface of ["javascript", "web", "react"]) {
    state.api.trackUsageQuestionViewed(surface);
    state.api.trackUsageQuestionOpened(surface);
  }
  for (const invalid of ["private source code", "https://example.com", null, { code: "secret" }]) {
    state.api.trackUsageIntentSelected("web", invalid);
  }
  assert.deepEqual(state.delivered, ["usage_question_viewed", "usage_question_opened"]);
  state.api.trackUsageIntentSelected("web", "try_web_ui");
  state.api.trackUsageIntentSelected("react", "other");
  assert.deepEqual(state.delivered, ["usage_question_viewed", "usage_question_opened", "usage_intent_selected"]);
  assert.equal(JSON.stringify(state.payloads[2].props), JSON.stringify({ surface: "web", intent: "try_web_ui" }));

  for (const intent of ["check_snippet", "learn_js_ts", "try_web_ui", "other"]) {
    const answer = analytics(); answer.ready();
    answer.api.trackUsageIntentSelected("javascript", intent);
    assert.equal(answer.delivered.length, 1);
  }
  for (const path of ["/embed", "/embed/"]) {
    const embed = analytics("tryjs.app", path); embed.ready();
    embed.api.trackUsageQuestionViewed("javascript");
    embed.api.trackUsageQuestionOpened("javascript");
    embed.api.trackUsageIntentSelected("javascript", "check_snippet");
    assert.deepEqual(embed.delivered, []);
  }
});

test("running starter code manually does not consume a later successful edited activation", () => {
  const state = analytics(); state.ready();
  state.api.trackSuccessfulRun("javascript", "manual", true, false);
  assert.deepEqual(state.delivered, ["successful_run"]);
  state.api.trackFirstMeaningfulEdit("javascript", "", "console.log(42)");
  state.api.trackSuccessfulRun("javascript", "auto", true);
  state.api.trackSuccessfulRun("javascript", "manual", true, true);
  state.api.trackSuccessfulRun("react", "auto", true);
  assert.deepEqual(state.delivered, ["successful_run", "first_meaningful_edit", "activation_completed", "successful_run"]);
  assert.equal(JSON.stringify(state.payloads[2].props), JSON.stringify({ surface: "javascript", trigger: "auto" }));
  assert.deepEqual(state.notifications, [policy.ACTIVATION_COMPLETED_EVENT]);
});

test("an edit made while an unedited manual run is in flight cannot activate that run", () => {
  const state = analytics(); state.ready();
  state.api.trackFirstMeaningfulEdit("typescript", "", "const value = 42");
  state.api.trackSuccessfulRun("typescript", "manual", true, false);
  assert.deepEqual(state.delivered, ["first_meaningful_edit", "successful_run"]);
  state.api.trackSuccessfulRun("typescript", "manual", true, true);
  assert.deepEqual(state.delivered, ["first_meaningful_edit", "successful_run", "activation_completed"]);
  const initialPreview = analytics(); initialPreview.ready();
  initialPreview.api.trackSuccessfulRun("web", "auto", false);
  assert.deepEqual(initialPreview.delivered, []);
  const embed = analytics("tryjs.app", "/embed"); embed.ready();
  embed.api.trackSuccessfulRun("javascript", "auto", true);
  assert.deepEqual(embed.delivered, ["successful_run"]);
  assert.deepEqual(embed.notifications, []);
});
