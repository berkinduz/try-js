export type VisitorType = "new" | "returning";

export type AnalyticsStorage = Pick<Storage, "getItem" | "setItem">;

export const ANALYTICS_STORAGE_KEYS = {
  returningVisitor: "tryjs:analytics:returning:v1",
  sessionVisitorType: "tryjs:analytics:visitor-type:v1",
  sessionEventPrefix: "tryjs:analytics:session:v1:",
} as const;

const memorySessionClaims = new Set<string>();

/**
 * Classify this browser without cookies, a user ID, or a timestamp.
 * The only durable value is a boolean marker that a prior visit occurred.
 */
export function classifyVisitor(
  durableStorage: AnalyticsStorage,
  sessionStorage: AnalyticsStorage,
): VisitorType {
  try {
    const sessionType = sessionStorage.getItem(
      ANALYTICS_STORAGE_KEYS.sessionVisitorType,
    );
    if (sessionType === "new" || sessionType === "returning") return sessionType;

    const visitorType =
      durableStorage.getItem(ANALYTICS_STORAGE_KEYS.returningVisitor) === "1"
        ? "returning"
        : "new";
    durableStorage.setItem(ANALYTICS_STORAGE_KEYS.returningVisitor, "1");
    sessionStorage.setItem(
      ANALYTICS_STORAGE_KEYS.sessionVisitorType,
      visitorType,
    );
    return visitorType;
  } catch {
    // Storage can be blocked by browser privacy settings. Treat the visit as new.
  }
  return "new";
}

/**
 * A meaningful edit changes non-whitespace content. The content itself is never
 * returned or sent to analytics.
 */
export function isMeaningfulEdit(before: string, after: string): boolean {
  return before.trim() !== after.trim();
}

/** Claim an event key once per tab session, with an in-memory fallback. */
export function claimSessionEvent(storage: AnalyticsStorage, key: string): boolean {
  const storageKey = `${ANALYTICS_STORAGE_KEYS.sessionEventPrefix}${key}`;
  try {
    if (storage.getItem(storageKey) === "1") return false;
    storage.setItem(storageKey, "1");
    return true;
  } catch {
    if (memorySessionClaims.has(storageKey)) return false;
    memorySessionClaims.add(storageKey);
    return true;
  }
}

/** Claim one Pro-interest signal per source and intent in a tab session. */
export function claimProInterest(
  storage: AnalyticsStorage,
  source: string,
  intent: string,
): boolean {
  return claimSessionEvent(storage, `pro_interest:${source}:${intent}`);
}

/** Claim the teacher/author landing denominator once per tab session. */
export function claimProLandingView(storage: AnalyticsStorage): boolean {
  return claimSessionEvent(storage, "pro_landing_view:teachers_authors");
}

/** Check whether a tab-session event was already claimed. */
export function hasSessionEvent(storage: AnalyticsStorage, key: string): boolean {
  const storageKey = `${ANALYTICS_STORAGE_KEYS.sessionEventPrefix}${key}`;
  try {
    return (
      storage.getItem(storageKey) === "1" ||
      memorySessionClaims.has(storageKey)
    );
  } catch {
    return memorySessionClaims.has(storageKey);
  }
}
