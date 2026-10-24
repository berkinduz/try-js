import type { Snippet, SnippetCategory } from "./snippets.ts";
import {
  REACT_VERSION,
  VUE_VERSION,
  ZOD_VERSION,
} from "../utils/runtime-versions.ts";

const uiCss = `* { box-sizing: border-box; }
body { margin: 0; padding: 24px; background: #faf8f0; color: #222; font: 15px/1.6 system-ui, sans-serif; }
h1 { font-size: 24px; line-height: 1.2; margin: 0 0 12px; }
p { margin: 8px 0 16px; }
button, input { font: inherit; }
button { padding: 9px 16px; border: 1px solid #b9a200; border-radius: 7px; background: #f0d000; color: #222; cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
input { max-width: 100%; padding: 9px 12px; border: 1px solid #aaa; border-radius: 7px; }
small { color: #595959; }
output { font-variant-numeric: tabular-nums; }
`;

const dataExamples: Snippet[] = [
  {
    slug: "deduplicate-objects",
    title: "Remove duplicate objects by ID",
    description:
      "Keep one record per ID. Choose whether the first or last record wins.",
    seoTitle: "Remove Duplicate Objects by ID in JavaScript",
    seoDescription:
      "Remove duplicate objects from a JavaScript array by ID with Map. Edit the records, compare first and last matches, and run the example in your browser.",
    language: "javascript",
    tags: ["Arrays", "Map", "Data"],
    goal: "solve",
    featured: true,
    tryThis:
      "Change the second record's id from 1 to 3. Then compare the two results.",
    expectedResult:
      "The first result keeps the updated record for ID 1. The second keeps the original record. Both contain two unique IDs.",
    longDescription:
      "API responses and imported lists can contain repeated records. A Set compares object identity, so two objects with the same ID still count as different values. A Map lets you choose a meaningful key and decide which duplicate to keep.",
    howItWorks: [
      {
        heading: "Choose the identity",
        body: "Each Map entry uses record.id as its key. Repeated IDs replace the previous value, preserving the last record for that key.",
      },
      {
        heading: "Keep the first match",
        body: "Only insert a record when its ID is absent. This keeps the first value instead. Change the key to email or another field to match your data.",
      },
    ],
    commonMistakes: [
      "Using new Set(records) compares object references, not their ID fields.",
      "Treating missing IDs as unique: all undefined keys collapse into one Map entry.",
    ],
    code: `const records = [
  { id: 1, name: "Original" },
  { id: 1, name: "Updated" },
  { id: 2, name: "Another" },
];

const keepLast = [...new Map(records.map(record => [record.id, record])).values()];
console.log("Last record wins:", keepLast);

const firstById = new Map();
for (const record of records) {
  if (!firstById.has(record.id)) firstById.set(record.id, record);
}
console.log("First record wins:", [...firstById.values()]);`,
  },
  {
    slug: "group-array-by-property",
    title: "Group records by a property",
    description: "Turn a list of products into categories with Object.groupBy.",
    seoTitle: "JavaScript Object.groupBy — Group an Array by Property",
    seoDescription:
      "Group an array of objects by a property with Object.groupBy. Change the sample products, inspect the grouped result, and calculate totals in a live JavaScript example.",
    language: "javascript",
    tags: ["Arrays", "Data", "Object.groupBy"],
    goal: "solve",
    featured: true,
    environment: "Modern browser · Object.groupBy",
    tryThis:
      "Change a product's category or add a new category. Watch the groups and totals change.",
    expectedResult:
      "The products are grouped into books and games. Their totals are 30 and 35.",
    longDescription:
      "Grouping is useful when turning flat API data into sections, reports or summaries. Object.groupBy creates groups from a callback; a second pass can calculate a total for each group. This example uses local data and makes no API requests.",
    howItWorks: [
      {
        heading: "Return the group key",
        body: "Object.groupBy calls the callback for each product and puts it under the returned category. It requires a browser with Object.groupBy support.",
      },
      {
        heading: "Summarize each group",
        body: "Object.entries exposes each category and its products. reduce calculates the total without changing the original list.",
      },
    ],
    code: `const products = [
  { name: "Notebook", category: "books", price: 12 },
  { name: "Novel", category: "books", price: 18 },
  { name: "Puzzle", category: "games", price: 35 },
];

const groups = Object.groupBy(products, product => product.category);
console.log("Groups:", groups);

const totals = Object.fromEntries(
  Object.entries(groups).map(([category, items]) => [
    category,
    items.reduce((total, product) => total + product.price, 0),
  ])
);
console.log("Totals:", totals);`,
  },
  {
    slug: "zod-validation",
    title: "Validate data with Zod",
    description:
      "Try a real package: validate unknown data and inspect readable errors.",
    seoTitle: "Zod 4 Validation Playground — TypeScript safeParse Example",
    seoDescription:
      "Try Zod 4 safeParse in a live TypeScript playground. Edit a schema and its input, inspect validation issues, and infer a type without installing a project.",
    language: "typescript",
    tags: ["Zod", "npm", "Validation", "Data"],
    goal: "solve",
    featured: true,
    environment: `Zod ${ZOD_VERSION} · TypeScript`,
    tryThis:
      "Change the email to hello@example.com and the age to 21 to make validation succeed.",
    expectedResult:
      "The initial input fails email and minimum-age validation. Valid data produces a typed user object.",
    longDescription:
      "TypeScript types disappear at runtime. Data received from an API, a form or AI-generated code still needs validation. This example imports a specific Zod release and uses safeParse so expected validation errors are values rather than thrown exceptions.",
    howItWorks: [
      {
        heading: "Describe the runtime schema",
        body: "The schema checks an email string and an age of at least 18. z.infer derives a TypeScript type from those same rules.",
      },
      {
        heading: "Inspect both outcomes",
        body: "safeParse returns a discriminated union. Read result.data after success, or result.error.issues after failure. Changing the input reruns the code.",
      },
    ],
    code: `import { z } from "zod@${ZOD_VERSION}";

const User = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});
type User = z.infer<typeof User>;

const input: unknown = { email: "not-an-email", age: 16 };
const result = User.safeParse(input);

if (result.success) {
  const user: User = result.data;
  console.log("Valid user:", user);
} else {
  console.log("Validation issues:", result.error.issues);
}`,
  },
  {
    slug: "typescript-result",
    title: "Handle success and failure explicitly",
    description: "Check a typed Result pattern against real runtime inputs.",
    seoTitle: "TypeScript Result Type — Handle Success and Failure",
    seoDescription:
      "Run a TypeScript Result type example with a discriminated union. Change unknown input, inspect runtime validation, and narrow success and error values safely.",
    language: "typescript",
    tags: ["Types", "Validation", "Debugging", "AI code"],
    goal: "explore",
    tryThis:
      "Change input to 0, -5, or a string. Keep the runtime check even though the function has types.",
    expectedResult:
      "The positive input succeeds and logs a doubled value of 24. Other input types or non-positive numbers return a readable error.",
    longDescription:
      "A function signature does not guarantee that external input matches it. This small Result pattern makes runtime validation explicit and gives the caller a safe way to handle each outcome. It is useful when checking code copied from a response or generated by an assistant.",
    howItWorks: [
      {
        heading: "Validate unknown input",
        body: "The type unknown requires a check before arithmetic. The function rejects non-numbers, non-finite values and non-positive numbers.",
      },
      {
        heading: "Narrow by the discriminator",
        body: "Checking result.ok tells TypeScript which properties exist. The success branch has value; the failure branch has error.",
      },
    ],
    code: `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function doublePositive(input: unknown): Result<number> {
  if (typeof input !== "number" || !Number.isFinite(input) || input <= 0) {
    return { ok: false, error: "Expected a positive finite number" };
  }
  return { ok: true, value: input * 2 };
}

const input: unknown = 12;
const result = doublePositive(input);
if (result.ok === true) console.log("Doubled:", result.value);
else console.log("Rejected:", result.error);`,
  },
];

const optimisticCode = `import { useOptimistic, useState, useTransition } from "react";

export default function App() {
  const [likes, setLikes] = useState(0);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, value => value + 1);
  const [pending, startTransition] = useTransition();
  const delay = 1200;

  function like() {
    startTransition(async () => {
      addOptimisticLike();
      await new Promise(resolve => setTimeout(resolve, delay));
      setLikes(value => value + 1);
    });
  }

  return <main>
    <h1>Optimistic likes</h1>
    <p>The screen updates before this simulated save finishes.</p>
    <button onClick={like} disabled={pending}>♥ {optimisticLikes} likes</button>
    <p aria-live="polite">{pending ? "Saving…" : "Saved"}</p>
    <small>Confirmed likes: {likes}. No request is sent to a server.</small>
  </main>;
}`;

const actionCode = `import { useActionState } from "react";

export default function App() {
  const [message, submitAction, pending] = useActionState(async (_previous, formData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const name = String(formData.get("name") || "").trim();
    return name ? "Hello, " + name + "!" : "Please enter a name.";
  }, "Your result will appear here.");

  return <main>
    <h1>A form action</h1>
    <form action={submitAction}>
      <label>Your name <input name="name" placeholder="Ada" /></label>
      <p><button disabled={pending}>{pending ? "Submitting…" : "Say hello"}</button></p>
    </form>
    <p aria-live="polite">{message}</p>
    <small>This is a client-side action with a simulated delay.</small>
  </main>;
}`;

const reactExamples: Snippet[] = [
  {
    slug: "react-optimistic-ui",
    title: "Try optimistic UI in React",
    description:
      "Update a like button immediately while a simulated save is pending.",
    seoTitle: "React useOptimistic Playground — Optimistic UI Example",
    seoDescription:
      "Try React useOptimistic with a working like button. Change the simulated save delay, inspect pending state, and edit the component in a live React playground.",
    language: "javascript",
    code: optimisticCode,
    playground: {
      mode: "react",
      language: "javascript",
      code: optimisticCode,
      css: uiCss,
    },
    tags: ["React", "Hooks", "Async", "UI"],
    goal: "build",
    featured: true,
    environment: `React ${REACT_VERSION}`,
    tryThis:
      "Click the like button, then change delay to 2500 to make the optimistic and confirmed counts easier to compare.",
    expectedResult:
      "A click changes the visible like count immediately. The confirmed count updates after the delay and the Saving message disappears.",
    longDescription:
      "Optimistic UI shows the intended result while an action is still pending. This client-side example combines useOptimistic with a transition and a local delay. It sends no server requests and does not demonstrate server actions or persisted data.",
    howItWorks: [
      {
        heading: "Apply the optimistic update",
        body: "The transition starts an async action and adds a temporary like. useOptimistic renders that temporary value while the action is pending.",
      },
      {
        heading: "Commit the confirmed value",
        body: "After the simulated save, the state is updated. The confirmed value becomes the basis for the next optimistic action.",
      },
    ],
  },
  {
    slug: "react-form-actions",
    title: "Handle a React form action",
    description:
      "Submit a form with useActionState, pending feedback and a result.",
    seoTitle: "React useActionState Playground — Client Form Action",
    seoDescription:
      "Run a React useActionState form example in your browser. Edit the async action, test pending feedback, and return a result without setting up a server.",
    language: "javascript",
    code: actionCode,
    playground: {
      mode: "react",
      language: "javascript",
      code: actionCode,
      css: uiCss,
    },
    tags: ["React", "Hooks", "Forms", "Async"],
    goal: "build",
    environment: `React ${REACT_VERSION}`,
    tryThis:
      "Submit an empty name, then try your name. Change the returned greeting or the delay in the action.",
    expectedResult:
      "The button shows Submitting during the delay. Empty input returns a prompt; a name returns a greeting.",
    longDescription:
      "useActionState ties a form action to the state it returns and exposes whether it is pending. This example runs the action entirely in the browser. It is useful for trying the API before connecting it to a real backend.",
    howItWorks: [
      {
        heading: "Read submitted form data",
        body: "React passes FormData to the action. Reading the named input gives the value at the time of submission.",
      },
      {
        heading: "Return the next state",
        body: "The string returned by the async action becomes message. pending disables the submit button and exposes progress to the user.",
      },
    ],
  },
];

function webExample(
  value: Omit<Snippet, "language" | "code" | "playground"> & {
    html: string;
    css?: string;
    js: string;
  },
): Snippet {
  const { html, css = uiCss, js, ...content } = value;
  return {
    ...content,
    language: "javascript",
    code: js,
    playground: {
      mode: "web",
      language: "javascript",
      code: "",
      html,
      css,
      webJs: js,
    },
  };
}

const webExamples: Snippet[] = [
  webExample({
    slug: "vue-reactivity",
    title: "Explore Vue reactivity",
    description: "Try refs and computed values in a small Vue interface.",
    seoTitle: "Vue 3 Reactivity Playground — ref and computed Example",
    seoDescription:
      "Try Vue 3 ref and computed in a live browser playground. Edit a reactive counter and its derived value without installing a project or using a build step.",
    tags: ["Vue", "npm", "Reactivity", "UI"],
    goal: "build",
    featured: true,
    environment: `Vue ${VUE_VERSION} · browser ESM`,
    tryThis:
      "Click Add one, then change the computed multiplier from 2 to 3 in JavaScript.",
    expectedResult:
      "The counter and its computed double update together. Editing the multiplier changes the derived value.",
    longDescription:
      "Vue can power a small browser interface without a local project. This example uses its render function API, refs and computed values. It loads an explicit Vue version from npm and does not require a single-file component compiler.",
    howItWorks: [
      {
        heading: "Store a reactive value",
        body: "ref stores the count. Event handlers change count.value and Vue rerenders the parts that read it.",
      },
      {
        heading: "Derive a value",
        body: "computed tracks count and recalculates the derived value when it changes. h creates the preview elements directly.",
      },
    ],
    html: '<div id="demo"></div>',
    js: `import { createApp, h, ref, computed } from "vue@${VUE_VERSION}";

createApp({
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);
    return () => h("main", [
      h("h1", "Vue reactivity"),
      h("p", "Count: " + count.value + " · Double: " + doubled.value),
      h("button", { onClick: () => count.value++ }, "Add one"),
    ]);
  },
}).mount("#demo");`,
  }),
  webExample({
    slug: "debounce-search",
    title: "See debounce while you type",
    description:
      "Compare raw input events with delayed work in a live search box.",
    seoTitle: "JavaScript Debounce Search — Interactive Input Example",
    seoDescription:
      "Type into a working debounce search example. Compare input events with delayed updates, change the wait time, and edit the HTML, CSS and JavaScript live.",
    tags: ["Forms", "Async", "Events", "UI"],
    goal: "build",
    environment: "Browser · HTML / CSS / JavaScript",
    tryThis:
      "Type a few letters quickly. Then change wait to 1000 and compare the two counters.",
    expectedResult:
      "Every input updates the first counter. The delayed counter updates only after you stop typing for 400 milliseconds.",
    longDescription:
      "Debounce waits for a quiet interval before doing work. A search field is a useful way to see the difference between every keystroke and the work you choose to perform. This demo updates local text instead of calling an API.",
    howItWorks: [
      {
        heading: "Cancel the previous timer",
        body: "Each input event clears the earlier timeout and starts another one. Rapid input keeps postponing the delayed update.",
      },
      {
        heading: "Run after a pause",
        body: "When no new input arrives during wait, the callback updates the delayed result and its counter.",
      },
    ],
    html: '<main><h1>Debounce a search</h1><label>Search <input id="search" placeholder="Start typing…" /></label><p>Input events: <output id="raw">0</output></p><p>Delayed updates: <output id="delayed">0</output></p><p aria-live="polite">Result: <strong id="result">Waiting for input</strong></p></main>',
    js: `const wait = 400;
let timer;
let inputs = 0;
let updates = 0;
const search = document.querySelector("#search");
search.addEventListener("input", () => {
  document.querySelector("#raw").textContent = String(++inputs);
  clearTimeout(timer);
  timer = setTimeout(() => {
    document.querySelector("#delayed").textContent = String(++updates);
    document.querySelector("#result").textContent = search.value || "Empty search";
  }, wait);
});`,
  }),
  webExample({
    slug: "css-container-queries",
    title: "Make a card respond to its container",
    description:
      "Resize one component and see a CSS container query switch its layout.",
    seoTitle: "CSS Container Queries Playground — Responsive Card Example",
    seoDescription:
      "Try CSS container queries with a resizable card. Adjust the container width, edit the breakpoint, and see the component change layout in a live preview.",
    tags: ["CSS", "Responsive", "UI"],
    goal: "build",
    environment: "Modern browser · CSS container queries",
    tryThis:
      "Move the width slider. Change the 380px breakpoint in CSS to control when the card stacks.",
    expectedResult:
      "A wide card uses two columns. Below 380px it stacks its illustration and text, independently of the full page width.",
    longDescription:
      "Container queries let a component adapt to the space given to it. That is useful when the same card appears in a wide content area and a narrow sidebar. The slider changes the component container rather than the browser viewport.",
    howItWorks: [
      {
        heading: "Create a query container",
        body: "container-type: inline-size makes the wrapper's width available to descendant container queries.",
      },
      {
        heading: "Change the component layout",
        body: "The @container rule changes the inner card's grid when its wrapper is narrower than 380px.",
      },
    ],
    html: '<main><h1>A card that fits</h1><label>Container width <input id="width" type="range" min="240" max="600" value="500" /></label><div class="frame"><article class="card"><div class="art" aria-hidden="true">✦</div><div><h2>Built for its space</h2><p>This card responds to its container.</p></div></article></div></main>',
    css:
      uiCss +
      "\n.frame { container-type: inline-size; width: 500px; max-width: 100%; margin-top: 20px; }\n.card { display: grid; grid-template-columns: 110px 1fr; gap: 18px; align-items: center; padding: 18px; border: 1px solid #ccc; border-radius: 12px; background: white; }\n.art { display: grid; place-items: center; min-height: 100px; border-radius: 8px; background: #f0d000; font-size: 40px; }\nh2 { font-size: 18px; margin: 0; }\n@container (max-width: 380px) { .card { grid-template-columns: 1fr; } }",
    js: 'document.querySelector("#width").addEventListener("input", event => {\n  document.querySelector(".frame").style.width = event.target.value + "px";\n});',
  }),
  webExample({
    slug: "canvas-drawing",
    title: "Draw with the Canvas API",
    description:
      "A small drawing surface with pointer input and an editable brush.",
    seoTitle: "HTML Canvas Drawing Playground — Pointer Events Example",
    seoDescription:
      "Draw on an HTML canvas with mouse or touch. Edit the brush size and color, inspect pointer events, and run the complete HTML, CSS and JavaScript example.",
    tags: ["Canvas", "Web APIs", "Creative", "Events"],
    goal: "build",
    environment: "Browser · Canvas 2D / Pointer Events",
    tryThis:
      "Draw in the preview. Change lineWidth or strokeStyle in JavaScript to change the brush.",
    expectedResult:
      "Dragging a mouse, pen or finger draws a continuous line. Clear resets the canvas.",
    longDescription:
      "The Canvas 2D API provides a drawing surface for tools, games and visual experiments. Pointer events give mouse, touch and pen input a shared interface. This small example keeps the drawing entirely in the preview and does not upload it.",
    howItWorks: [
      {
        heading: "Start and continue a path",
        body: "pointerdown starts a path; pointermove extends and strokes it while the pointer is pressed. Pointer capture keeps the gesture connected when it leaves the canvas.",
      },
      {
        heading: "Map the pointer to the canvas",
        body: "The coordinates are scaled from the displayed rectangle into canvas pixels. touch-action: none lets drawing gestures stay on the canvas.",
      },
    ],
    html: '<main><h1>A tiny drawing pad</h1><p>Drag to draw. Try a mouse, pen or finger.</p><canvas width="600" height="280" aria-label="Drawing surface"></canvas><p><button id="clear">Clear drawing</button></p></main>',
    css:
      uiCss +
      "\ncanvas { display: block; width: 100%; max-width: 600px; border: 1px solid #aaa; border-radius: 10px; background: white; touch-action: none; }",
    js: `const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = "#5b48d6";
let drawing = false;
function point(event) {
  const box = canvas.getBoundingClientRect();
  return [(event.clientX - box.left) * canvas.width / box.width,
    (event.clientY - box.top) * canvas.height / box.height];
}
canvas.addEventListener("pointerdown", event => {
  drawing = true;
  canvas.setPointerCapture(event.pointerId);
  ctx.beginPath();
  ctx.moveTo(...point(event));
});
canvas.addEventListener("pointermove", event => {
  if (!drawing) return;
  ctx.lineTo(...point(event));
  ctx.stroke();
});
for (const type of ["pointerup", "pointercancel"]) {
  canvas.addEventListener(type, () => { drawing = false; });
}
document.querySelector("#clear").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});`,
  }),
];

export const NEW_EXAMPLE_CATEGORIES: SnippetCategory[] = [
  { name: "Everyday tasks & packages", snippets: dataExamples },
  { name: "React", snippets: reactExamples },
  { name: "Web & creative", snippets: webExamples },
];
