export const DEFAULT_JS_CODE = "";

export const DEFAULT_TS_CODE = "";

export const DEFAULT_WEB_HTML = "";
export const DEFAULT_WEB_CSS = "";
export const DEFAULT_WEB_JS = "";

export const DEFAULT_REACT_CODE = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>React Playground</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
`;

export const DEFAULT_REACT_CSS = `.container {
  font-family: system-ui, sans-serif;
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
}

button:hover {
  background: #e5e5e5;
}
`;

export const AUTO_RUN_DELAY = 500;
export const EXECUTION_TIMEOUT = 5000;
export const MODULE_EXECUTION_TIMEOUT = 15000;
export const MIN_PANE_SIZE = 200;
export const DEFAULT_SPLIT_RATIO = 0.55;
export const MOBILE_BREAKPOINT = 768;
