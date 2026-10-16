import { getPageSeo } from "../../data/seo";

/** Initial editor geometry; no user code or temporary marketing screen. */
export function PlaygroundLoading({ path }: { path: string }) {
  const seo = getPageSeo(path);
  const embed = path === "/embed";
  const preview = path === "/web" || path === "/react";
  return (
    <main
      class="startup"
      data-startup-embed={embed ? "true" : undefined}
      aria-label={seo.heading}
      aria-busy="true"
    >
      <h1 class="sr-only">{seo.heading}</h1>
      <p id="startup-status" class="sr-only" role="status">
        Loading editor…
      </p>
      <div id="startup-skeleton" class="startup__skeleton" aria-hidden="true">
        {!embed && (
          <header class="startup__toolbar">
            <div class="startup__modes">
              <span>JS</span>
              <span>TS</span>
              <span>Web</span>
            </div>
            <div class="startup__tools">
              <i />
              <i />
            </div>
          </header>
        )}
        {!embed && preview && (
          <div class="startup__submodes">
            <i />
            <i />
          </div>
        )}
        {!embed && (
          <div class="startup__mobile-tabs">
            <span>Editor</span>
            <span>{preview ? "Preview" : "Console"}</span>
          </div>
        )}
        <div class="startup__panes">
          <section class="startup__editor">
            <div class="startup__pane-head">
              <span>{preview ? "Editor" : "Code"}</span>
              <i />
            </div>
            <div class="startup__lines">
              {[48, 32, 62, 42, 55].map((width, index) => (
                <div
                  key={index}
                  class="startup__line"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </section>
          <section class="startup__output">
            <div class="startup__pane-head">
              <span>{preview ? "Preview" : "Console"}</span>
            </div>
          </section>
        </div>
        <footer class="startup__footer">
          <i />
          <i />
          <i />
        </footer>
      </div>
      <section id="startup-error" class="startup__error" role="alert" hidden>
        <h2>The editor could not load</h2>
        <p>Check your connection and reload the page to try again.</p>
        <button id="startup-reload" type="button">
          Reload editor
        </button>
      </section>
      <noscript>
        <style>{"#startup-skeleton, #startup-status { display: none; }"}</style>
        <section class="startup__noscript">
          <h2>Enable JavaScript to use the playground</h2>
          <p>{seo.description}</p>
          <p>
            JavaScript is required to edit and run code. You can still read
            about TryJS or browse the examples.
          </p>
          <nav aria-label="TryJS pages">
            <a href="/">JavaScript / TypeScript</a>
            <a href="/web">Web</a>
            <a href="/react">React</a>
            <a href="/features">Features</a>
            <a href="/snippets">Examples</a>
          </nav>
        </section>
      </noscript>
    </main>
  );
}
