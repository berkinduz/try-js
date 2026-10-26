import type { PlaygroundState } from "../utils/playground.ts";
import type { FeatureDemoId } from "../utils/feature-demo-context.ts";

type FeatureDemo = {
  badge: string;
  instruction: string;
  state: PlaygroundState;
};

export const FEATURE_DEMOS: Record<FeatureDemoId, FeatureDemo> = {
  "check-code": {
    badge: "JS",
    instruction: "Try tipPercent: 10 → 20. Watch the total change.",
    state: {
      mode: "js", language: "javascript",
      code: 'const price = 40;\nconst tipPercent = 10;\n\nconst tip = price\n  * tipPercent / 100;\nconst total = price + tip;\nconsole.log(total);',
    },
  },
  "react-state": {
    badge: "React",
    instruction: "Click Add one. Then try + 2 in the code.",
    state: {
      mode: "react", language: "javascript",
      code: 'import { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Add one\n      </button>\n    </main>\n  );\n}',
      css: 'body { margin: 0; background: #252524; color: #efefea; font: 16px system-ui, sans-serif; }\nmain { padding: 28px; }\np { font-size: 28px; margin: 0 0 18px; }\nbutton { border: 0; border-radius: 5px; padding: 10px 18px; background: #f0d000; color: #252524; font: inherit; cursor: pointer; }',
    },
  },
  "share-repro": {
    badge: "Bug",
    instruction: "Click the error's location. Share → Copy link.",
    state: {
      mode: "js", language: "javascript",
      code: 'function firstName(people) {\n  return people[0].name;\n}\n\nconsole.log(firstName([]));',
    },
  },
};
