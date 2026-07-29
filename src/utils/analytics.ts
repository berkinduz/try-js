import { track } from "@vercel/analytics";
import {
  claimSessionEvent,
  claimProInterest,
  claimProLandingView,
  classifyVisitor,
  hasSessionEvent,
  isMeaningfulEdit,
} from "./analytics-policy";

type EventProps = Record<string, string | number | boolean>;

export type AnalyticsSurface = "javascript" | "typescript" | "web" | "react";
export type RunTrigger = "auto" | "manual";
export type ProInterestIntent =
  | "pricing"
  | "early_access"
  | "educator_workflow"
  | "willingness_to_pay";
export type ProInterestSource =
  | "toolbar"
  | "web_preview"
  | "features"
  | "pricing_page"
  | "embed_pro_page"
  | "for_teachers_page";

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
      track: (name: string, data?: EventProps) => void;
    };
  }
}

/**
 * Tracks an event in both Vercel Analytics and Umami.
 * Safe to call before Umami script has loaded — calls are no-ops in that case.
 */
export function trackEvent(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // Vercel Analytics not available (dev mode, blocked, etc.)
  }
  try {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(name, props);
    }
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
  const visitorType = classifyVisitor(
    getStorage("localStorage"),
    getStorage("sessionStorage"),
  );
  trackEvent("visitor_classified", { visitor_type: visitorType });
}

/** Track the first user-authored non-whitespace edit in this tab session. */
export function trackFirstMeaningfulEdit(
  surface: AnalyticsSurface,
  before: string,
  after: string,
) {
  if (!isMeaningfulEdit(before, after)) return;
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
) {
  if (!eligibleAtStart) return;
  const storage = getStorage("sessionStorage");
  if (!claimSessionEvent(storage, `successful_run:${surface}`)) return;
  trackEvent("successful_run", { surface, trigger });
}

/** Snapshot activation eligibility when a run or preview generation starts. */
export function isSuccessfulRunEligible(trigger: RunTrigger): boolean {
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

export function trackSupportClick(placement: "toolbar") {
  trackEvent("support_clicked", { provider: "buy_me_a_coffee", placement });
}

/** Track the teacher/author concept-page denominator once per tab session. */
export function trackProLandingView() {
  if (!claimProLandingView(getStorage("sessionStorage"))) return;
  trackEvent("pro_landing_view", { audience: "teachers_authors" });
}

/** Track one demand signal per placement, intent, and tab session. */
export function trackProInterest(
  source: ProInterestSource,
  intent: ProInterestIntent,
) {
  if (!claimProInterest(getStorage("sessionStorage"), source, intent)) return;
  trackEvent("pro_interest", { source, intent });
}
