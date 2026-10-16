import { track } from "@vercel/analytics";
import {
  claimSessionEvent,
  classifyVisitor,
  hasSessionEvent,
  isMeaningfulEdit,
} from "./analytics-policy";

type EventProps = Record<string, string | number | boolean>;

export type AnalyticsSurface = "javascript" | "typescript" | "web" | "react";
export type RunTrigger = "auto" | "manual";

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
