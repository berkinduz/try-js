import { useEffect } from "preact/hooks";
import {
  trackProInterest,
  trackProLandingView,
} from "../../utils/analytics";
import { EARLY_ACCESS_URL } from "../../utils/pro-demand";
import { applySeo } from "../../utils/seo";
import "./ForTeachersPage.css";

const PROPOSALS = [
  {
    title: "Saved examples",
    description:
      "Keep a stable library of examples instead of rebuilding links for every lesson or article.",
  },
  {
    title: "Private examples",
    description:
      "Share drafts and course material with the people you choose before publishing them more widely.",
  },
  {
    title: "Custom branding",
    description:
      "Present runnable examples with your course, school, publication, or documentation identity.",
  },
];

export function ForTeachersPage() {
  useEffect(() => {
    trackProLandingView();
    return applySeo({
      title: "TryJS for Teachers & Technical Authors — Pro Concept",
      description:
        "Help shape a possible TryJS Pro for teachers and technical authors who share runnable frontend examples.",
      canonical: "https://tryjs.app/for-teachers",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "TryJS for Teachers and Technical Authors",
          description:
            "A demand test for possible saved, private, and custom-branded runnable examples.",
          url: "https://tryjs.app/for-teachers",
          isPartOf: {
            "@type": "WebSite",
            name: "TryJS",
            url: "https://tryjs.app/",
          },
        },
      ],
      jsonLdId: "for-teachers-page-schema",
    });
  }, []);

  return (
    <main class="teachers-page">
      <div class="teachers-shell">
        <nav class="teachers-nav" aria-label="Teacher page navigation">
          <a class="teachers-brand" href="/">
            <span>JS</span>
            TryJS
          </a>
          <a class="teachers-nav__link" href="/web">
            Open Web Playground
          </a>
        </nav>

        <header class="teachers-hero">
          <div class="teachers-hero__copy">
            <p class="teachers-eyebrow">TryJS Pro · concept test</p>
            <h1>Teach and publish with runnable frontend examples.</h1>
            <p class="teachers-lede">
              TryJS already lets anyone experiment with HTML, CSS, JavaScript,
              and React in the browser. We are exploring whether teachers and
              technical authors need a more durable way to organize and present
              those examples.
            </p>
            <div class="teachers-actions">
              <a
                class="teachers-btn teachers-btn--primary"
                href={EARLY_ACCESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackProInterest("for_teachers_page", "early_access")
                }
              >
                Request early access
              </a>
              <a class="teachers-btn" href="/web">
                Try the free playground
              </a>
            </div>
            <p class="teachers-transparency">
              This is a demand test, not a product launch. The proposed Pro
              capabilities are not available yet. The request opens a public,
              editable GitHub issue; a GitHub account is required to submit it.
              No payment, subscription, or private form is involved.
            </p>
          </div>

          <aside class="teachers-preview" aria-label="Possible TryJS Pro workflow">
            <div class="teachers-preview__bar">
              <span />
              <span />
              <span />
              <code>lesson/forms/validation</code>
            </div>
            <div class="teachers-preview__body">
              <p class="teachers-preview__label">RUNNABLE EXAMPLE</p>
              <pre aria-label="Example frontend code"><code>{`<form id="signup">
  <input type="email" required />
  <button>Try it</button>
</form>`}</code></pre>
              <div class="teachers-preview__result">
                <span>Preview</span>
                <span class="teachers-preview__button" aria-hidden>Try it</span>
              </div>
            </div>
          </aside>
        </header>

        <section class="teachers-proposal" aria-labelledby="proposal-title">
          <div class="teachers-section-head">
            <p class="teachers-eyebrow">What we are testing</p>
            <h2 id="proposal-title">Three possible Pro capabilities</h2>
            <p>
              These are hypotheses, not promises. Your request helps decide
              whether any of them should be built.
            </p>
          </div>
          <div class="teachers-grid">
            {PROPOSALS.map((proposal, index) => (
              <article class="teachers-card" key={proposal.title}>
                <span class="teachers-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{proposal.title}</h3>
                <p>{proposal.description}</p>
                <span class="teachers-card__status">Exploring · not available yet</span>
              </article>
            ))}
          </div>
        </section>

        <section class="teachers-close" aria-labelledby="teachers-close-title">
          <div>
            <p class="teachers-eyebrow">Shape the decision</p>
            <h2 id="teachers-close-title">Would this remove real publishing friction?</h2>
            <p>
              Tell us what you teach or publish and which capability matters.
              We will use that signal to build, revise, or stop this idea.
            </p>
          </div>
          <a
            class="teachers-btn teachers-btn--primary"
            href={EARLY_ACCESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackProInterest("for_teachers_page", "early_access")
            }
          >
            Share your use case
          </a>
        </section>
      </div>
    </main>
  );
}
