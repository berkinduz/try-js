import { track } from "@vercel/analytics";
import {
  claimSessionEvent,
  classifyVisitor,
  hasSessionEvent,
  isMeaningfulEdit,
  isUsageIntent,
} from "./analytics-policy";
import type { UsageIntent } from "./analytics-policy";
import { isExampleId } from "../data/example-ids";
import { hasExampleContext, hasExampleEdit, isExampleEmbed, reportExampleActivity } from "./example-context";
import type { ExampleAction, ExamplePlacement } from "./example-context";

type EventProps = Record<string, string | number | boolean>;

export type AnalyticsSurface = "javascript" | "typescript" | "web" | "react";
export type RunTrigger = "auto" | "manual";
export type UsageQuestionPlacement = "statusbar" | "invite";

const FIRST_MEANINGFUL_EDIT_KEY = "first_meaningful_edit";

const unavailableStorage: Pick<Storage, "getItem" | "setItem"> = {
  getItem() {
    throw new Error("Browser storage unavailable");
  },
  setItem() {
    throw new Error("Browser storage unavailable");
  },
};

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: EventProps) => void | Promise<unknown>;
    };
  }
}

const pendingUmami: { name: string; props?: EventProps }[] = [];
let stopWaitingForUmami: (() => void) | undefined;

function sendToUmami(name: string, props?: EventProps) {
  try {
    // A blocked collection request may reject asynchronously.
    void Promise.resolve(window.umami?.track(name, props)).catch(() => {});
  } catch { /* Analytics must never interrupt the playground. */ }
}

function flushUmami() {
  if (!window.umami) return;
  stopWaitingForUmami?.();
  for (const event of pendingUmami.splice(0)) sendToUmami(event.name, event.props);
}

function trackUmami(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  const script = document.getElementById("umami-tracker");
  if (!script) return;
  const domains = script.getAttribute("data-domains")?.split(",").map(domain => domain.trim());
  if (domains && !domains.includes(window.location.hostname)) return;
  if (window.umami) { flushUmami(); sendToUmami(name, props); return; }
  // Keep startup events until the deferred tracker loads, with bounded memory
  // and one deadline. Blockers never cause polling or persistent storage.
  if (pendingUmami.length < 50) pendingUmami.push({ name, props: props ? { ...props } : undefined });
  if (stopWaitingForUmami) return;
  const discard = () => { pendingUmami.length = 0; stopWaitingForUmami?.(); };
  const loaded = () => { flushUmami(); discard(); };
  const deadline = window.setTimeout(discard, 15_000);
  stopWaitingForUmami = () => {
    window.clearTimeout(deadline);
    script.removeEventListener("load", loaded);
    script.removeEventListener("error", discard);
    stopWaitingForUmami = undefined;
  };
  script.addEventListener("load", loaded, { once: true });
  script.addEventListener("error", discard, { once: true });
}

/** Send outcome events to both integrations; late Umami loading is non-blocking. */
export function trackEvent(name: string, props?: EventProps) {
  if (isExampleEmbed()) return;
  try {
    track(name, props);
  } catch {
    // Vercel Analytics not available (dev mode, blocked, etc.)
  }
  try {
    trackUmami(name, props);
  } catch {
    // Umami not loaded yet or blocked
  }
}

function getStorage(type: "localStorage" | "sessionStorage") {
  try {
    return window[type];
  } catch {
    return unavailableStorage;
  }
}

/** Track a cookie-free new/returning segment once when the app starts. */
export function initializeAnalytics() {
  if (typeof window === "undefined") return;
  if (isExampleEmbed()) return;
  const visitorType = classifyVisitor(
    getStorage("localStorage"),
    getStorage("sessionStorage"),
  );
  trackEvent("visitor_classified", { visitor_type: visitorType });
}

/** First mounted full playground in this tab, shared by all four surfaces. */
export function trackPlaygroundEntered(surface: AnalyticsSurface) {
  if (window.location.pathname === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "playground_entered")) return;
  trackEvent("playground_entered", { surface });
}

/** Measure the visible JS/TS empty state once per surface and tab session. */
export function trackEmptyEditorViewed(surface: "javascript" | "typescript") {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), `editor_empty_viewed:${surface}`)) return;
  trackEvent("editor_empty_viewed", { surface });
}

/** Loading the quick example is intent, not a user edit or activation. */
export function trackQuickExampleLoaded(surface: "javascript" | "typescript") {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  trackEvent("quick_example_loaded", { surface });
}

/** Optional feedback has a separate, once-per-tab response funnel. */
export function trackUsageQuestionViewed(surface: AnalyticsSurface) {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_question_viewed")) return;
  trackEvent("usage_question_viewed", { surface });
}

export function trackUsageQuestionOpened(surface: AnalyticsSurface, placement: UsageQuestionPlacement = "statusbar") {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (placement !== "statusbar" && placement !== "invite") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_question_opened")) return;
  trackEvent("usage_question_opened", { surface, placement });
}

export function trackUsageInviteViewed(surface: AnalyticsSurface) {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_invite_viewed")) return;
  trackEvent("usage_invite_viewed", { surface });
}

export function trackUsageInviteClicked(surface: AnalyticsSurface) {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_invite_clicked")) return;
  trackEvent("usage_invite_clicked", { surface });
}

export function trackUsageInviteDismissed(surface: AnalyticsSurface) {
  if (window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_invite_dismissed")) return;
  trackEvent("usage_invite_dismissed", { surface });
}

export function trackUsageIntentSelected(surface: AnalyticsSurface, intent: UsageIntent) {
  if (!isUsageIntent(intent) || window.location.pathname.replace(/\/+$/, "") === "/embed") return;
  if (!claimSessionEvent(getStorage("sessionStorage"), "usage_intent_selected")) return;
  trackEvent("usage_intent_selected", { surface, intent });
}

/** Measure a Features link's intent with bounded values, never its URL. */
export function trackFeaturesPlaygroundClick(
  href: string | undefined,
  placement: "navigation" | "hero" | "mode" | "faq" | "closing" | "footer",
) {
  const target = href === "/" ? "js-ts" : href === "/web" ? "web" : href === "/react" ? "react" : null;
  if (!target) return;
  trackEvent("features_playground_clicked", { target, placement });
}

/** Track the first user-authored non-whitespace edit in this tab session. */
export function trackFirstMeaningfulEdit(
  surface: AnalyticsSurface,
  before: string,
  after: string,
) {
  if (!isMeaningfulEdit(before, after)) return;
  const example = reportExampleActivity("edited");
  if (example) trackExampleActivity("edited", example.slug, example.placement);
  if (isExampleEmbed()) return;
  if (
    !claimSessionEvent(
      getStorage("sessionStorage"),
      FIRST_MEANINGFUL_EDIT_KEY,
    )
  ) {
    return;
  }
  trackEvent("first_meaningful_edit", { surface });
}

/**
 * Track the first successful run per surface and tab session. Auto-runs only
 * qualify after a meaningful user edit, so loading starter code is not counted
 * as activation.
 */
export function trackSuccessfulRun(
  surface: AnalyticsSurface,
  trigger: RunTrigger,
  eligibleAtStart: boolean,
  editedAtStart = trigger === "auto" && eligibleAtStart,
) {
  if (eligibleAtStart && editedAtStart) {
    const example = reportExampleActivity("activated");
    if (example) trackExampleActivity("activated", example.slug, example.placement);
  }
  if (isExampleEmbed()) return;
  if (!eligibleAtStart) return;
  const storage = getStorage("sessionStorage");
  if (claimSessionEvent(storage, `successful_run:${surface}`)) {
    trackEvent("successful_run", { surface, trigger });
  }
  // An earlier manual run of starter code must not consume edited activation.
  if (editedAtStart && window.location.pathname !== "/embed" && claimSessionEvent(storage, "activation_completed")) {
    trackEvent("activation_completed", { surface, trigger });
  }
}

/** Snapshot activation eligibility when a run or preview generation starts. */
export function isSuccessfulRunEligible(trigger: RunTrigger): boolean {
  if (hasExampleContext()) return trigger === "manual" || hasExampleEdit();
  return (
    trigger === "manual" ||
    hasSessionEvent(getStorage("sessionStorage"), FIRST_MEANINGFUL_EDIT_KEY)
  );
}

export function trackShareCreated(
  surface: AnalyticsSurface,
  scope: "document" | "selection",
  hasLengthWarning: boolean,
) {
  trackEvent("share_created", {
    surface,
    scope,
    length_warning: hasLengthWarning,
  });
}

export function trackEmbedCopied(surface: AnalyticsSurface) {
  trackEvent("embed_copied", { surface });
}

export function trackSupportClick(placement: "toolbar" | "examples" | "example", slug?: string) {
  if (placement === "example" && !isExampleId(slug)) return;
  trackEvent("support_clicked", { provider: "buy_me_a_coffee", placement, ...(placement === "example" ? { example: slug! } : {}) });
}

export function trackExampleActivity(action: ExampleAction | "viewed" | "shared", slug: string, placement: ExamplePlacement) {
  if (!isExampleId(slug) || !["inline", "gallery"].includes(placement) || !["viewed", "loaded", "edited", "activated", "opened", "shared"].includes(action)) return;
  // An automatic iframe mount and a reset never create more unique conversions.
  if (!claimSessionEvent(getStorage("sessionStorage"), `example:${action}:${placement}:${slug}`)) return;
  trackEvent(`example_${action}`, { example: slug, placement });
}
