import type { ComponentChildren } from "preact";
import { trackSupportClick } from "../../utils/analytics";
import { ExternalArrow } from "./ExternalArrow";

export const SUPPORT_URL = "https://buymeacoffee.com/berkinduz";

export function ExamplesLayout({
  children,
  detail = false,
}: {
  children: ComponentChildren;
  detail?: boolean;
}) {
  return (
    <main class="snippets-page examples-page">
      <div class="examples-shell">
        <header class="examples-header">
          <a class="examples-brand" href="/" aria-label="TryJS home">
            <span aria-hidden="true">JS</span>TryJS
          </a>
          <nav aria-label="Main navigation">
            <a href="/snippets" aria-current={!detail ? "page" : undefined}>
              Examples
            </a>
            <a href="/features">Features</a>
            <a class="examples-open" href="/">
              Open playground <ExternalArrow />
            </a>
          </nav>
        </header>
        {children}
        <footer class="examples-footer">
          <p>
            A small place to try things. Built by{" "}
            <a
              href="https://github.com/berkinduz"
              target="_blank"
              rel="noopener noreferrer"
            >
              berkinduz
            </a>
            .
          </p>
          <nav aria-label="Footer navigation">
            <a href="/">JavaScript / TypeScript</a>
            <a href="/web">Web</a>
            <a href="/react">React</a>
            <a
              href="https://github.com/berkinduz/try-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {!detail && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSupportClick("examples")}
              >
                Support TryJS <ExternalArrow />
              </a>
            )}
          </nav>
        </footer>
      </div>
    </main>
  );
}
