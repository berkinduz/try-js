export const DEFAULT_JS_CODE = `// Welcome to JS Park! 🌿
// Write JavaScript and see the output instantly.

const greet = (name) => \`Hello, \${name}!\`;

console.log(greet("World"));

// Try some array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Objects work too
const user = { name: "Berkin", role: "developer" };
console.log("User:", user);
`;

export const DEFAULT_TS_CODE = `// TypeScript mode enabled!
// Type annotations are supported.

interface User {
  name: string;
  age: number;
  role: "admin" | "user";
}

const createUser = (name: string, age: number): User => ({
  name,
  age,
  role: age >= 18 ? "admin" : "user",
});

const user: User = createUser("Berkin", 25);
console.log("User:", user);

// Generics work too
const first = <T>(arr: T[]): T | undefined => arr[0];
console.log("First:", first([10, 20, 30]));
`;

export const AUTO_RUN_DELAY = 500;
export const EXECUTION_TIMEOUT = 5000;
export const MIN_PANE_SIZE = 200;
export const DEFAULT_SPLIT_RATIO = 0.55;
export const MOBILE_BREAKPOINT = 768;
