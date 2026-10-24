// Bounded public identifiers: never accept code, URLs or search text as event properties.
export const EXAMPLE_IDS = [
  "deduplicate-objects",
  "group-array-by-property",
  "zod-validation",
  "typescript-result",
  "react-optimistic-ui",
  "react-form-actions",
  "vue-reactivity",
  "debounce-search",
  "css-container-queries",
  "canvas-drawing",
  "map-filter-reduce",
  "destructuring",
  "spread-rest",
  "closures",
  "map-set",
  "optional-chaining",
  "nullish-coalescing",
  "debounce-vs-throttle",
  "deep-clone",
  "this-keyword",
  "hoisting",
  "for-of-vs-for-in",
  "memoization",
  "promise-all",
  "async-await",
  "promise-race-allsettled",
  "event-loop",
  "async-iterators",
  "generics",
  "type-guards",
  "utility-types",
  "discriminated-unions",
] as const;

export type ExampleId = (typeof EXAMPLE_IDS)[number];
export function isExampleId(value: unknown): value is ExampleId {
  return (
    typeof value === "string" &&
    (EXAMPLE_IDS as readonly string[]).includes(value)
  );
}
