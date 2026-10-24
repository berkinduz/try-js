import { isExampleId, type ExampleId } from "../data/example-ids.ts";

export type ExamplePlacement = "inline" | "gallery";
export type ExampleAction = "loaded" | "edited" | "activated" | "opened";
export interface ExampleActivity {
  type: "tryjs:example";
  slug: ExampleId;
  action: ExampleAction;
}

export function inlineExampleId(): ExampleId | null {
  if (
    typeof window === "undefined" ||
    window.parent === window ||
    window.location.pathname.replace(/\/+$/, "") !== "/embed"
  )
    return null;
  const slug = new URLSearchParams(window.location.search).get("example");
  return isExampleId(slug) ? slug : null;
}

export function isExampleEmbed(): boolean {
  return inlineExampleId() !== null;
}
let galleryId: ExampleId | null = null;
let edited = false;
const reported = new Set<ExampleAction>();

export function startGalleryExample(slug: string) {
  galleryId = isExampleId(slug) ? slug : null;
  edited = false;
  reported.clear();
}

export function clearGalleryExample() {
  galleryId = null;
  edited = false;
  reported.clear();
}
export function hasExampleContext(): boolean {
  return isExampleEmbed() || galleryId !== null;
}
export function hasExampleEdit(): boolean {
  return edited;
}

/** Inline editors report only bounded activity; code stays inside their editor. */
export function reportExampleActivity(
  action: ExampleAction,
): { slug: ExampleId; placement: ExamplePlacement } | null {
  const inline = inlineExampleId();
  const slug = inline ?? galleryId;
  if (!slug || reported.has(action)) return null;
  if (action === "activated" && !edited) return null;
  if (action === "edited") edited = true;
  reported.add(action);
  if (inline) {
    try {
      window.parent.postMessage(
        { type: "tryjs:example", slug, action } satisfies ExampleActivity,
        window.location.origin,
      );
    } catch {
      /* Activity reporting cannot interrupt editing. */
    }
    return null;
  }
  return { slug, placement: "gallery" };
}

export function isExampleActivity(
  value: unknown,
  slug: string,
): value is ExampleActivity {
  if (!value || typeof value !== "object" || !isExampleId(slug)) return false;
  const data = value as Record<string, unknown>;
  return (
    data.type === "tryjs:example" &&
    data.slug === slug &&
    ["loaded", "edited", "activated", "opened"].includes(String(data.action))
  );
}
