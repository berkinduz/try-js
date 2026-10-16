import { render } from "preact";
import { inject } from "@vercel/analytics";
import { getPageSeo, normalizePath } from "./data/seo";
import { applySeo } from "./utils/seo";
import { initializeAnalytics } from "./utils/analytics";
import "./index.css";

inject();
initializeAnalytics();

async function mountPage() {
  const path = normalizePath(window.location.pathname);
  const seo = getPageSeo(path);
  applySeo(seo);
  const root = document.getElementById("app")!;
  // Informational pages keep their prerendered content while their small UI loads.
  // They never initialize editors, code execution or the TypeScript worker.
  if (seo.status === 404) {
    const { NotFoundPage } = await import("./components/NotFoundPage");
    render(<NotFoundPage />, root);
  } else if (path === "/features") {
    const { FeaturesPage } = await import("./components/Features/FeaturesPage");
    render(<FeaturesPage />, root);
  } else if (path === "/snippets") {
    const { SnippetsPage } = await import("./components/Snippets/SnippetsPage");
    render(<SnippetsPage />, root);
  } else if (path.startsWith("/snippets/")) {
    const { SnippetDetailPage } =
      await import("./components/Snippets/SnippetDetailPage");
    render(<SnippetDetailPage slug={path.slice("/snippets/".length)} />, root);
  } else {
    const { App } = await import("./app");
    render(<App />, root);
  }
}

void mountPage();
