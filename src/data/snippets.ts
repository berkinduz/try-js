import type { Language } from "../state/editor";

export interface SnippetSection {
  heading: string;
  body: string;
}

export interface SnippetFaq {
  question: string;
  answer: string;
}

export interface Snippet {
  title: string;
  description: string;
  code: string;
  language: Language;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keywords?: string[];
  longDescription?: string;
  howItWorks?: SnippetSection[];
  commonMistakes?: string[];
  whenToUse?: string;
  faq?: SnippetFaq[];
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
        seoTitle: "JavaScript Map, Filter, Reduce — Array Methods Explained with Examples",
        seoDescription: "Learn JavaScript map, filter, and reduce with runnable examples. Transform, filter, and aggregate arrays with the three most common higher-order array methods.",
        keywords: ["javascript map", "javascript filter", "javascript reduce", "array methods", "higher order functions"],
        longDescription:
          "map, filter, and reduce are the three most used higher-order array methods in JavaScript. Together they replace the vast majority of for-loops you would otherwise write: map transforms each element, filter keeps only elements matching a predicate, and reduce folds the array into a single accumulated value. They return new arrays (except reduce) and do not mutate the original, which makes them safe to chain and reason about.",
        howItWorks: [
          {
            heading: "map(fn) — transform each element",
            body: "Calls fn(element, index, array) for every element and returns a new array of the same length containing the return values. Use it when the output length equals the input length.",
          },
          {
            heading: "filter(fn) — keep matching elements",
            body: "Calls fn(element, index, array) and keeps only elements where the function returns a truthy value. The new array can be shorter than the original (or empty).",
          },
          {
            heading: "reduce(fn, initial) — fold into a single value",
            body: "Calls fn(accumulator, element, index, array) for every element, threading the accumulator through. The second argument is the initial accumulator — always pass it explicitly to avoid surprises on empty arrays.",
          },
          {
            heading: "Chaining for readable pipelines",
            body: "Because map and filter return new arrays, you can chain them: items.filter(...).map(...).reduce(...). Each step is independent, which makes the pipeline easy to read top-to-bottom.",
          },
        ],
        commonMistakes: [
          "Forgetting that map always returns an array of the same length — use filter if you want to remove elements.",
          "Omitting the initial value of reduce, which causes bugs on empty arrays and makes the accumulator type ambiguous.",
          "Using forEach when you actually want a new array — forEach returns undefined, map returns the transformed array.",
          "Mutating the accumulator inside reduce instead of returning a new value — works but makes the intent unclear.",
        ],
        whenToUse:
          "Reach for map and filter whenever you're building a new array from an existing one. Use reduce for aggregations (sums, grouping, building an object from an array). For side effects only, use a for-of loop or forEach — not map.",
        faq: [
          {
            question: "What is the difference between map and forEach in JavaScript?",
            answer:
              "map returns a new array containing the transformed values; forEach always returns undefined and is only for side effects. If you need the result, use map. If you're just logging or triggering external actions, forEach (or for-of) is clearer.",
          },
          {
            question: "When should I use reduce instead of a for-loop?",
            answer:
              "Use reduce when you're folding an array into a single value — a sum, a grouped object, a minimum, a flattened array. Use a for-loop when the logic has early exits, side effects, or touches multiple arrays simultaneously.",
          },
          {
            question: "Are map, filter, and reduce slower than for-loops?",
            answer:
              "Slightly, yes — they call a function for each element and allocate new arrays. In practice the difference is negligible for anything under a few million items. Prefer readability; reach for a for-loop only after profiling shows a real bottleneck.",
          },
          {
            question: "Can I chain map, filter, and reduce?",
            answer:
              "Yes. Because map and filter return new arrays, you can write pipelines like items.filter(isActive).map(toDTO).reduce(sum). Each step allocates one intermediate array — fine for most workloads.",
          },
        ],
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// Chained pipeline
const sumOfDoubledEvens = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0);
console.log("Sum of doubled evens:", sumOfDoubledEvens);`,
      },
      {
        title: "Destructuring",
        description: "Object and array destructuring patterns",
        language: "javascript",
        slug: "destructuring",
        seoTitle: "JavaScript Destructuring — Object & Array Patterns with Examples",
        seoDescription: "Learn JavaScript object and array destructuring with runnable examples. Nested destructuring, defaults, rest patterns, and renaming — all explained.",
        keywords: ["javascript destructuring", "object destructuring", "array destructuring", "es6", "rest pattern"],
        longDescription:
          "Destructuring is a syntax that lets you pull values out of objects and arrays into standalone variables in a single statement. It replaces a pile of manual assignments with one line, supports default values, renaming, nested access, and rest patterns. Destructuring is the idiomatic way to unpack function arguments, React props, and API responses in modern JavaScript.",
        howItWorks: [
          {
            heading: "Object destructuring",
            body: "const { a, b } = obj pulls obj.a and obj.b into local variables. Use { a: x } to rename, { a = 1 } for defaults, and { a, ...rest } to collect remaining keys.",
          },
          {
            heading: "Array destructuring",
            body: "const [first, second] = arr binds by index. Use [, , third] to skip elements and [first, ...rest] to capture the tail.",
          },
          {
            heading: "Nested destructuring with defaults",
            body: "You can destructure nested objects and provide defaults at every level: const { a: { b = 1 } = {} } = obj. The inner default only applies when a is undefined — not null or 0.",
          },
          {
            heading: "Function parameter destructuring",
            body: "Destructure directly in the parameter list: function greet({ name, age = 18 }) { ... }. This is how React components receive props and how most modern APIs are consumed.",
          },
        ],
        commonMistakes: [
          "Forgetting that defaults only fire on undefined — null, 0, and empty string all bypass the default.",
          "Trying to destructure a null/undefined value without a fallback default, causing a TypeError.",
          "Using array destructuring on an object (or vice versa) — they are not interchangeable.",
          "Renaming with the wrong syntax: { a as b } is invalid; the correct form is { a: b }.",
        ],
        whenToUse:
          "Use destructuring whenever you'd otherwise write three or more manual property assignments, or whenever a function takes more than one or two arguments — named-parameter-style destructuring is much clearer than positional arguments.",
        faq: [
          {
            question: "What is destructuring in JavaScript?",
            answer:
              "Destructuring is syntax that unpacks values from objects or arrays into variables in one statement. Instead of const name = user.name; const age = user.age; you write const { name, age } = user;",
          },
          {
            question: "How do I set default values when destructuring?",
            answer:
              "Use = inside the destructuring pattern: const { name = 'Guest' } = user. The default only applies if the property is undefined — null will not trigger it.",
          },
          {
            question: "Can I destructure nested objects?",
            answer:
              "Yes: const { address: { city } } = user extracts user.address.city. Be careful: if address is undefined this throws. Guard with = {}: const { address: { city } = {} } = user.",
          },
          {
            question: "How do I rename a variable while destructuring?",
            answer:
              "Use a colon: const { name: userName } = user. This reads 'take the name property and store it as userName in local scope'.",
          },
        ],
        code: `// Object destructuring with rename, defaults, and rest
const user = { name: "Alice", age: 30, city: "NYC" };
const { name: userName, age, country = "USA", ...rest } = user;
console.log(userName, age, country, rest);

// Array destructuring with skip and rest
const [first, , third, ...others] = [1, 2, 3, 4, 5, 6];
console.log(first, third, others);

// Nested destructuring with safe default
const response = { data: { user: { id: 42 } } };
const { data: { user: { id, role = "guest" } = {} } = {} } = response;
console.log(id, role);

// Function parameter destructuring
function formatUser({ name, age = 0, admin = false }) {
  return \`\${name} (\${age}) \${admin ? "[admin]" : ""}\`;
}
console.log(formatUser({ name: "Bob", admin: true }));`,
      },
      {
        title: "Spread & Rest",
        description: "Spread operator and rest parameters",
        language: "javascript",
        slug: "spread-rest",
        seoTitle: "JavaScript Spread & Rest Operator — Examples and Differences",
        seoDescription: "Learn the JavaScript spread operator (...) and rest parameters with runnable code. Merge objects, clone arrays, collect function arguments, and more.",
        keywords: ["javascript spread", "javascript rest", "spread operator", "rest parameters", "...", "es6"],
        longDescription:
          "The three-dot syntax (...) does two different jobs depending on where it appears. As the spread operator, it expands an iterable (array, string, set) or an object's own enumerable properties into another array or object literal. As rest parameters, it collects the remaining function arguments into an array. Same tokens, opposite directions: spread unpacks, rest packs.",
        howItWorks: [
          {
            heading: "Spread in array and object literals",
            body: "[...arr] creates a shallow copy of an array. { ...obj } creates a shallow copy of an object's own enumerable properties. Later entries override earlier ones, which is why defaults-then-overrides patterns work.",
          },
          {
            heading: "Spread in function calls",
            body: "fn(...args) expands an array into individual arguments, replacing the old fn.apply(null, args). Math.max(...numbers) is the canonical example.",
          },
          {
            heading: "Rest parameters",
            body: "function f(first, ...rest) collects all arguments after first into an array named rest. Unlike the old arguments object, rest is a real array and only captures what comes after named parameters.",
          },
          {
            heading: "Shallow, not deep",
            body: "Spread copies one level deep. Nested objects and arrays are still shared between the original and the copy. For a true deep clone use structuredClone() or a library.",
          },
        ],
        commonMistakes: [
          "Thinking spread does a deep clone — it doesn't. Nested objects remain shared.",
          "Using spread on non-iterable values in array context (e.g. [...null] throws).",
          "Forgetting that the order of spreads in an object literal matters — { ...a, ...b } lets b override a.",
          "Mixing up spread (in literals and calls) with rest (in function parameters) — same symbol, opposite direction.",
        ],
        whenToUse:
          "Use spread to clone or merge arrays and objects without mutation, to pass an array as separate arguments, and to build immutable updates (Redux-style). Use rest to write variadic functions that take any number of arguments.",
        faq: [
          {
            question: "What is the difference between spread and rest in JavaScript?",
            answer:
              "They use the same ... syntax but do opposite things. Spread expands an iterable into individual elements ([...arr]). Rest collects remaining elements into an array (function f(...args)). The distinction is where they appear — a literal/call site vs a parameter list.",
          },
          {
            question: "Does spread do a deep copy?",
            answer:
              "No. Spread is always shallow: top-level elements are copied, but nested objects and arrays are shared references. For a deep clone use structuredClone(obj) (built-in) or a library like lodash's cloneDeep.",
          },
          {
            question: "Can I spread an object into an array?",
            answer:
              "No. Object spread only works inside object literals, and array spread requires an iterable. [...{ a: 1 }] throws because a plain object is not iterable. Convert first: [...Object.entries({ a: 1 })].",
          },
          {
            question: "How does spread merge objects with conflicting keys?",
            answer:
              "Later sources win. In { ...defaults, ...overrides } any key present in overrides replaces the one from defaults. This makes spread perfect for the 'defaults + user prefs' pattern.",
          },
        ],
        code: `// Merge objects — later keys win
const defaults = { theme: "dark", lang: "en", fontSize: 14 };
const prefs = { theme: "light", fontSize: 16 };
const config = { ...defaults, ...prefs };
console.log(config);

// Clone + extend arrays (shallow)
const base = [1, 2, 3];
const extended = [...base, 4, 5, ...base];
console.log(extended);

// Spread in function call
const nums = [5, 2, 8, 1, 9];
console.log("Max:", Math.max(...nums));

// Rest parameters
function sum(first, ...others) {
  return others.reduce((acc, n) => acc + n, first);
}
console.log(sum(1, 2, 3, 4, 5));`,
      },
      {
        title: "Closures",
        description: "Functions that capture their scope",
        language: "javascript",
        slug: "closures",
        seoTitle: "JavaScript Closures Explained — Interactive Examples",
        seoDescription: "Understand JavaScript closures with runnable counter examples. See how inner functions capture and remember their surrounding scope, and when closures cause bugs.",
        keywords: ["javascript closures", "closure", "lexical scope", "encapsulation", "data privacy"],
        longDescription:
          "A closure is a function together with the lexical environment it was created in. In plain English: an inner function keeps access to the variables of the outer function even after the outer function has returned. Closures are how JavaScript implements private state, module patterns, function factories, partial application, and almost every callback-based API you've ever used.",
        howItWorks: [
          {
            heading: "Lexical scoping is the foundation",
            body: "In JavaScript, a function looks up variables by where it was written, not where it's called. An inner function can always read (and write) variables declared in any enclosing function.",
          },
          {
            heading: "The outer function can return — the scope lives on",
            body: "When the outer function finishes, its local variables would normally be garbage-collected. But if an inner function still references them, the engine keeps that scope alive. The inner function 'closes over' those variables — hence the name.",
          },
          {
            heading: "Each call creates a fresh closure",
            body: "Calling makeCounter() twice returns two independent counters with two independent count variables. They don't share state — each call produces a new lexical environment.",
          },
          {
            heading: "Closures are how private state is achieved",
            body: "Variables inside the outer function are inaccessible from outside. The only way to read or mutate them is through the methods you return. This is the module pattern, and the basis of data hiding in pre-class JavaScript.",
          },
        ],
        commonMistakes: [
          "Creating closures in a loop with var — all callbacks share the same variable and see the final value (the classic 'all log 5' bug). Use let or const inside the loop.",
          "Accidentally creating memory leaks by closing over large objects that are never released.",
          "Confusing closures with 'this' — 'this' is dynamic and resolved at call time, closures capture lexical variables.",
          "Expecting the inner function to see a fresh copy — closures capture references, not snapshots. If the outer variable changes, the inner function sees the new value.",
        ],
        whenToUse:
          "Closures are unavoidable in JavaScript — every callback is one. Use them deliberately for private state, function factories (e.g. makeAdder(5)), memoization caches, and encapsulating module-level state without a class.",
        faq: [
          {
            question: "What is a closure in JavaScript?",
            answer:
              "A closure is an inner function that retains access to the variables of its outer (enclosing) function, even after the outer function has returned. It's created automatically every time you define a function inside another function.",
          },
          {
            question: "Why do closures matter?",
            answer:
              "They enable private state, callbacks with captured context, function factories, memoization, and the module pattern. In practice, every event handler and async callback you write is a closure over the surrounding scope.",
          },
          {
            question: "Do closures cause memory leaks?",
            answer:
              "They can if you're not careful. A closure keeps its captured variables alive as long as the closure itself is referenced. If you store closures in long-lived structures that close over large objects, those objects won't be garbage-collected.",
          },
          {
            question: "What is the 'classic closure loop bug'?",
            answer:
              "Using var in a for-loop creates a single variable shared by every iteration's callbacks — so all callbacks see the final value. The fix is to use let (which creates a new binding per iteration) or to wrap the callback in an IIFE.",
          },
        ],
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
console.log(counter.value());     // 11

// Independent closures
const a = makeCounter();
const b = makeCounter(100);
a.increment(); a.increment();
b.increment();
console.log(a.value(), b.value()); // 2 101

// Function factory via closure
function makeAdder(x) {
  return y => x + y;
}
const add5 = makeAdder(5);
console.log(add5(3)); // 8`,
      },
      {
        title: "Map & Set",
        description: "Built-in collection types",
        language: "javascript",
        slug: "map-set",
        seoTitle: "JavaScript Map & Set — When to Use Them Instead of Object and Array",
        seoDescription: "Learn JavaScript Map and Set with runnable examples. Key-value pairs with any key type, guaranteed unique values, and set operations like intersection and union.",
        keywords: ["javascript map", "javascript set", "map vs object", "set operations", "unique values"],
        longDescription:
          "Map and Set are collection types added in ES2015 that fix long-standing gaps in plain objects and arrays. Map is a key-value store that accepts any value as a key (not just strings), preserves insertion order, and exposes size directly. Set stores unique values and gives you deduplication and fast has()-checks for free. Both are iterable and both have small but crucial performance characteristics that objects and arrays don't.",
        howItWorks: [
          {
            heading: "Map: any-key key-value store",
            body: "new Map() creates an empty map. set(key, value) stores, get(key) retrieves, has(key) checks, delete(key) removes, size returns the entry count. Keys can be objects, functions, booleans, or NaN — anything.",
          },
          {
            heading: "Set: unique values",
            body: "new Set(iterable) creates a set from any iterable and drops duplicates. add(value) inserts, has(value) checks in O(1), delete(value) removes. Iteration order is insertion order.",
          },
          {
            heading: "Map preserves insertion order, Object doesn't guarantee it",
            body: "Objects technically maintain insertion order for string keys in modern engines, but integer-like keys are sorted numerically. Map always iterates in strict insertion order, no exceptions.",
          },
          {
            heading: "Set operations via spread",
            body: "Intersection, union, and difference aren't built in but are one-liners with spread: [...a].filter(x => b.has(x)) is intersection, new Set([...a, ...b]) is union.",
          },
        ],
        commonMistakes: [
          "Using an object as a map when keys aren't strings — you'll silently convert everything to strings via toString().",
          "Forgetting that Map has .size and Object doesn't — you need Object.keys(obj).length for plain objects.",
          "Using Set with objects and expecting value-equality — Set compares by reference, so two equal objects are still distinct.",
          "JSON.stringify ignores Map and Set — they serialize to {} and {}. Convert to array first if you need to serialize.",
        ],
        whenToUse:
          "Use Map whenever your keys aren't strings, when you need size or insertion order, or when you're frequently adding and removing keys (Map is faster than Object for that workload). Use Set whenever you need deduplication or fast membership checks on a collection of values.",
        faq: [
          {
            question: "What is the difference between Map and Object in JavaScript?",
            answer:
              "Map accepts any value as a key (not just strings), preserves insertion order, and exposes .size directly. Object keys are always coerced to strings (or symbols), and there's no .size property. Map is also faster for frequent additions and deletions.",
          },
          {
            question: "When should I use Set instead of an array?",
            answer:
              "Use Set when you need uniqueness or fast has() lookups. Checking membership with array.includes is O(n); Set.has is O(1). Deduplicating an array is a one-liner: [...new Set(arr)].",
          },
          {
            question: "Can I JSON.stringify a Map or Set?",
            answer:
              "Not directly — both serialize to {} or {}. Convert them first: JSON.stringify([...map]) for Map, JSON.stringify([...set]) for Set.",
          },
          {
            question: "How do I do set intersection or union in JavaScript?",
            answer:
              "Intersection: [...a].filter(x => b.has(x)). Union: new Set([...a, ...b]). Difference: [...a].filter(x => !b.has(x)). Modern browsers are adding Set.prototype.intersection/union/difference — check support before using.",
          },
        ],
        code: `// Map: key-value pairs (any key type)
const map = new Map();
map.set("name", "Alice");
map.set(42, "the answer");
map.set(true, "yes");

for (const [key, value] of map) {
  console.log(\`\${key} => \${value}\`);
}
console.log("size:", map.size);

// Set: unique values
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(nums)];
console.log("Unique:", unique);

// Set operations
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);
const intersection = [...a].filter(x => b.has(x));
const union = new Set([...a, ...b]);
console.log("Intersection:", intersection);
console.log("Union:", [...union]);`,
      },
      {
        title: "Optional Chaining",
        description: "Safely access nested properties with ?.",
        language: "javascript",
        slug: "optional-chaining",
        seoTitle: "JavaScript Optional Chaining (?.) Explained with Examples",
        seoDescription: "Learn JavaScript optional chaining (?.) with runnable examples. Safely access nested properties, call optional methods, and index arrays without TypeErrors.",
        keywords: ["optional chaining", "?.", "javascript", "safe navigation", "nullish"],
        longDescription:
          "Optional chaining (?.) is an ES2020 operator that short-circuits property access, method calls, and array indexing when the left-hand side is null or undefined. Instead of throwing a TypeError, the whole expression evaluates to undefined. It replaces the long chains of && guards you used to write for safe navigation through API responses and optional objects.",
        howItWorks: [
          {
            heading: "Property access: obj?.prop",
            body: "If obj is null or undefined, the expression short-circuits to undefined. Otherwise it proceeds as normal. Only null and undefined trigger the short-circuit — 0, '', and false do not.",
          },
          {
            heading: "Method calls: obj?.method()",
            body: "The method call only happens if obj is not null/undefined. This is useful for optional callbacks: onClick?.(event) fires only if onClick was provided.",
          },
          {
            heading: "Dynamic keys and arrays: obj?.[key], arr?.[0]",
            body: "Optional chaining also works with computed access and array indexing. users?.[0]?.name walks through null-safe at every step.",
          },
          {
            heading: "Combines with nullish coalescing",
            body: "user?.name ?? 'Anonymous' is the canonical pattern: safely navigate, then fall back when the result is null or undefined.",
          },
        ],
        commonMistakes: [
          "Overusing optional chaining everywhere — it hides bugs where a value really should exist. Use it only where undefined is a valid state.",
          "Expecting it to short-circuit on 0 or '' — it only reacts to null and undefined.",
          "Using it on the left side of an assignment — obj?.prop = x is a syntax error.",
          "Forgetting that function?.() still throws if the property exists but isn't a function.",
        ],
        whenToUse:
          "Use optional chaining when navigating data whose shape is genuinely optional — API responses with nullable fields, optional callback props, DOM query results. Don't use it as a blanket null-safety layer; that hides real bugs.",
        faq: [
          {
            question: "What is optional chaining in JavaScript?",
            answer:
              "Optional chaining (?.) is an operator that short-circuits property access and method calls when the left-hand side is null or undefined, returning undefined instead of throwing. It was added in ES2020 and is supported in every modern browser and Node 14+.",
          },
          {
            question: "Does optional chaining work on function calls?",
            answer:
              "Yes. obj.method?.() calls method only if it's not null/undefined. Useful for optional callbacks: props.onClick?.(event).",
          },
          {
            question: "What is the difference between ?. and && for safe access?",
            answer:
              "Both guard against null/undefined, but && also short-circuits on any falsy value (0, '', false). Optional chaining only short-circuits on null and undefined, which is usually what you actually want.",
          },
          {
            question: "Can I use optional chaining with nullish coalescing?",
            answer:
              "Yes, and it's the most common pattern: user?.profile?.name ?? 'Guest'. Optional chaining navigates safely, then ?? supplies a default when the result is null or undefined.",
          },
        ],
        code: `const user = {
  name: "Alice",
  address: {
    city: "NYC",
  },
  logs: [{ ts: 1700000000, msg: "hello" }],
};

// Before: long && chain
const oldCity = user && user.address && user.address.city;

// With optional chaining
console.log(user?.address?.city);         // "NYC"
console.log(user?.company?.name);         // undefined (no throw)
console.log(user?.logs?.[0]?.msg);        // "hello"
console.log(user?.logs?.[99]?.msg);       // undefined

// Optional method call
const maybeCallback = undefined;
maybeCallback?.("ignored"); // safe, no-op

// Pair with nullish coalescing for defaults
const displayName = user?.profile?.name ?? "Anonymous";
console.log(displayName);`,
      },
      {
        title: "Nullish Coalescing",
        description: "Default values with ?? — safer than ||",
        language: "javascript",
        slug: "nullish-coalescing",
        seoTitle: "JavaScript Nullish Coalescing (??) vs Logical OR (||) — Explained",
        seoDescription: "Learn the JavaScript nullish coalescing operator (??) and why it's safer than || for default values. Runnable examples covering all the edge cases.",
        keywords: ["nullish coalescing", "??", "default values", "javascript", "logical or"],
        longDescription:
          "The nullish coalescing operator (??) is an ES2020 operator that returns its right-hand side only when the left-hand side is null or undefined. It's designed to replace || for default values, because || treats every falsy value (0, '', false) as 'missing' — which is almost never what you want when 0 or empty string are valid inputs.",
        howItWorks: [
          {
            heading: "Nullish means only null and undefined",
            body: "a ?? b returns a unless a is null or undefined, in which case it returns b. That's it — 0, '', false, and NaN all pass through unchanged.",
          },
          {
            heading: "Compare with logical OR (||)",
            body: "a || b returns b whenever a is any falsy value. This causes bugs when 0 or '' are legitimate values (e.g. count ?? 10 returns 0 correctly; count || 10 incorrectly returns 10).",
          },
          {
            heading: "Nullish assignment (??=)",
            body: "obj.x ??= default assigns default to obj.x only if obj.x is null or undefined. It's the assignment sibling of ??, parallel to ||= and &&=.",
          },
          {
            heading: "Cannot mix with && or || without parens",
            body: "JavaScript forbids a ?? b || c without explicit parentheses to avoid precedence confusion. Write (a ?? b) || c or a ?? (b || c) to make the intent clear.",
          },
        ],
        commonMistakes: [
          "Using || for default values and losing 0, '', or false.",
          "Mixing ?? with && or || in the same expression without parentheses — syntax error.",
          "Assuming ?? checks for any 'empty' value — it only checks null and undefined.",
          "Forgetting that ??= still evaluates the right-hand side only when the left is nullish.",
        ],
        whenToUse:
          "Use ?? whenever you want to supply a default only when a value is genuinely absent (null or undefined), especially for numeric and string inputs where 0 and '' are valid. Use || only when any falsy value should trigger the fallback, like text form inputs where empty string means 'user entered nothing'.",
        faq: [
          {
            question: "What is the difference between ?? and || in JavaScript?",
            answer:
              "|| returns the right-hand side for any falsy value (0, '', false, null, undefined, NaN). ?? returns it only for null and undefined. Use ?? when you want 0 or '' to be valid values rather than triggering the fallback.",
          },
          {
            question: "When should I use nullish coalescing?",
            answer:
              "Whenever the left side is a nullable value and the fallback should only apply to null/undefined — counts, optional props, API response fields. If falsy-ish 'missing' semantics are what you want (like trimming a text input), stick with ||.",
          },
          {
            question: "Can I combine ?? with && or ||?",
            answer:
              "Only with explicit parentheses. a ?? b || c is a syntax error — write (a ?? b) || c or a ?? (b || c). This rule exists so developers can't accidentally rely on confusing precedence.",
          },
          {
            question: "What is the ??= operator?",
            answer:
              "Logical nullish assignment. obj.x ??= default assigns default to obj.x only if obj.x is currently null or undefined. Shorthand for obj.x = obj.x ?? default.",
          },
        ],
        code: `// || treats all falsy values as missing — buggy for 0
const count = 0;
console.log(count || 10);  // 10  (wrong — 0 is a valid count)
console.log(count ?? 10);  // 0   (correct)

// Same for empty string
const name = "";
console.log(name || "Guest");  // "Guest"
console.log(name ?? "Guest");  // ""

// Real use case: config merging
function greet(options = {}) {
  const retries = options.retries ?? 3;    // keeps 0
  const prefix = options.prefix ?? "[app]"; // keeps ""
  return \`\${prefix} retries=\${retries}\`;
}
console.log(greet({ retries: 0, prefix: "" }));

// Nullish assignment
const config = { debug: false };
config.debug ??= true;   // stays false
config.timeout ??= 5000; // becomes 5000
console.log(config);`,
      },
      {
        title: "Debounce vs Throttle",
        description: "Rate-limiting functions — two common strategies",
        language: "javascript",
        slug: "debounce-vs-throttle",
        seoTitle: "JavaScript Debounce vs Throttle — Runnable Examples & When to Use",
        seoDescription: "Learn the difference between debounce and throttle in JavaScript with runnable examples. When to use each, and how to implement both from scratch.",
        keywords: ["debounce", "throttle", "javascript", "rate limiting", "performance"],
        longDescription:
          "Debounce and throttle are two ways to control how often a function runs when events fire rapidly — keystrokes, scroll, resize, mousemove. Debounce waits until events stop: the function runs once after a quiet period. Throttle caps the rate: the function runs at most once every N milliseconds, regardless of how many events fire. Choosing the right one depends on whether you care about the final state (debounce) or sampled updates along the way (throttle).",
        howItWorks: [
          {
            heading: "Debounce: run after events stop",
            body: "Every call resets a timer. The function only fires when the timer elapses without being reset. Result: one call after the user stops typing, scrolling, or resizing.",
          },
          {
            heading: "Throttle: cap to one call per interval",
            body: "The function runs immediately, then ignores subsequent calls until the interval has passed. Result: regular samples at a fixed rate, regardless of event frequency.",
          },
          {
            heading: "Leading vs trailing edges",
            body: "Both patterns can be configured to fire at the start of a burst (leading), the end (trailing), or both. Most libraries default debounce to trailing and throttle to leading+trailing.",
          },
          {
            heading: "Cleanup matters",
            body: "Both implementations schedule timers. If a component unmounts or the listener is removed, cancel any pending timer to avoid calling a stale function with stale state.",
          },
        ],
        commonMistakes: [
          "Reaching for debounce when you need sampled updates (like a progress indicator during scroll) — throttle is the correct tool.",
          "Forgetting to cancel pending timers on teardown, causing stale calls after unmount.",
          "Recreating the debounced function on every render — it has to be the same reference across calls to share its timer.",
          "Setting the delay too short (under 100ms) — you get no benefit and still pay the scheduling cost.",
        ],
        whenToUse:
          "Use debounce for 'final state' operations: autocomplete search, form validation after typing stops, saving drafts. Use throttle for 'live feedback' operations: scroll position reporting, mousemove handlers, resize layout updates.",
        faq: [
          {
            question: "What is the difference between debounce and throttle?",
            answer:
              "Debounce fires once after events stop for a set duration. Throttle fires at most once per interval, regardless of how many events arrive. Debounce cares about the final event; throttle cares about sampling at a fixed rate.",
          },
          {
            question: "When should I use debounce?",
            answer:
              "Use debounce when you only care about the final value after a burst — search-as-you-type (wait until typing stops before hitting the API), resize handlers that recompute layout once the window settles, autosave drafts after idle.",
          },
          {
            question: "When should I use throttle?",
            answer:
              "Use throttle when you need regular sampled updates during a burst — scroll-position indicators, drag handlers, mousemove tracking, rate-limited API calls where you must send at most N requests per second.",
          },
          {
            question: "Do I need a library like lodash for debounce and throttle?",
            answer:
              "No — both can be written in ~10 lines, as shown in the runnable example. Libraries add options (leading/trailing edges, maxWait, cancel methods) that are nice but not essential for simple cases.",
          },
        ],
        code: `function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

const log = label => value => console.log(label, value);
const debounced = debounce(log("debounced:"), 300);
const throttled = throttle(log("throttled:"), 300);

// Simulate rapid events
[0, 50, 100, 150, 200, 500, 900].forEach((ms, i) => {
  setTimeout(() => {
    debounced(i);
    throttled(i);
  }, ms);
});`,
      },
      {
        title: "Deep Clone",
        description: "structuredClone vs JSON vs manual",
        language: "javascript",
        slug: "deep-clone",
        seoTitle: "JavaScript Deep Clone Object — structuredClone, JSON, and Alternatives",
        seoDescription: "Learn how to deep clone objects in JavaScript with structuredClone, JSON.parse/stringify, and manual recursion. Trade-offs and when to use each.",
        keywords: ["deep clone", "deep copy", "structuredClone", "javascript", "clone object"],
        longDescription:
          "Deep cloning means creating a copy of an object where nested objects and arrays are also new, independent instances — not shared references. JavaScript has three common approaches: the built-in structuredClone() (modern, handles most cases), JSON.parse(JSON.stringify(obj)) (quick but lossy), and manual recursion (full control, tedious). Picking the right one depends on what your data contains.",
        howItWorks: [
          {
            heading: "structuredClone() — the modern default",
            body: "Built into Node 17+ and all modern browsers. Handles cyclic references, Maps, Sets, Dates, RegExps, typed arrays, and more. Does not copy functions, DOM nodes, or prototypes.",
          },
          {
            heading: "JSON.parse(JSON.stringify(obj)) — quick and dirty",
            body: "One-liner that works for plain JSON-compatible data. Loses functions, undefined, Dates (become strings), Maps/Sets, Symbols, BigInt, and cyclic references (throws).",
          },
          {
            heading: "Spread or Object.assign — shallow only",
            body: "{ ...obj } and Object.assign({}, obj) copy one level deep. Nested objects are still shared. Fine when you know the shape is flat.",
          },
          {
            heading: "Manual recursion or libraries",
            body: "When you need to preserve classes, prototypes, or apply custom logic, a library like lodash.cloneDeep — or hand-written recursion — is the only option.",
          },
        ],
        commonMistakes: [
          "Reaching for JSON.stringify when the data contains Dates, Maps, Sets, or undefined — you'll silently lose data.",
          "Using spread for 'deep clone' — it's shallow, nested references are shared.",
          "Trying to structuredClone a DOM node or a class instance — it won't preserve the prototype.",
          "Ignoring cyclic references — JSON throws, structuredClone handles them, spread doesn't go deep enough to care.",
        ],
        whenToUse:
          "Reach for structuredClone first — it handles almost everything and has no dependencies. Fall back to JSON only for strictly-JSON data when you need the ~2x speedup. Use a library or hand-rolled recursion only when you need to preserve class instances or apply custom transformations.",
        faq: [
          {
            question: "What is the best way to deep clone an object in JavaScript?",
            answer:
              "In modern environments (Node 17+, all evergreen browsers), use structuredClone(obj). It handles nested objects, arrays, Maps, Sets, Dates, RegExps, and cyclic references with zero dependencies.",
          },
          {
            question: "Why does JSON.parse(JSON.stringify(obj)) fail for some objects?",
            answer:
              "JSON only supports plain objects, arrays, strings, numbers, booleans, and null. It drops functions, undefined, and Symbols, converts Dates to strings, and throws on cyclic references. Use structuredClone or a library for anything richer.",
          },
          {
            question: "Is spread ({ ...obj }) a deep clone?",
            answer:
              "No. Spread is always shallow: top-level keys get new references, but nested objects and arrays are still shared with the original. Modifying nested data will leak back to the source.",
          },
          {
            question: "Does structuredClone copy class instances?",
            answer:
              "No — it creates plain objects. The prototype chain is lost, so the result is not instanceof your class. If you need that, use a library that handles prototypes or write a custom clone method.",
          },
        ],
        code: `const original = {
  name: "Alice",
  joined: new Date("2024-01-15"),
  tags: new Set(["admin", "beta"]),
  meta: { score: 99, nested: { deep: true } },
};

// 1. structuredClone — preserves Date, Set, deep nesting
const clone1 = structuredClone(original);
clone1.meta.nested.deep = false;
console.log("original still true?", original.meta.nested.deep);
console.log("date preserved?", clone1.joined instanceof Date);
console.log("set preserved?", clone1.tags instanceof Set);

// 2. JSON clone — loses Set and converts Date
const clone2 = JSON.parse(JSON.stringify(original));
console.log("JSON clone date type:", typeof clone2.joined); // string
console.log("JSON clone tags:", clone2.tags); // {} (Set becomes empty object)

// 3. Spread is shallow
const clone3 = { ...original };
clone3.meta.score = 0;
console.log("spread is shallow — original score:", original.meta.score);`,
      },
      {
        title: "The 'this' Keyword",
        description: "How 'this' is determined at call time",
        language: "javascript",
        slug: "this-keyword",
        seoTitle: "JavaScript 'this' Keyword Explained with Examples",
        seoDescription: "Understand how JavaScript's 'this' keyword works with runnable examples. Method calls, standalone functions, arrow functions, bind/call/apply, and event handlers.",
        keywords: ["this keyword", "javascript", "bind", "call", "apply", "context"],
        longDescription:
          "The value of 'this' in JavaScript is determined by how a function is called, not where it's defined. There are four call patterns, each producing a different 'this': method call (this = the object), standalone call (this = undefined in strict mode, globalThis otherwise), new call (this = the new instance), and explicit call via bind/call/apply (this = the value you supplied). Arrow functions are the exception — they capture 'this' lexically from their enclosing scope and cannot be rebound.",
        howItWorks: [
          {
            heading: "Method call: obj.fn() — this is obj",
            body: "When you call a function as a property of an object, 'this' inside the function refers to that object. Detaching the method (const f = obj.fn; f()) loses this binding.",
          },
          {
            heading: "Standalone call: fn() — this is undefined (strict) or globalThis",
            body: "A bare function call has no owning object. In strict mode (and modules) 'this' is undefined. In sloppy mode it defaults to globalThis (window in browsers).",
          },
          {
            heading: "bind/call/apply — explicit this",
            body: "fn.call(ctx, ...args) and fn.apply(ctx, argsArray) call the function immediately with 'this' set to ctx. fn.bind(ctx) returns a new function permanently bound to ctx.",
          },
          {
            heading: "Arrow functions capture 'this' lexically",
            body: "Arrow functions ignore the call-time rules entirely. They use the 'this' of the scope where they were defined. This makes them perfect for callbacks inside methods — no more const self = this.",
          },
        ],
        commonMistakes: [
          "Passing a method as a callback and losing 'this': setTimeout(obj.fn, 0) — 'this' becomes undefined.",
          "Defining a class method as an arrow in a plain object literal, expecting lexical 'this' — it captures whatever 'this' was during object creation (often global).",
          "Using 'this' inside a plain function and expecting the module or file — in strict mode it's undefined.",
          "Binding a method in render() in React, creating a new function every render and breaking memoization.",
        ],
        whenToUse:
          "Use arrow functions for callbacks inside methods so you don't have to worry about 'this'. Use regular functions (or class methods) when you need 'this' to refer to the calling object. Use bind when you must pass a method as a callback and need 'this' preserved.",
        faq: [
          {
            question: "What is 'this' in JavaScript?",
            answer:
              "'this' is an implicit parameter that every non-arrow function receives. Its value depends on how the function is called: as a method (this = the object), standalone (undefined/global), with new (the new instance), or via bind/call/apply (the value you supply).",
          },
          {
            question: "Why do arrow functions not have their own 'this'?",
            answer:
              "By design. Arrow functions capture 'this' from the enclosing lexical scope, so they can be used as callbacks inside methods without the classic 'this is undefined' bug. This makes them unsuitable for object methods where you need 'this' to refer to the object.",
          },
          {
            question: "What is the difference between call, apply, and bind?",
            answer:
              "call and apply invoke the function immediately with an explicit 'this'. The only difference: call takes individual arguments, apply takes an array. bind returns a new function with 'this' permanently set — it doesn't invoke anything.",
          },
          {
            question: "Why is 'this' undefined in my function?",
            answer:
              "Most likely you called the function standalone (not as a method) in strict mode or inside a module. Strict mode refuses to default 'this' to globalThis. Either call it as a method, bind it explicitly, or use an arrow function to capture 'this' from the outer scope.",
          },
        ],
        code: `"use strict";

const user = {
  name: "Alice",
  greet() {
    return \`Hi, I'm \${this.name}\`;
  },
};

// Method call — this = user
console.log(user.greet());

// Detached — this = undefined (strict)
const greet = user.greet;
try {
  console.log(greet());
} catch (e) {
  console.log("detached:", e.message);
}

// Rebind with bind
const bound = user.greet.bind(user);
console.log(bound());

// Arrow functions capture lexically
const other = {
  name: "Bob",
  delayedGreet() {
    setTimeout(() => {
      console.log(\`lexical this: \${this.name}\`);
    }, 0);
  },
};
other.delayedGreet();

// call and apply
function introduce(prefix, suffix) {
  return \`\${prefix} \${this.name}\${suffix}\`;
}
console.log(introduce.call(user, "Hello,", "!"));
console.log(introduce.apply(user, ["Hola,", "."]));`,
      },
      {
        title: "Hoisting",
        description: "var, let, const, and function declarations",
        language: "javascript",
        slug: "hoisting",
        seoTitle: "JavaScript Hoisting Explained — var, let, const, and Functions",
        seoDescription: "Understand JavaScript hoisting with runnable examples. How var, let, const, and function declarations are hoisted and what the temporal dead zone means.",
        keywords: ["hoisting", "javascript", "var let const", "temporal dead zone", "function declaration"],
        longDescription:
          "Hoisting is the JavaScript engine's practice of allocating declarations before executing code in a scope. Function declarations are fully hoisted — you can call them before their line of source. var declarations are hoisted but initialized to undefined, so reading them before the line works but gives undefined. let and const are hoisted too, but placed in a 'temporal dead zone' where reading them throws until execution reaches the line. Understanding hoisting is essential for reading unfamiliar code and avoiding classic 'undefined' bugs.",
        howItWorks: [
          {
            heading: "Function declarations: fully hoisted",
            body: "function foo() {} declarations are moved to the top of their scope with their body intact. You can call foo() on the first line even if the definition is at the bottom.",
          },
          {
            heading: "var: hoisted, initialized to undefined",
            body: "var x = 1 is split into two steps: the declaration var x moves to the top (initialized to undefined), and the assignment x = 1 stays put. Reading x before the assignment line returns undefined.",
          },
          {
            heading: "let and const: hoisted but in the TDZ",
            body: "let and const declarations are hoisted, but the variable is in the 'temporal dead zone' (TDZ) from the start of the scope until the declaration line. Reading it throws a ReferenceError.",
          },
          {
            heading: "Function expressions are NOT hoisted",
            body: "const foo = function() {} follows the const hoisting rules, not function declaration rules. Calling foo() before the assignment throws, not returns undefined.",
          },
        ],
        commonMistakes: [
          "Assuming let and const aren't hoisted — they are, but accessing them in the TDZ throws.",
          "Confusing function declarations with function expressions. Only declarations are fully hoisted.",
          "Relying on var hoisting to use a variable before declaring it — it works but makes code unreadable and encourages bugs.",
          "Using var inside blocks and expecting block scoping — var is function-scoped and leaks out of if/for blocks.",
        ],
        whenToUse:
          "You can't opt out of hoisting, but you can avoid its pitfalls: always prefer let and const over var (the TDZ forces you to declare-before-use), and declare functions near the top of their scope so readers don't have to rely on hoisting to follow the code.",
        faq: [
          {
            question: "What is hoisting in JavaScript?",
            answer:
              "Hoisting is the conceptual model where variable and function declarations are processed before any code runs in a scope. Functions are fully hoisted; var is hoisted and initialized to undefined; let and const are hoisted but unusable until their declaration line is reached.",
          },
          {
            question: "Are let and const hoisted?",
            answer:
              "Yes — but accessing them before the declaration line throws a ReferenceError because they're in the 'temporal dead zone'. This is different from var, which returns undefined when read before its line.",
          },
          {
            question: "What is the temporal dead zone?",
            answer:
              "The region of a scope from the top down to a let or const declaration, where the variable exists but can't be read or written. Any attempt throws a ReferenceError. It ends as soon as execution reaches the declaration.",
          },
          {
            question: "Why are function declarations hoisted but function expressions aren't?",
            answer:
              "Function declarations are parsed and added to the scope in full before execution starts. Function expressions are regular assignments to a variable — the variable is hoisted (as var/let/const) but the function value isn't bound until the assignment runs.",
          },
        ],
        code: `// Function declarations are fully hoisted
console.log(add(2, 3)); // 5
function add(a, b) {
  return a + b;
}

// var is hoisted and initialized to undefined
console.log(typeof x); // "undefined" (no error)
var x = 10;

// let is hoisted but in the TDZ
try {
  console.log(y);
} catch (e) {
  console.log("TDZ error:", e.message);
}
let y = 20;

// Function expression — NOT hoisted
try {
  greet();
} catch (e) {
  console.log("expression error:", e.message);
}
const greet = function() {
  return "hi";
};`,
      },
      {
        title: "for...of vs for...in",
        description: "Choosing the right iteration syntax",
        language: "javascript",
        slug: "for-of-vs-for-in",
        seoTitle: "JavaScript for...of vs for...in — Which to Use and Why",
        seoDescription: "Learn the difference between for...of and for...in loops in JavaScript with runnable examples. When to use each, and why for...in surprises most developers.",
        keywords: ["for of", "for in", "javascript", "iteration", "loop"],
        longDescription:
          "for...of and for...in look similar but iterate over completely different things. for...of iterates values of any iterable — arrays, strings, Maps, Sets, generators. for...in iterates the enumerable keys of an object, including inherited ones, and is almost never what you want for arrays. Pick for...of for ordered collections and for...in only when you deliberately want every string key of an object (and you probably don't).",
        howItWorks: [
          {
            heading: "for...of: values of an iterable",
            body: "Works on any object with a [Symbol.iterator]() method: arrays, strings, Maps, Sets, NodeLists, generators. Gives you the values in iteration order. The 2015+ idiomatic way to loop.",
          },
          {
            heading: "for...in: enumerable string keys",
            body: "Iterates over every enumerable string-keyed property of an object, including properties inherited through the prototype chain. Order is roughly insertion order for string keys, but numeric keys come first in ascending order.",
          },
          {
            heading: "Arrays: use for...of, not for...in",
            body: "for...in on an array iterates indices as strings — and also picks up any added properties or inherited pollution. Always use for...of or forEach for arrays.",
          },
          {
            heading: "Objects: prefer Object.keys/entries + for...of",
            body: "Instead of for...in, use for (const [key, value] of Object.entries(obj)). This gives you your own enumerable keys only, with their values, in one line.",
          },
        ],
        commonMistakes: [
          "Using for...in on arrays — picks up prototype pollution and gives indices as strings.",
          "Forgetting that for...in walks the prototype chain; use hasOwnProperty or Object.keys to filter.",
          "Reaching for for...of on a plain object — plain objects aren't iterable, you'll get a TypeError.",
          "Using for...of when you need the index — use entries(): for (const [i, v] of arr.entries()).",
        ],
        whenToUse:
          "Use for...of for anything iterable (arrays, strings, Maps, Sets, generators). Use for...in only for debugging or when you genuinely need every enumerable string key of an object — and even then, Object.keys/entries is usually clearer.",
        faq: [
          {
            question: "What is the difference between for...of and for...in?",
            answer:
              "for...of iterates values of any iterable (arrays, strings, Maps, Sets). for...in iterates enumerable string keys of an object, including inherited ones. Use for...of for values, Object.keys/entries for object keys.",
          },
          {
            question: "Can I use for...in with an array?",
            answer:
              "You can, but you shouldn't. for...in on an array yields indices as strings and also walks any added or inherited properties. Use for...of, forEach, or a classic for-loop instead.",
          },
          {
            question: "Why is for...of better than forEach?",
            answer:
              "for...of supports break, continue, and return from an enclosing function; forEach doesn't. for...of also works with await for async iteration. forEach is shorter when you truly want to run a callback on every element and nothing else.",
          },
          {
            question: "How do I get both the index and value with for...of?",
            answer:
              "Use .entries(): for (const [i, v] of arr.entries()) { ... }. This gives you both without falling back to a classic for-loop.",
          },
        ],
        code: `const arr = ["a", "b", "c"];
arr.custom = "oops"; // simulate pollution

// for...of: values only, ignores custom
for (const value of arr) {
  console.log("of:", value);
}

// for...in: picks up indices AND custom — usually bad
for (const key in arr) {
  console.log("in:", key);
}

// Correct: index + value
for (const [i, v] of arr.entries()) {
  console.log(\`\${i} -> \${v}\`);
}

// Objects: use Object.entries
const user = { name: "Alice", age: 30 };
for (const [key, value] of Object.entries(user)) {
  console.log(\`\${key}: \${value}\`);
}

// Works on strings, Maps, Sets
for (const char of "hi") console.log(char);
for (const val of new Set([1, 2, 3])) console.log(val);`,
      },
      {
        title: "Memoization",
        description: "Cache function results for speed",
        language: "javascript",
        slug: "memoization",
        seoTitle: "JavaScript Memoization — Cache Function Results with Examples",
        seoDescription: "Learn JavaScript memoization with runnable examples. Speed up pure functions by caching their results, and see how recursive Fibonacci goes from seconds to milliseconds.",
        keywords: ["memoization", "cache", "javascript", "dynamic programming", "performance"],
        longDescription:
          "Memoization is an optimization technique that caches the result of a function call so that repeated calls with the same arguments return instantly instead of recomputing. It only works on pure functions — ones whose output depends only on their inputs and which have no side effects. Memoization is the cornerstone of dynamic programming and can turn exponential algorithms into linear ones.",
        howItWorks: [
          {
            heading: "Build a wrapper around the function",
            body: "memoize(fn) returns a new function that keeps a Map of previously-computed results, keyed by the arguments. If the cache has the key, return the cached value; otherwise compute, cache, and return.",
          },
          {
            heading: "Cache keys must be comparable",
            body: "Simple cases use JSON.stringify(args) as the key. Objects-as-arguments work but have a cost; primitive-only arguments are the fastest case.",
          },
          {
            heading: "Pure functions only",
            body: "Memoization is only safe for functions whose output depends solely on their input — no reading of external state, no side effects. If the function uses the clock, the filesystem, or random numbers, memoizing it will give wrong answers.",
          },
          {
            heading: "Bounded caches avoid memory blowup",
            body: "An unbounded cache grows forever. For hot paths, use an LRU cache or periodically clear the Map. For small argument spaces, unbounded is fine.",
          },
        ],
        commonMistakes: [
          "Memoizing impure functions — you'll cache the first (possibly wrong) answer forever.",
          "Using object references as cache keys when two different objects have the same shape — they won't match.",
          "Letting the cache grow forever on hot paths, causing memory leaks.",
          "Memoizing cheap functions — the Map lookup overhead can exceed the computation cost.",
        ],
        whenToUse:
          "Memoize when a function is pure, expensive to compute, and called many times with a small number of distinct inputs. Classic cases: recursive algorithms (Fibonacci, path-finding), derived selectors in state stores, parsing results for common inputs.",
        faq: [
          {
            question: "What is memoization in JavaScript?",
            answer:
              "Memoization is caching the return value of a function so that repeated calls with the same arguments skip the computation and return the cached result. It's a general optimization technique and the foundation of dynamic programming.",
          },
          {
            question: "When should I use memoization?",
            answer:
              "Use memoization when the function is pure (no side effects, output depends only on input), expensive to compute, and called repeatedly with a bounded set of inputs. Classic examples: recursive algorithms and derived state selectors.",
          },
          {
            question: "Does memoization work on impure functions?",
            answer:
              "No. Memoizing a function that reads external state or has side effects gives wrong answers: the cached result is frozen in time, but the 'real' answer may have changed. Only memoize pure functions.",
          },
          {
            question: "How do I handle object arguments in a memoization cache?",
            answer:
              "Serialize them to a string key (JSON.stringify) for value equality, or use the object reference itself via a WeakMap if reference equality is what you want. WeakMaps also avoid memory leaks for short-lived objects.",
          },
        ],
        code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Slow Fibonacci (exponential)
function slowFib(n) {
  if (n < 2) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

// Memoized Fibonacci (linear)
const fastFib = memoize(function fib(n) {
  if (n < 2) return n;
  return fastFib(n - 1) + fastFib(n - 2);
});

console.time("slow fib(30)");
slowFib(30);
console.timeEnd("slow fib(30)");

console.time("fast fib(30)");
fastFib(30);
console.timeEnd("fast fib(30)");

console.time("fast fib(100)");
console.log(fastFib(100).toString());
console.timeEnd("fast fib(100)");`,
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
        seoTitle: "JavaScript Promise.all — Run Async Operations in Parallel",
        seoDescription: "Learn JavaScript Promise.all with runnable examples. Fire off multiple promises in parallel and collect their results in one await, with full error semantics explained.",
        keywords: ["promise.all", "parallel", "async", "javascript", "promises"],
        longDescription:
          "Promise.all takes an iterable of promises and returns a single promise that resolves when all of them have resolved. Results come back as an array in the same order as the input, regardless of which one finished first. If any input promise rejects, Promise.all rejects immediately with that error — the other promises keep running but their results are discarded.",
        howItWorks: [
          {
            heading: "Fire first, await once",
            body: "Start all the async operations before you await. This is the trick: const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]) runs them in parallel. Writing three awaits in sequence runs them serially.",
          },
          {
            heading: "Results are ordered, not finish-ordered",
            body: "The result array is in the same order as the input, not the order they completed. If fetchC finishes first, it still ends up at results[2].",
          },
          {
            heading: "Fail-fast semantics",
            body: "The first rejection causes Promise.all to reject immediately. Other promises keep running in the background but their results are ignored. Use Promise.allSettled if you want all outcomes, failures included.",
          },
          {
            heading: "Accepts any iterable",
            body: "Not just arrays — any iterable of promises (or plain values, which are wrapped). Mixed values and promises are both supported.",
          },
        ],
        commonMistakes: [
          "Awaiting in a loop instead of Promise.all — turns parallel work serial.",
          "Expecting partial results after one promise rejects — Promise.all discards them. Use allSettled.",
          "Forgetting that Promise.all starts every promise immediately on construction, before the await — if you meant to rate-limit, you need a queue.",
          "Using Promise.all with a huge array (thousands of items) and overwhelming the server — batch or use a concurrency limiter.",
        ],
        whenToUse:
          "Use Promise.all when you have a fixed, small-to-medium number of independent async operations that must all succeed. For unbounded lists, add a concurrency limit. For operations where partial success is acceptable, use Promise.allSettled instead.",
        faq: [
          {
            question: "What does Promise.all do?",
            answer:
              "Promise.all takes an iterable of promises and returns a single promise that resolves with an array of their results when all have resolved. If any rejects, the whole thing rejects with that error.",
          },
          {
            question: "Does Promise.all run promises in parallel?",
            answer:
              "It doesn't start them — you do. Promise.all just waits for a set of already-started promises. Because JavaScript starts each promise as soon as you create it, passing them as an array to Promise.all naturally runs them concurrently.",
          },
          {
            question: "What happens if one promise in Promise.all rejects?",
            answer:
              "Promise.all rejects immediately with that error. Any other promises keep running but their results are discarded. If you need all outcomes regardless, use Promise.allSettled instead.",
          },
          {
            question: "Is Promise.all faster than await in a loop?",
            answer:
              "Yes, dramatically — if the operations are independent. await in a loop runs them one after another; Promise.all runs them concurrently. A 10-item loop of 100ms operations takes ~1000ms serially and ~100ms with Promise.all.",
          },
        ],
        code: `const delay = (ms, val) =>
  new Promise(resolve => setTimeout(() => resolve(val), ms));

(async () => {
  // Parallel — ~200ms total
  console.time("parallel");
  const results = await Promise.all([
    delay(100, "first"),
    delay(200, "second"),
    delay(50, "third"),
  ]);
  console.timeEnd("parallel");
  console.log("results:", results);

  // Same work serially — ~350ms total
  console.time("serial");
  const a = await delay(100, "first");
  const b = await delay(200, "second");
  const c = await delay(50, "third");
  console.timeEnd("serial");
  console.log([a, b, c]);
})();`,
      },
      {
        title: "Async/Await Error Handling",
        description: "Try/catch with async functions",
        language: "javascript",
        slug: "async-await",
        seoTitle: "JavaScript Async/Await Error Handling — Try/Catch Examples",
        seoDescription: "Learn async/await error handling in JavaScript with try/catch. Runnable examples covering success, failure, multiple awaits, and rethrowing patterns.",
        keywords: ["async await", "try catch", "error handling", "javascript", "promises"],
        longDescription:
          "async/await is syntactic sugar over promises, and so is its error handling: a rejected promise becomes a thrown exception inside the async function, catchable with try/catch just like synchronous errors. The catch block receives whatever the rejected promise was rejected with — usually an Error instance, but technically any value. Combined with await, this gives async code the same clean error-handling shape as synchronous code.",
        howItWorks: [
          {
            heading: "await turns rejection into throw",
            body: "When you await a promise that rejects, the await expression throws synchronously inside the async function. Wrapping it in try/catch catches the error the same way you'd catch a regular throw.",
          },
          {
            heading: "One try, multiple awaits",
            body: "You can put several awaits inside the same try block. The first one that rejects jumps to catch — subsequent awaits are skipped. Use separate try blocks only when each error needs different handling.",
          },
          {
            heading: "finally runs no matter what",
            body: "A finally block runs after try (whether it completed or threw) and after catch. Perfect for cleanup — closing connections, releasing locks, hiding spinners.",
          },
          {
            heading: "Unhandled rejections still happen",
            body: "If you don't await a promise and it rejects, you get an unhandledRejection. Always await promises you expect to potentially fail, or attach a .catch(). Silent rejections are the async equivalent of silently-swallowed exceptions.",
          },
        ],
        commonMistakes: [
          "Forgetting to await a promise inside try — a rejection won't be caught because the function has already returned.",
          "Swallowing errors with an empty catch block — the error is gone but so is any diagnostic.",
          "Assuming catch(e) gives you an Error — it could be any rejected value, including a string or undefined.",
          "Writing try/catch around a Promise.all where you only care if at least one rejected — use allSettled if you want per-promise outcomes.",
        ],
        whenToUse:
          "Always handle expected failure modes with try/catch (network errors, missing data, permission denied). Let truly unexpected errors bubble up to a higher-level handler — don't catch errors you don't know how to handle.",
        faq: [
          {
            question: "How do I handle errors in async/await?",
            answer:
              "Wrap the await expression in a try/catch block. A rejected promise becomes a thrown exception inside the async function, so try/catch catches it exactly like a synchronous throw.",
          },
          {
            question: "Can I use try/catch with multiple awaits?",
            answer:
              "Yes. A single try block can wrap as many awaits as you want. The first rejection jumps to the catch block, and subsequent awaits are skipped. Use separate try blocks only when each error requires different handling.",
          },
          {
            question: "What is an unhandled promise rejection?",
            answer:
              "A promise that rejects and has no catch handler or try/catch wrapping an await. Node and browsers emit an 'unhandledRejection' event; in strict environments it terminates the process. Always await or .catch() every promise you create.",
          },
          {
            question: "Should I always use try/catch inside async functions?",
            answer:
              "Only at layers where you can handle the error — retry, show a user-facing message, log it, fall back to a default. Don't wrap every line in try/catch 'just in case'; let errors bubble up to a layer that knows what to do.",
          },
        ],
        code: `async function fetchData(shouldFail) {
  await new Promise(r => setTimeout(r, 100));
  if (shouldFail) throw new Error("Network error");
  return { data: [1, 2, 3] };
}

(async () => {
  // Success
  try {
    const result = await fetchData(false);
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    console.log("cleanup 1");
  }

  // Failure
  try {
    const result = await fetchData(true);
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    console.log("cleanup 2");
  }
})();`,
      },
      {
        title: "Promise.race & allSettled",
        description: "Advanced Promise combinators",
        language: "javascript",
        slug: "promise-race-allsettled",
        seoTitle: "JavaScript Promise.race & allSettled — Combinator Examples",
        seoDescription: "Learn Promise.race and Promise.allSettled in JavaScript with runnable examples. Timeouts, first-to-finish wins, and collecting every outcome including failures.",
        keywords: ["promise.race", "promise.allSettled", "promise combinators", "javascript", "async"],
        longDescription:
          "Promise.race and Promise.allSettled complete the 'combinator' family alongside Promise.all and Promise.any. race settles with whichever input settles first — useful for timeouts and first-response-wins patterns. allSettled waits for everything and returns per-promise outcome objects, so a single failure doesn't discard the rest. Together they cover the cases Promise.all can't: early exit and partial-success reporting.",
        howItWorks: [
          {
            heading: "Promise.race — first settlement wins",
            body: "Returns a promise that settles as soon as any input settles — resolved or rejected. Common use: racing a real operation against a timeout promise to impose a maximum wait.",
          },
          {
            heading: "Promise.allSettled — every outcome",
            body: "Waits for all input promises regardless of success or failure, then resolves with an array of { status: 'fulfilled'|'rejected', value|reason } objects. Never rejects itself.",
          },
          {
            heading: "Promise.any — first success",
            body: "A close cousin: resolves with the first fulfilled result, ignoring rejections. Only rejects if all inputs reject, with an AggregateError collecting every failure.",
          },
          {
            heading: "Picking the right combinator",
            body: "all: everything must succeed. allSettled: collect everything, success or not. race: whoever finishes first wins (good or bad). any: whoever succeeds first wins.",
          },
        ],
        commonMistakes: [
          "Using Promise.race for 'first success' — a fast rejection wins and kills the race. Use Promise.any for that.",
          "Assuming allSettled rejects — it never does; always check each entry's status field.",
          "Racing an API call against setTimeout without also rejecting the timeout, so the API still runs even after the timeout 'wins'.",
          "Forgetting that race doesn't cancel losers — they keep running in the background until they complete or crash.",
        ],
        whenToUse:
          "Use race for timeouts and 'first response wins' patterns. Use allSettled when you need to report on every operation regardless of outcome (dashboards, batch status). Use any when a single success is enough and you want to ignore failures.",
        faq: [
          {
            question: "What is the difference between Promise.race and Promise.any?",
            answer:
              "Promise.race settles with whichever promise settles first — resolved or rejected. Promise.any waits for the first fulfilled promise and ignores rejections until all reject. Use race for timeouts, any for 'first success wins'.",
          },
          {
            question: "When should I use Promise.allSettled?",
            answer:
              "When you need to know the outcome of every promise regardless of success or failure — dashboards, batch-processing reports, retries that care about which subset failed. Unlike Promise.all, a single rejection doesn't discard everything.",
          },
          {
            question: "Can Promise.race be used for timeouts?",
            answer:
              "Yes — race your real promise against a setTimeout-based promise that rejects after N ms. Whichever settles first wins. Note that losers keep running in the background; for true cancellation use AbortController.",
          },
          {
            question: "Does Promise.allSettled ever reject?",
            answer:
              "No — it always fulfills, with an array of per-promise outcome objects. Each entry has { status: 'fulfilled', value } or { status: 'rejected', reason }. You inspect each result individually.",
          },
        ],
        code: `const delay = (ms, val) =>
  new Promise(r => setTimeout(() => r(val), ms));
const fail = (ms, msg) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

(async () => {
  // race: first to settle wins
  const fastest = await Promise.race([
    delay(200, "slow"),
    delay(50, "fast"),
    delay(100, "medium"),
  ]);
  console.log("race winner:", fastest);

  // race as timeout
  try {
    const result = await Promise.race([
      delay(500, "real result"),
      fail(200, "Timeout after 200ms"),
    ]);
    console.log("got:", result);
  } catch (e) {
    console.error("error:", e.message);
  }

  // allSettled: every outcome
  const outcomes = await Promise.allSettled([
    delay(50, "ok"),
    fail(100, "oops"),
    delay(75, "also ok"),
  ]);
  outcomes.forEach((o, i) => {
    if (o.status === "fulfilled") console.log(\`\${i}: ✓ \${o.value}\`);
    else console.log(\`\${i}: ✗ \${o.reason.message}\`);
  });
})();`,
      },
      {
        title: "Event Loop Demo",
        description: "Microtasks vs macrotasks — execution order explained",
        language: "javascript",
        slug: "event-loop",
        seoTitle: "JavaScript Event Loop — Microtasks vs Macrotasks (with Runnable Demo)",
        seoDescription: "Understand the JavaScript event loop with a runnable microtask vs macrotask demo. See the exact execution order, why Promise.then runs before setTimeout, and how the task queues interact.",
        keywords: ["event loop", "microtask", "macrotask", "javascript", "promise then", "setTimeout", "queueMicrotask"],
        longDescription:
          "The JavaScript event loop is the scheduler that decides which piece of code runs next. It alternates between running synchronous code to completion, then draining the microtask queue (Promise callbacks, queueMicrotask, MutationObserver), then picking one macrotask (setTimeout, setInterval, I/O, UI events) and repeating. Understanding the order — sync, microtasks to exhaustion, one macrotask, repeat — is the difference between predicting your code's output and being surprised by it. This page walks through the exact order with a runnable demo and explains the rules you need to internalize.",
        howItWorks: [
          {
            heading: "Step 1: Run all synchronous code first",
            body: "The engine executes the current call stack top to bottom. Nothing from any queue runs while there's sync code left. Every console.log on the top level of your script fires before any promise callback or timeout.",
          },
          {
            heading: "Step 2: Drain the microtask queue completely",
            body: "Once the stack is empty, the engine runs every queued microtask in order — Promise.then, Promise.catch, queueMicrotask, MutationObserver. Critically: if a microtask queues another microtask, that new one runs in the same drain. The queue is drained to empty before moving on.",
          },
          {
            heading: "Step 3: Pick exactly one macrotask",
            body: "After microtasks are drained, the engine picks one task from the macrotask queue — a setTimeout callback, an I/O completion, a UI event. Just one. Then back to step 2 to drain microtasks again.",
          },
          {
            heading: "Step 4: Rendering happens between ticks (in browsers)",
            body: "Browsers may render the page between ticks of the event loop, but never in the middle of a sync block or microtask drain. This is why a long-running microtask chain (or tight while-loop) can freeze the UI.",
          },
          {
            heading: "Why microtasks always beat macrotasks",
            body: "A setTimeout(fn, 0) queues a macrotask. A Promise.resolve().then(fn) queues a microtask. Even though both are 'as soon as possible', microtasks are drained to completion before any macrotask runs, so the Promise callback always wins.",
          },
        ],
        commonMistakes: [
          "Assuming setTimeout(fn, 0) runs 'immediately' — it runs after the current sync block AND after every pending microtask.",
          "Writing long microtask chains that starve the event loop and freeze the UI, because rendering and macrotasks can't interleave between microtasks.",
          "Confusing queueMicrotask and setTimeout — they're in different queues with different priorities.",
          "Assuming async/await makes code run on the next tick — the code up to the first await runs synchronously; only the continuation is a microtask.",
        ],
        whenToUse:
          "You don't 'use' the event loop — you work with it. The practical takeaways: use queueMicrotask or Promise.resolve().then() when you need to defer work to after the current sync block but before the next render; use setTimeout(fn, 0) when you want to yield to the browser for rendering and UI events.",
        faq: [
          {
            question: "What is the JavaScript event loop?",
            answer:
              "The event loop is JavaScript's scheduler. It runs synchronous code to completion, then drains the microtask queue (Promise callbacks, queueMicrotask), then processes exactly one macrotask (setTimeout, I/O, UI events), then repeats. This single-threaded cycle is what makes async code work without blocking.",
          },
          {
            question: "What is the difference between a microtask and a macrotask?",
            answer:
              "Microtasks are scheduled by Promise.then, queueMicrotask, and MutationObserver. Macrotasks are scheduled by setTimeout, setInterval, I/O callbacks, and UI events. After every synchronous block, the engine drains ALL microtasks before running the NEXT macrotask — so microtasks always 'beat' macrotasks even if both are queued with zero delay.",
          },
          {
            question: "Why does Promise.then run before setTimeout(fn, 0)?",
            answer:
              "Because Promise.then queues a microtask and setTimeout queues a macrotask. The event loop drains all microtasks before picking a macrotask, so the Promise callback runs first — even if you queue it after the setTimeout in source order.",
          },
          {
            question: "What is queueMicrotask used for?",
            answer:
              "queueMicrotask(fn) schedules fn as a microtask, meaning it runs after the current synchronous block but before the next macrotask (or render). It's the lowest-overhead way to defer work inside a tick, and is how you signal 'do this right after I'm done with this call stack'.",
          },
          {
            question: "Can microtasks starve the event loop?",
            answer:
              "Yes. Because the microtask queue is drained to completion before any macrotask or render, an infinite chain of microtasks (each one queuing another) will freeze the browser. Use setTimeout(fn, 0) to yield back to the event loop when you need rendering to happen.",
          },
          {
            question: "When does async/await interact with the event loop?",
            answer:
              "The code in an async function runs synchronously up to the first await. At that point the function pauses and its continuation (the code after the await) is scheduled as a microtask to run once the awaited promise settles. Everything before the first await is still synchronous.",
          },
        ],
        code: `console.log("1 - synchronous start");

setTimeout(() => console.log("2 - setTimeout (macrotask)"), 0);

Promise.resolve().then(() => {
  console.log("3 - Promise.then (microtask)");
  // Queuing another microtask from inside a microtask:
  queueMicrotask(() => console.log("4 - nested microtask (same drain)"));
});

queueMicrotask(() => {
  console.log("5 - queueMicrotask (microtask)");
});

console.log("6 - synchronous end");

// Expected order:
// 1, 6 — sync block runs to completion
// 3, 5 — microtasks drain (Promise.then and queueMicrotask)
// 4    — nested microtask from step 3 runs in the same drain
// 2    — setTimeout macrotask runs after ALL microtasks

// Async/await interaction
async function demo() {
  console.log("A - before await");
  await Promise.resolve();
  console.log("B - after await (microtask)");
}
demo();
console.log("C - sync after demo() call");
// A and C run sync; B runs as a microtask after C.`,
      },
      {
        title: "Async Iterators",
        description: "for await...of and async generators",
        language: "javascript",
        slug: "async-iterators",
        seoTitle: "JavaScript Async Iterators — for await...of and Async Generators",
        seoDescription: "Learn JavaScript async iterators and generators with runnable examples. Stream paginated APIs, process incoming data one chunk at a time, and use for await...of.",
        keywords: ["async iterator", "for await of", "async generator", "javascript", "streaming"],
        longDescription:
          "Async iterators let you consume asynchronous sequences one value at a time with clean syntax. for await...of is the async cousin of for...of — it awaits each next() call, pausing the loop until the next value arrives. Combined with async generators (async function*), they become the best tool for streaming paginated APIs, reading files line by line, and processing incoming websocket messages without buffering everything into memory.",
        howItWorks: [
          {
            heading: "Async generator with async function*",
            body: "An async generator yields values asynchronously. Each yield returns a promise to the consumer; the next yield waits for the consumer to call next() again. The generator body can await anything between yields.",
          },
          {
            heading: "for await...of consumes async iterables",
            body: "for await (const x of asyncIterable) calls next(), awaits the result, unwraps .value, and runs the body. When next() returns { done: true }, the loop ends. Any rejection jumps to try/catch just like a regular await.",
          },
          {
            heading: "Pagination is the canonical use case",
            body: "Fetch page 1, yield each item, fetch page 2, yield each item, repeat until no more pages. The consumer sees a flat stream; the generator handles pagination internally.",
          },
          {
            heading: "Early exit with break",
            body: "break inside for await...of calls the iterator's return() method, giving the generator a chance to clean up. This is how you stop streaming when you've found what you need.",
          },
        ],
        commonMistakes: [
          "Awaiting inside a regular for-loop over an async iterator instead of using for await...of — you lose the cleanup semantics.",
          "Forgetting that async generators buffer nothing — if the consumer is slow, the producer is paused too (which is usually what you want).",
          "Building an async iterator when a plain array of promises + for-loop would do — async iterators shine when the total size is unknown or too large to buffer.",
          "Not handling rejection — a failed fetch inside the generator will throw out of the for await...of loop.",
        ],
        whenToUse:
          "Use async iterators for streaming data with unknown or large size: paginated APIs, line-by-line file reading, incoming messages over a socket, chunked HTTP responses. Use a plain array + Promise.all when the total count is small and known.",
        faq: [
          {
            question: "What is an async iterator in JavaScript?",
            answer:
              "An async iterator is an object whose next() method returns a promise for { value, done }. You consume it with for await...of, which awaits each step. Async generators (async function*) are the easiest way to build one.",
          },
          {
            question: "When should I use for await...of instead of Promise.all?",
            answer:
              "Use for await...of when values arrive over time (streaming, pagination, sockets) or when the total count is unknown. Use Promise.all when you have a fixed list of independent promises and you want them all to run concurrently.",
          },
          {
            question: "Can I break out of a for await...of loop early?",
            answer:
              "Yes — break works and also calls the iterator's return() method, which gives an async generator a chance to clean up (close connections, stop fetching). This makes 'first match wins' streaming searches clean and safe.",
          },
          {
            question: "Does for await...of run in parallel?",
            answer:
              "No — it runs serially by design. Each iteration waits for the previous one's await to settle. If you want parallelism over a stream, collect items in batches and Promise.all the batches.",
          },
        ],
        code: `async function* paginate(pageSize) {
  for (let page = 1; page <= 3; page++) {
    // Simulate API call
    await new Promise(r => setTimeout(r, 50));
    const items = Array.from(
      { length: pageSize },
      (_, i) => \`page\${page}-item\${i + 1}\`,
    );
    console.log(\`fetched page \${page}\`);
    for (const item of items) yield item;
  }
}

(async () => {
  // Stream every item across all pages
  for await (const item of paginate(3)) {
    console.log("got:", item);
  }

  // Early exit
  console.log("--- with break ---");
  for await (const item of paginate(3)) {
    console.log("scan:", item);
    if (item === "page2-item2") break;
  }
})();`,
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
        seoTitle: "TypeScript Generics — Type-Safe Functions and Constraints",
        seoDescription: "Learn TypeScript generics with runnable examples. Generic functions, type constraints, default type parameters, and type-safe container patterns.",
        keywords: ["typescript generics", "generic function", "type constraints", "typescript"],
        longDescription:
          "Generics let you write functions and types that work with any type while preserving that type information through the call. Instead of falling back to any (which loses type safety), you introduce a type parameter that gets inferred or supplied at the call site. The result: one implementation that's reusable across types, and the compiler still catches mismatches.",
        howItWorks: [
          {
            heading: "Type parameters in angle brackets",
            body: "function first<T>(arr: T[]): T | undefined — T is a placeholder. When you call first([1, 2, 3]), TypeScript infers T = number, so the return type is number | undefined.",
          },
          {
            heading: "Constraints with extends",
            body: "<T extends { length: number }> means 'any type that has a length property'. The constraint limits which types can be used as T and gives you access to its members inside the function.",
          },
          {
            heading: "Default type parameters",
            body: "<T = string> provides a fallback when the caller doesn't supply or infer a type. Useful for utility types and optional positions.",
          },
          {
            heading: "Multiple parameters and inference",
            body: "function map<T, U>(arr: T[], fn: (x: T) => U): U[] — two parameters inferred from the input array and the function's return type. The caller usually never has to supply them manually.",
          },
        ],
        commonMistakes: [
          "Overusing generics when a plain type would do — <T> only earns its keep when the caller needs to preserve the type.",
          "Missing a constraint and then trying to use a property inside the function — T has no methods unless you extend it.",
          "Writing function foo<T>(x: any): T — the any defeats the point, and T isn't tied to anything.",
          "Returning a union T | U when one of them should be a constraint instead.",
        ],
        whenToUse:
          "Use generics whenever a function or data structure should be reusable across types without losing type information. Collections (Stack<T>, Queue<T>), utility functions (first, last, groupBy), and wrapper types (Result<T>, Maybe<T>) all benefit.",
        faq: [
          {
            question: "What are generics in TypeScript?",
            answer:
              "Generics are type parameters that let a function or type work with any type while preserving the specific type at the call site. Instead of returning any, you return T — whatever T was at the call.",
          },
          {
            question: "What is a generic constraint?",
            answer:
              "A constraint restricts what types are allowed for a type parameter. <T extends { length: number }> means T must have a length property, which lets you read that property inside the function with type safety.",
          },
          {
            question: "Do I need to specify generic types when calling a function?",
            answer:
              "Usually no — TypeScript infers them from the arguments. You only need to specify them when inference can't figure it out, or when you want to override the inferred type.",
          },
          {
            question: "When should I use a generic instead of a union type?",
            answer:
              "Use a generic when the caller's specific type should flow through to the return value. Use a union when a fixed set of known types is acceptable and you don't need call-site-specific typing.",
          },
        ],
        code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log(first([1, 2, 3]));        // inferred T = number
console.log(first(["a", "b", "c"]));  // inferred T = string

// Generic with constraint
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("hello", "hi"));
console.log(longest([1, 2, 3], [4, 5]));

// Multiple parameters
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const p = pair("answer", 42); // [string, number]
console.log(p);

// Default type parameter
function wrap<T = string>(value: T): { value: T } {
  return { value };
}
console.log(wrap("hi"));
console.log(wrap<number>(42));`,
      },
      {
        title: "Type Guards",
        description: "Narrow types with custom guards",
        language: "typescript",
        slug: "type-guards",
        seoTitle: "TypeScript Type Guards — Narrow Types with Pattern Matching",
        seoDescription: "Learn TypeScript type guards and type narrowing with runnable examples. Switch-case pattern matching, typeof, instanceof, and custom predicate guards.",
        keywords: ["type guards", "type narrowing", "typescript", "typeof", "instanceof", "type predicate"],
        longDescription:
          "Type guards are expressions that narrow a value's type within a code branch. TypeScript's control-flow analysis recognizes typeof, instanceof, equality checks, the `in` operator, and user-defined type predicates, and uses them to refine the type as you go. This is how you take a union like string | number and end up in a branch where the compiler knows you have just a string.",
        howItWorks: [
          {
            heading: "Built-in guards: typeof and instanceof",
            body: "typeof x === 'string' narrows x to string in the true branch. x instanceof Error narrows to Error. Both are recognized by TypeScript's control-flow analysis with zero ceremony.",
          },
          {
            heading: "Discriminated unions + switch",
            body: "Give each variant a literal tag property ('kind', 'type'), then switch on it. Inside each case, TypeScript narrows to that specific variant — including its extra fields.",
          },
          {
            heading: "User-defined type predicates",
            body: "function isUser(x: unknown): x is User { ... } — the `x is User` return type tells TypeScript that the function's true return value implies the argument is a User. Lets you encapsulate complex narrowing logic.",
          },
          {
            heading: "The 'in' operator narrows by key",
            body: "if ('length' in obj) narrows obj to the subset of the union that has a length property. Handy for duck-typed unions where there's no tag field.",
          },
        ],
        commonMistakes: [
          "Forgetting a case in a discriminated union — the function silently returns undefined. Use exhaustiveness checks with never.",
          "Writing a type predicate whose body doesn't actually verify the shape — TypeScript trusts you, and bugs slip through.",
          "Using typeof on objects — typeof {} === 'object' and so does typeof [] and typeof null. Combine with Array.isArray and != null.",
          "Trying to narrow with `if (x)` alone — this removes falsy values (undefined, null, 0, '', false) but may leave more than you expect.",
        ],
        whenToUse:
          "Use discriminated unions for modelling 'one of N known shapes' — API responses, Redux actions, result types. Use type predicates when the narrowing logic is complex or needs to be reused. Use typeof/instanceof for everyday narrowing inside a single function.",
        faq: [
          {
            question: "What is a type guard in TypeScript?",
            answer:
              "A type guard is an expression whose truthiness narrows a value's type in the branch it guards. Examples: typeof x === 'string', x instanceof Error, user-defined predicates like isUser(x).",
          },
          {
            question: "What is the difference between type guards and type assertions?",
            answer:
              "A type guard narrows the type through runtime logic that TypeScript can verify. A type assertion (x as T) just tells the compiler 'trust me, it's a T' — no runtime check. Guards are safer; assertions are escape hatches.",
          },
          {
            question: "What is a user-defined type predicate?",
            answer:
              "A function returning `x is T`. TypeScript uses its return value to narrow the argument's type. Example: function isString(x: unknown): x is string { return typeof x === 'string' }.",
          },
          {
            question: "How do I enforce exhaustive switch on a union?",
            answer:
              "Add a default case that assigns the value to a variable of type never. If any case is missing, the assignment fails to compile. const _exhaustive: never = value.",
          },
        ],
        code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default: {
      // Exhaustiveness check: fails compilation if a case is missing
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

console.log(area({ kind: "circle", radius: 5 }).toFixed(2));
console.log(area({ kind: "rect", width: 4, height: 6 }));
console.log(area({ kind: "triangle", base: 4, height: 3 }));

// User-defined type predicate
function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.length > 0;
}

const values: unknown[] = ["hello", "", 42, null];
const strings = values.filter(isNonEmptyString);
console.log(strings); // inferred as string[]`,
      },
      {
        title: "Utility Types",
        description: "Built-in mapped and conditional types",
        language: "typescript",
        slug: "utility-types",
        seoTitle: "TypeScript Utility Types — Partial, Pick, Omit, Record Explained",
        seoDescription: "Learn TypeScript utility types with runnable examples. Partial, Required, Pick, Omit, Record, Readonly, and more built-in mapped types.",
        keywords: ["utility types", "partial", "pick", "omit", "record", "typescript", "mapped types"],
        longDescription:
          "TypeScript ships with a set of utility types that transform existing types in common ways: making every field optional, picking a subset, removing fields, creating a key-value map from a union. They're the building blocks of type-level programming in TypeScript and replace most hand-written mapped types. Knowing the main six — Partial, Required, Pick, Omit, Record, Readonly — covers 90% of real-world use cases.",
        howItWorks: [
          {
            heading: "Partial<T> — all fields optional",
            body: "Makes every property of T optional. Perfect for update-style functions: function update(user: User, changes: Partial<User>).",
          },
          {
            heading: "Pick<T, K> and Omit<T, K>",
            body: "Pick selects a subset of keys; Omit removes them. They're complementary: Pick<User, 'id' | 'name'> gives you just those two fields, Omit<User, 'password'> gives everything except password.",
          },
          {
            heading: "Record<K, V> — key-value map",
            body: "Record<'admin' | 'user', number> creates { admin: number; user: number }. The first parameter is the set of keys, the second is the value type.",
          },
          {
            heading: "Readonly<T> and ReturnType<F>",
            body: "Readonly marks every property as read-only at the type level. ReturnType<typeof fn> extracts the return type of a function type — handy for inferring types from existing code.",
          },
        ],
        commonMistakes: [
          "Reaching for Partial<T> when you only need a subset — Pick is more precise and documents intent.",
          "Using Omit with a typo'd key — it silently succeeds in TypeScript 4.5+. Double-check spelling.",
          "Forgetting that Readonly is shallow — nested objects are still mutable.",
          "Combining utility types without intermediate aliases, ending up with unreadable one-liners.",
        ],
        whenToUse:
          "Reach for these whenever you're deriving one type from another — update payloads (Partial), preview types (Pick), stripping secrets (Omit), lookup maps (Record), immutable snapshots (Readonly). They keep types in sync when the source type changes.",
        faq: [
          {
            question: "What is Partial<T> in TypeScript?",
            answer:
              "Partial<T> is a utility type that makes every property of T optional. It's perfect for update functions and patch payloads where the caller may supply any subset of the fields.",
          },
          {
            question: "What is the difference between Pick and Omit?",
            answer:
              "They're complementary. Pick<T, K> creates a type with only the listed keys. Omit<T, K> creates a type with the listed keys removed. Use whichever is shorter: Pick when you want a few keys, Omit when you want most of them.",
          },
          {
            question: "What is Record<K, V>?",
            answer:
              "Record<K, V> is a type with keys of type K and values of type V. Record<'admin' | 'user', number> is shorthand for { admin: number; user: number }. It's the canonical way to build lookup maps.",
          },
          {
            question: "Is Readonly deep or shallow?",
            answer:
              "Shallow — only the top-level properties are marked read-only. Nested objects can still be mutated. For deep immutability you need a recursive helper type like DeepReadonly<T>.",
          },
        ],
        code: `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// Partial: all fields optional — good for update payloads
type UpdateData = Partial<User>;
const change: UpdateData = { name: "Alice" };
console.log(change);

// Pick: select specific fields
type UserPreview = Pick<User, "id" | "name">;
const preview: UserPreview = { id: 1, name: "Alice" };
console.log(preview);

// Omit: exclude specific fields
type PublicUser = Omit<User, "email">;
const pub: PublicUser = { id: 2, name: "Bob", role: "user" };
console.log(pub);

// Record: map keys to values
type RoleCount = Record<User["role"], number>;
const counts: RoleCount = { admin: 3, user: 42 };
console.log(counts);

// Readonly: immutable snapshot (shallow)
type Frozen = Readonly<User>;
const user: Frozen = { id: 3, name: "Carol", email: "c@x.io", role: "admin" };
// user.name = "Dana"; // compile error`,
      },
      {
        title: "Discriminated Unions",
        description: "Exhaustive pattern matching",
        language: "typescript",
        slug: "discriminated-unions",
        seoTitle: "TypeScript Discriminated Unions — Pattern Matching Examples",
        seoDescription: "Learn TypeScript discriminated unions and exhaustive pattern matching with runnable examples. Result types, state machines, and safe switch-case.",
        keywords: ["discriminated union", "tagged union", "typescript", "pattern matching", "result type"],
        longDescription:
          "A discriminated union (also called a tagged union) is a union type where each member has a common literal field — the 'discriminant' or 'tag' — that lets TypeScript figure out which variant you're holding. Inside a switch on that tag, TypeScript narrows to each specific variant, including its extra fields. Discriminated unions are the safest way to model 'one of N shapes' — API responses, Redux actions, state machines, Result<T> / Either types.",
        howItWorks: [
          {
            heading: "Every variant gets a literal tag",
            body: "type Result<T> = { ok: true; value: T } | { ok: false; error: string }. The tag here is `ok`, a literal true or false. Any distinct set of literals works: 'loading'|'success'|'error', 'add'|'remove'|'update', etc.",
          },
          {
            heading: "Narrowing happens via switch or if",
            body: "if (result.ok) narrows to the ok: true variant, so result.value is accessible. else narrows to ok: false and result.error. A switch on the tag field gives you the same narrowing in each case.",
          },
          {
            heading: "Exhaustiveness with never",
            body: "Assign the narrowed value to a variable of type never in the default case. If you ever add a new variant without handling it, the never assignment fails to compile — compiler-enforced exhaustiveness.",
          },
          {
            heading: "No runtime type checks needed",
            body: "Because the tag is a value in the object itself, narrowing is a plain property check at runtime. No class hierarchy, no instanceof, no reflection.",
          },
        ],
        commonMistakes: [
          "Using an optional field as the discriminant — undefined doesn't narrow cleanly.",
          "Forgetting the exhaustiveness check, then adding a new variant and getting silent undefined returns in production.",
          "Making the tag a string when a boolean would be simpler (Result's ok: true/false) or vice versa.",
          "Mixing several overlapping tags instead of committing to one — TypeScript can narrow, but the code becomes unreadable.",
        ],
        whenToUse:
          "Any time you're modelling a fixed set of shapes where each shape carries different data: parsed AST nodes, Redux/Flux actions, API response types, loading/success/error state, Result<T, E>, network protocol messages. If you find yourself writing `data: any` because the shape varies, reach for a discriminated union instead.",
        faq: [
          {
            question: "What is a discriminated union in TypeScript?",
            answer:
              "A union type where each member has a common literal field (the discriminant) that TypeScript uses to narrow between the variants. It's the type-safe way to model 'one of N shapes' without runtime class hierarchies.",
          },
          {
            question: "How do I enforce exhaustive matching on a discriminated union?",
            answer:
              "Add a default case that assigns the narrowed value to a variable of type never. const _exhaustive: never = value. If you add a new variant and forget to handle it, the assignment fails to compile.",
          },
          {
            question: "Can the discriminant be something other than a string?",
            answer:
              "Yes — literal booleans (Result's ok: true/false), numbers, and even specific object shapes work. String literals are the most common because they're readable and hard to mistype.",
          },
          {
            question: "Are discriminated unions the same as sum types in other languages?",
            answer:
              "Conceptually, yes. Haskell's data types, Rust's enums with variants, and OCaml's variants are all sum types. Discriminated unions are TypeScript's way to express the same idea with structural typing and literal tags.",
          },
        ],
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
display(divide(10, 0));

// State machine with exhaustiveness
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function render(state: State): string {
  switch (state.status) {
    case "idle":    return "Press start";
    case "loading": return "Loading...";
    case "success": return \`Got \${state.data.length} items\`;
    case "error":   return \`Oops: \${state.message}\`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

console.log(render({ status: "loading" }));
console.log(render({ status: "success", data: ["a", "b", "c"] }));`,
      },
    ],
  },
];
