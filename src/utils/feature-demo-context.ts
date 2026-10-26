import { isExampleEmbed } from "./example-context.ts";

export const FEATURE_DEMO_IDS = ["check-code", "react-state", "share-repro"] as const;
export type FeatureDemoId = (typeof FEATURE_DEMO_IDS)[number];
type FeatureDemoAction = "loaded" | "opened";

export function isFeatureDemoId(value: unknown): value is FeatureDemoId {
  return FEATURE_DEMO_IDS.some((id) => id === value);
}

export function featureDemoId(): FeatureDemoId | null {
  if (typeof window === "undefined" || window.parent === window ||
      window.location.pathname.replace(/\/+$/, "") !== "/embed") return null;
  const id = new URLSearchParams(window.location.search).get("demo");
  return isFeatureDemoId(id) ? id : null;
}

/** Embedded examples and Features demos must not consume the main activation keys. */
export function isInlinePlayground(): boolean {
  return isExampleEmbed() || featureDemoId() !== null;
}

export function reportFeatureDemoActivity(action: FeatureDemoAction) {
  const demo = featureDemoId();
  if (!demo) return;
  try {
    window.parent.postMessage({ type: "tryjs:feature-demo", demo, action }, window.location.origin);
  } catch { /* Reporting cannot interrupt the editor. */ }
}

export function isFeatureDemoActivity(value: unknown, demo: FeatureDemoId): value is {
  type: "tryjs:feature-demo"; demo: FeatureDemoId; action: FeatureDemoAction;
} {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return data.type === "tryjs:feature-demo" && isFeatureDemoId(data.demo) && data.demo === demo &&
    (data.action === "loaded" || data.action === "opened");
}
