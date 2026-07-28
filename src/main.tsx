import { render } from "preact";
import { inject } from "@vercel/analytics";
import { App } from "./app";
import { initializeAnalytics } from "./utils/analytics";
import "./index.css";

inject();
initializeAnalytics();
render(<App />, document.getElementById("app")!);
