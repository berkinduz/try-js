import { useEffect } from "preact/hooks";
import { getAllExamples } from "../../data/examples";
import { getPageSeo } from "../../data/seo";
import { trackEvent } from "../../utils/analytics";
import { ExampleCard } from "./ExampleCard";
import { ExampleSearch, useExampleSearch } from "./ExampleSearch";
import { ExamplesLayout } from "./ExamplesLayout";
import "./SnippetsPage.css";

export function SnippetsPage() {
  const search = useExampleSearch();
  useEffect(() => {
    trackEvent("snippets_index_view");
  }, []);
  return (
    <ExamplesLayout>
      <section class="examples-hero" aria-labelledby="examples-title">
        <p class="examples-eyebrow">
          THE EXAMPLE LIBRARY <span>•</span> {getAllExamples().length} things to
          try
        </p>
        <h1 id="examples-title">{getPageSeo("/snippets").heading}</h1>
        <p>
          Explore a package. Understand a behavior. Build something small.
          <br class="examples-desktop-break" /> Working JavaScript, TypeScript,
          React and Web examples, ready to make your own.
        </p>
        <div class="examples-hero-note">
          <span aria-hidden="true">+</span> Edit the code. See what changes. No
          setup or account.
        </div>
      </section>
      <section aria-label="Browse examples">
        <ExampleSearch search={search} />
        <noscript>
          <p>
            Browse all examples below. Enable JavaScript to search, filter and
            use the live editors.
          </p>
        </noscript>
        {search.results.length > 0 ? (
          <div class="examples-grid">
            {search.results.map((example) => (
              <ExampleCard key={example.slug} example={example} />
            ))}
          </div>
        ) : (
          <div class="examples-empty">
            <h2>No examples found</h2>
            <p>
              Try a task such as “group”, a package such as “Zod”, or a
              technology such as “Vue”.
            </p>
            <button
              class="examples-button"
              type="button"
              onClick={search.reset}
            >
              Show all examples
            </button>
          </div>
        )}
      </section>
    </ExamplesLayout>
  );
}
