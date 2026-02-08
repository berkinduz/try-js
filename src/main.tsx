import { render } from "preact";
import { inject } from "@vercel/analytics";
import { App } from "./app";
import "./index.css";

inject();
render(<App />, document.getElementById("app")!);
