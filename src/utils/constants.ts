export const DEFAULT_JS_CODE = "";

export const DEFAULT_TS_CODE = "";

export const DEFAULT_WEB_HTML = "";
export const DEFAULT_WEB_CSS = "";
export const DEFAULT_WEB_JS = "";

export const DEFAULT_REACT_CODE = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>React Playground</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
`;

export const AUTO_RUN_DELAY = 500;
export const EXECUTION_TIMEOUT = 5000;
export const MODULE_EXECUTION_TIMEOUT = 15000;
export const MIN_PANE_SIZE = 200;
export const DEFAULT_SPLIT_RATIO = 0.55;
export const MOBILE_BREAKPOINT = 768;
