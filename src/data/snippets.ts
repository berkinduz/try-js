import type { Language } from "../state/editor";

export interface Snippet {
  title: string;
  description: string;
  code: string;
  language: Language;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  faq?: { question: string; answer: string }[];
}

export interface SnippetCategory {
  name: string;
  snippets: Snippet[];
}

export function findSnippetBySlug(slug: string): { snippet: Snippet; category: SnippetCategory } | null {
  for (const category of SNIPPET_CATEGORIES) {
    const snippet = category.snippets.find(s => s.slug === slug);
    if (snippet) return { snippet, category };
  }
  return null;
}

export function getAllSnippets(): Snippet[] {
  return SNIPPET_CATEGORIES.flatMap(c => c.snippets);
}

export const SNIPPET_CATEGORIES: SnippetCategory[] = [
  {
    name: "JS Fundamentals",
    snippets: [
      {
        title: "Map, Filter, Reduce",
        description: "Transform, filter, and aggregate arrays",
        language: "javascript",
        slug: "map-filter-reduce",
        seoTitle: "JavaScript Map, Filter, Reduce — Array Methods Example",
        seoDescription: "Learn JavaScript map, filter, and reduce with runnable examples. Transform, filter, and aggregate arrays in this interactive JS playground.",
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);`,
      },
      {
        title: "Destructuring",
        description: "Object and array destructuring patterns",
        language: "javascript",
        slug: "destructuring",
        seoTitle: "JavaScript Destructuring — Object & Array Patterns",
        seoDescription: "Learn JavaScript object and array destructuring with runnable examples. Nested destructuring, defaults, and rest patterns in an interactive playground.",
        code: `// Object destructuring
const user = { name: "Alice", age: 30, city: "NYC" };
const { name, ...rest } = user;
console.log(name, rest);

// Array destructuring
const [first, second, ...others] = [1, 2, 3, 4, 5];
console.log(first, second, others);

// Nested + defaults
const { address: { street = "Unknown" } = {} } = { address: {} };
console.log(street);`,
      },
      {
        title: "Spread & Rest",
        description: "Spread operator and rest parameters",
        language: "javascript",
        slug: "spread-rest",
        seoTitle: "JavaScript Spread & Rest Operator — Examples & Tutorial",
        seoDescription: "Learn the JavaScript spread operator and rest parameters with runnable code. Merge objects, clone arrays, and use rest params in this interactive playground.",
        code: `// Merge objects
const defaults = { theme: "dark", lang: "en", fontSize: 14 };
const prefs = { theme: "light", fontSize: 16 };
const config = { ...defaults, ...prefs };
console.log(config);

// Clone + extend arrays
const base = [1, 2, 3];
const extended = [...base, 4, 5, ...base];
console.log(extended);

// Rest parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3, 4, 5));`,
      },
      {
        title: "Closures",
        description: "Functions that capture their scope",
        language: "javascript",
        slug: "closures",
        seoTitle: "JavaScript Closures Explained — Interactive Example",
        seoDescription: "Understand JavaScript closures with a runnable counter example. See how functions capture their surrounding scope in this interactive JS playground.",
        code: `function makeCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.value());     // 11`,
      },
      {
        title: "Map & Set",
        description: "Built-in collection types",
        language: "javascript",
        slug: "map-set",
        seoTitle: "JavaScript Map & Set — Collection Types Guide",
        seoDescription: "Learn JavaScript Map and Set with runnable examples. Key-value pairs, unique values, and set operations in this interactive JS playground.",
        code: `// Map: key-value pairs (any key type)
const map = new Map();
map.set("name", "Alice");
map.set(42, "the answer");
map.set(true, "yes");

for (const [key, value] of map) {
  console.log(\`\${key} => \${value}\`);
}

// Set: unique values
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(nums)];
console.log("Unique:", unique);

// Set operations
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);
const intersection = [...a].filter(x => b.has(x));
console.log("Intersection:", intersection);`,
      },
    ],
  },
  {
    name: "Async Patterns",
    snippets: [
      {
        title: "Promise.all",
        description: "Run async operations in parallel",
        language: "javascript",
        slug: "promise-all",
        seoTitle: "JavaScript Promise.all — Parallel Async Operations",
        seoDescription: "Learn JavaScript Promise.all with a runnable example. Run multiple async operations in parallel and collect results in this interactive JS playground.",
        code: `const delay = (ms, val) =>
  new Promise(resolve => setTimeout(() => resolve(val), ms));

(async () => {
  console.time("parallel");
  const results = await Promise.all([
    delay(100, "first"),
    delay(200, "second"),
    delay(50, "third"),
  ]);
  console.timeEnd("parallel");
  console.log(results);
})();`,
      },
      {
        title: "Async/Await Error Handling",
        description: "Try/catch with async functions",
        language: "javascript",
        slug: "async-await",
        seoTitle: "JavaScript Async/Await Error Handling — Try/Catch Example",
        seoDescription: "Learn async/await error handling in JavaScript with try/catch. Runnable examples showing success and error cases in this interactive JS playground.",
        code: `async function fetchData(shouldFail) {
  await new Promise(r => setTimeout(r, 100));
  if (shouldFail) throw new Error("Network error");
  return { data: [1, 2, 3] };
}

(async () => {
  // Success case
  try {
    const result = await fetchData(false);
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err.message);
  }

  // Error case
  try {
    const result = await fetchData(true);
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err.message);
  }
})();`,
      },
      {
        title: "Promise.race & allSettled",
        description: "Advanced Promise combinators",
        language: "javascript",
        slug: "promise-race-allsettled",
        seoTitle: "JavaScript Promise.race & allSettled — Combinator Examples",
        seoDescription: "Learn Promise.race and Promise.allSettled in JavaScript with runnable examples. Advanced promise combinators in this interactive JS playground.",
        code: `const delay = (ms, val) =>
  new Promise(r => setTimeout(() => r(val), ms));

const fail = (ms, msg) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

(async () => {
  // race: first to finish wins
  const fastest = await Promise.race([
    delay(200, "slow"),
    delay(50, "fast"),
    delay(100, "medium"),
  ]);
  console.log("Winner:", fastest);

  // allSettled: get all results, even failures
  const results = await Promise.allSettled([
    delay(50, "ok"),
    fail(100, "oops"),
    delay(75, "also ok"),
  ]);
  console.log(results);
})();`,
      },
      {
        title: "Event Loop Demo",
        description: "Understand microtasks vs macrotasks",
        language: "javascript",
        slug: "event-loop",
        seoTitle: "JavaScript Event Loop — Microtasks vs Macrotasks Demo",
        seoDescription: "Visualize the JavaScript event loop with a runnable demo. Understand microtasks vs macrotasks execution order in this interactive JS playground.",
        code: `console.log("1 - synchronous");

setTimeout(() => console.log("2 - setTimeout (macrotask)"), 0);

Promise.resolve().then(() => {
  console.log("3 - Promise.then (microtask)");
});

queueMicrotask(() => {
  console.log("4 - queueMicrotask (microtask)");
});

console.log("5 - synchronous");

// Order: 1, 5, 3, 4, 2
// Microtasks run before macrotasks!`,
      },
    ],
  },
  {
    name: "TypeScript Essentials",
    snippets: [
      {
        title: "Generics",
        description: "Type-safe generic functions and types",
        language: "typescript",
        slug: "generics",
        seoTitle: "TypeScript Generics — Type-Safe Functions & Constraints",
        seoDescription: "Learn TypeScript generics with runnable examples. Generic functions, type constraints, and type-safe patterns in this interactive TS playground.",
        code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log(first([1, 2, 3]));
console.log(first(["a", "b", "c"]));

// Generic with constraint
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("hello", "hi"));
console.log(longest([1, 2, 3], [4, 5]));`,
      },
      {
        title: "Type Guards",
        description: "Narrow types with custom guards",
        language: "typescript",
        slug: "type-guards",
        seoTitle: "TypeScript Type Guards — Narrow Types with Pattern Matching",
        seoDescription: "Learn TypeScript type guards and type narrowing with runnable examples. Switch-case pattern matching and custom guards in this interactive TS playground.",
        code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}

console.log(area({ kind: "circle", radius: 5 }).toFixed(2));
console.log(area({ kind: "rect", width: 4, height: 6 }));`,
      },
      {
        title: "Utility Types",
        description: "Built-in mapped and conditional types",
        language: "typescript",
        slug: "utility-types",
        seoTitle: "TypeScript Utility Types — Partial, Pick, Omit, Record",
        seoDescription: "Learn TypeScript utility types with runnable examples. Partial, Pick, Omit, Record, and more built-in mapped types in this interactive TS playground.",
        code: `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// Partial: all fields optional
type UpdateData = Partial<User>;

// Pick: select specific fields
type UserPreview = Pick<User, "id" | "name">;

// Omit: exclude specific fields
type PublicUser = Omit<User, "email">;

// Record: map keys to values
type RoleCount = Record<User["role"], number>;

const counts: RoleCount = { admin: 3, user: 42 };
console.log(counts);

const preview: UserPreview = { id: 1, name: "Alice" };
console.log(preview);`,
      },
      {
        title: "Discriminated Unions",
        description: "Exhaustive pattern matching",
        language: "typescript",
        slug: "discriminated-unions",
        seoTitle: "TypeScript Discriminated Unions — Pattern Matching Example",
        seoDescription: "Learn TypeScript discriminated unions and exhaustive pattern matching with runnable examples. Result types and type narrowing in this interactive TS playground.",
        code: `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

function display(result: Result<number>) {
  if (result.ok) {
    console.log("Result:", result.value);
  } else {
    console.error("Error:", result.error);
  }
}

display(divide(10, 3));
display(divide(10, 0));`,
      },
    ],
  },
];
