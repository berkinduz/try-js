import { useEffect, useState } from "preact/hooks";
import {
  exampleSources,
  findExample,
  relatedExamples,
} from "../../data/examples";
import {
  trackEvent,
  trackExampleActivity,
  trackSupportClick,
} from "../../utils/analytics";
import { ExampleCard } from "./ExampleCard";
import { ExamplesLayout, SUPPORT_URL } from "./ExamplesLayout";
import { LiveExample } from "./LiveExample";
import { ExternalArrow } from "./ExternalArrow";
import "./SnippetsPage.css";

export function SnippetDetailPage({ slug }: { slug: string }) {
  const example = findExample(slug);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    if (!example) return;
    trackEvent("snippet_detail_view", { slug, language: example.language });
    trackExampleActivity("viewed", slug, "inline");
  }, [slug]);
  if (!example)
    return (
      <ExamplesLayout detail>
        <section class="examples-hero">
          <h1>Example not found</h1>
          <p>
            <a href="/snippets">Browse all examples</a> or{" "}
            <a href="/">open the playground</a>.
          </p>
        </section>
      </ExamplesLayout>
    );
  const related = relatedExamples(example);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/snippets/${example.slug}`,
      );
      setCopyStatus("Example link copied");
      trackExampleActivity("shared", example.slug, "inline");
    } catch {
      setCopyStatus("Copy this page’s address to share the example.");
    }
  };
  return (
    <ExamplesLayout detail>
      <nav class="example-breadcrumb" aria-label="Breadcrumb">
        <a href="/snippets">← All examples</a>
        <span>{example.technology}</span>
      </nav>
      <article>
        <header class="example-heading">
          <div class="example-heading__meta">
            <span>{example.environment}</span>
            {example.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h1>{example.seoTitle}</h1>
          <p>{example.description}</p>
          <div class="example-heading__actions">
            <button
              type="button"
              class="examples-text-button"
              onClick={copyLink}
            >
              Copy example link
            </button>
            <span role="status">{copyStatus}</span>
          </div>
        </header>
        <aside class="example-challenge" aria-label="Something to try">
          <strong>Try this</strong>
          <p>{example.tryThis}</p>
        </aside>
        <LiveExample key={example.slug} example={example} />
        <div class="example-after-run">
          <p>Useful? Help keep TryJS free and independent.</p>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSupportClick("example", example.slug)}
          >
            Support TryJS <ExternalArrow />
          </a>
        </div>
        <div class="example-explanation">
          <section>
            <h2>What to expect</h2>
            <p>{example.expectedResult}</p>
          </section>
          {example.longDescription && (
            <section>
              <h2>About this example</h2>
              <p>{example.longDescription}</p>
            </section>
          )}
          <section>
            <h2>How It Works</h2>
            {example.howItWorks?.map((section) => (
              <div key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </div>
            ))}
          </section>
          {example.commonMistakes?.length ? (
            <section>
              <h2>Things to watch for</h2>
              <ul>
                {example.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {example.whenToUse && (
            <section>
              <h2>When to use it</h2>
              <p>{example.whenToUse}</p>
            </section>
          )}
          <details class="example-source">
            <summary>Read the original source</summary>
            <p>
              This is the starting code. Your edits stay in the live editor
              above.
            </p>
            {exampleSources(example).map((source) => (
              <div key={source.label}>
                <h3>{source.label}</h3>
                <pre>
                  <code>{source.code}</code>
                </pre>
              </div>
            ))}
          </details>
          {example.faq?.length ? (
            <section class="example-faq">
              <h2>Questions about this example</h2>
              {example.faq.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          ) : null}
        </div>
      </article>
      <section class="example-related" aria-labelledby="related-title">
        <div>
          <h2 id="related-title">Keep exploring</h2>
          <a href="/snippets">All examples →</a>
        </div>
        <div class="examples-grid">
          {related.map((item) => (
            <ExampleCard key={item.slug} example={item} heading={3} />
          ))}
        </div>
      </section>
    </ExamplesLayout>
  );
}
