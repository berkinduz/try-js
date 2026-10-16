import "./Snippets/SnippetsPage.css";

export function NotFoundPage() {
  return (
    <main class="snippets-page">
      <div class="snippets-shell">
        <header class="snippets-head">
          <p class="snippets-eyebrow">404 · tryjs.app</p>
          <h1>Page not found</h1>
          <p>
            This address does not match a TryJS page. Open the playground to try
            some code, or browse a working example.
          </p>
          <nav class="snippets-nav" aria-label="TryJS pages">
            <a class="snippets-btn snippets-btn--primary" href="/">
              Open Playground
            </a>
            <a class="snippets-btn" href="/snippets">
              Browse Examples
            </a>
          </nav>
        </header>
      </div>
    </main>
  );
}
