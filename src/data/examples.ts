import { getAllSnippets, type Snippet } from "./snippets.ts";
import {
  playgroundLabel,
  playgroundSurface,
  type PlaygroundState,
} from "../utils/playground.ts";

export const TECHNOLOGIES = [
  "All",
  "JavaScript",
  "TypeScript",
  "React",
  "Web",
] as const;
export type ExampleTechnology = (typeof TECHNOLOGIES)[number];
export const GOALS = [
  { value: "all", label: "Any goal" },
  { value: "solve", label: "Solve a task" },
  { value: "explore", label: "Explore a behavior" },
  { value: "build", label: "Build something" },
] as const;
export type ExampleGoal = (typeof GOALS)[number]["value"];

type LegacyGuide = [tags: string[], tryThis: string, expectedResult: string];
const guides: Record<string, LegacyGuide> = {
  "map-filter-reduce": [
    ["Arrays", "Data"],
    "Change the numbers or keep odd numbers instead of even ones.",
    "The example prints doubled numbers, even numbers, their sum, and a chained total.",
  ],
  destructuring: [
    ["Objects", "Arrays", "Syntax"],
    "Remove a property from the sample object and observe its default value.",
    "The logs show extracted values, defaults and renamed properties.",
  ],
  "spread-rest": [
    ["Objects", "Arrays", "Syntax"],
    "Change a property in an object being merged. Which value wins?",
    "The logs compare copying, merging and collecting remaining values.",
  ],
  closures: [
    ["Functions", "Scope"],
    "Create a second counter and compare its value with the first.",
    "Each closure keeps its own state between function calls.",
  ],
  "map-set": [
    ["Map", "Set", "Data"],
    "Add another repeated number to nums. Then try adding two separate objects with the same fields to a Set.",
    "The Set removes repeated primitive values. Map entries retain their insertion order.",
  ],
  "optional-chaining": [
    ["Objects", "Debugging"],
    "Remove a nested property and compare optional access with direct access.",
    "Optional access safely returns undefined when an intermediate value is missing.",
  ],
  "nullish-coalescing": [
    ["Values", "Debugging"],
    "Try 0, false and an empty string as the input.",
    "The ?? operator preserves falsy values that are neither null nor undefined.",
  ],
  "debounce-vs-throttle": [
    ["Events", "Async"],
    "Change the timing values and compare how many calls reach each handler.",
    "Debounce waits for a pause; throttle limits how often work can run.",
  ],
  "deep-clone": [
    ["Objects", "Data", "Debugging"],
    "Change the nested score through the spread copy and check the original.",
    "structuredClone preserves the Date and Set. The JSON copy changes them, and the spread copy shares nested objects.",
  ],
  "this-keyword": [
    ["Functions", "Scope", "Debugging"],
    "Change how a function is called and compare its this value.",
    "The logs demonstrate how the call site and function kind affect this.",
  ],
  hoisting: [
    ["Scope", "Debugging"],
    "Move a declaration above its first use and rerun.",
    "The example compares declaration availability and initialization behavior.",
  ],
  "for-of-vs-for-in": [
    ["Arrays", "Objects", "Loops"],
    "Add an enumerable property to the array and compare the two loops.",
    "for...of reads iterable values; for...in enumerates string property keys.",
  ],
  memoization: [
    ["Functions", "Performance"],
    "Call the function again with the same input, then use a different input.",
    "A repeated input reuses its cached result.",
  ],
  "promise-all": [
    ["Promises", "Async"],
    "Change the delay of one operation and compare when the combined result arrives.",
    "The operations run concurrently and the result array retains input order.",
  ],
  "async-await": [
    ["Promises", "Async", "Errors"],
    "Change shouldFail and inspect which catch and finally blocks run.",
    "Both success and simulated failure are handled, and cleanup runs in either case.",
  ],
  "promise-race-allsettled": [
    ["Promises", "Async", "Errors"],
    "Change which promise settles first, or make one reject.",
    "race follows the first settlement; allSettled reports every outcome.",
  ],
  "event-loop": [
    ["Promises", "Async", "Debugging"],
    "Move a log into a Promise callback and predict its place in the output.",
    "Synchronous logs finish before microtasks, followed by scheduled timers.",
  ],
  "async-iterators": [
    ["Async", "Generators"],
    "Change the generated values or the delay between them.",
    "for await...of consumes values as the async iterator produces them.",
  ],
  generics: [
    ["Types", "Functions"],
    "Change a generic function's argument and inspect the inferred type.",
    "The functions preserve the relationship between their input and output types.",
  ],
  "type-guards": [
    ["Types", "Validation"],
    "Add a different input variant and see which guard accepts it.",
    "Runtime checks narrow values before variant-specific properties are used.",
  ],
  "utility-types": [
    ["Types", "Objects"],
    "Change the picked or omitted keys and inspect TypeScript's feedback.",
    "The examples derive object types with built-in TypeScript utility types.",
  ],
  "discriminated-unions": [
    ["Types", "Validation", "Errors"],
    "Add a variant or change its discriminator and inspect the branch handling.",
    "Checking the shared discriminator narrows each value to its matching variant.",
  ],
};

export interface Example extends Snippet {
  state: PlaygroundState;
  tags: string[];
  tryThis: string;
  expectedResult: string;
  environment: string;
  goal: Exclude<ExampleGoal, "all">;
  technology: Exclude<ExampleTechnology, "All">;
}

const examples: Example[] = getAllSnippets().map((snippet) => {
  const state: PlaygroundState = snippet.playground ?? {
    mode: "js",
    language: snippet.language,
    code: snippet.code,
  };
  const guide = guides[snippet.slug];
  const surface = playgroundSurface(state);
  return {
    ...snippet,
    state,
    technology:
      surface === "react"
        ? "React"
        : surface === "web"
          ? "Web"
          : surface === "typescript"
            ? "TypeScript"
            : "JavaScript",
    tags: snippet.tags ?? guide?.[0] ?? [],
    tryThis:
      snippet.tryThis ??
      guide?.[1] ??
      "Change one input and inspect the result.",
    expectedResult:
      snippet.expectedResult ??
      guide?.[2] ??
      "Inspect the console output next to the code.",
    environment:
      snippet.environment ??
      (surface === "typescript"
        ? "TypeScript · browser runtime"
        : "Browser JavaScript"),
    goal: snippet.goal ?? "explore",
  };
});

export function getAllExamples(): Example[] {
  return examples;
}
export function findExample(slug: string): Example | undefined {
  return examples.find((example) => example.slug === slug);
}
export function exampleLabel(example: Example): string {
  return playgroundLabel(example.state);
}

export function filterExamples(
  query = "",
  technology: ExampleTechnology = "All",
  goal: ExampleGoal = "all",
): Example[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return examples.filter((example) => {
    if (technology !== "All" && example.technology !== technology) return false;
    if (goal !== "all" && example.goal !== goal) return false;
    const text = [
      example.title,
      example.seoTitle,
      example.description,
      example.technology,
      example.environment,
      ...example.tags,
      ...(example.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

export function relatedExamples(current: Example): Example[] {
  const score = (other: Example) =>
    other.tags.filter((tag) => current.tags.includes(tag)).length * 3 +
    Number(other.goal === current.goal) * 2 +
    Number(other.technology === current.technology);
  return examples
    .filter((example) => example.slug !== current.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
}

export function exampleSources(
  example: Example,
): { label: string; code: string }[] {
  const state = example.state;
  if (state.mode === "web")
    return [
      { label: "HTML", code: state.html },
      { label: "CSS", code: state.css },
      { label: "JavaScript", code: state.webJs },
    ];
  if (state.mode === "react")
    return [
      { label: "JSX", code: state.code },
      { label: "CSS", code: state.css },
    ];
  return [{ label: exampleLabel(example), code: state.code }];
}
