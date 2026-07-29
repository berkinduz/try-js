import { useEffect } from "preact/hooks";
import {
  trackProInterest,
  trackProLandingView,
} from "../../utils/analytics";
import { EDUCATOR_FEEDBACK_URL } from "../../utils/pro-demand";
import { encodeToHash } from "../../utils/share";
import { applySeo } from "../../utils/seo";
import "./ForTeachersPage.css";

const PROPOSALS = [
  {
    title: "Organized library",
    description:
      "Saved examples stay in one place, ready to reuse across lessons, courses, articles, and docs.",
  },
  {
    title: "Private examples",
    description:
      "Share drafts and course material with the people you choose before publishing them more widely.",
  },
  {
    title: "Your branding",
    description:
      "Present runnable examples with your course, school, publication, or documentation identity.",
  },
];

const LESSON_EXAMPLE_CODE = `const scores = [72, 91, 84, 63];
const passing = scores.filter((score) => score >= 80);

console.log("Passing scores:", passing);`;

const LESSON_EXAMPLE_URL = `/${encodeToHash({
  code: LESSON_EXAMPLE_CODE,
  language: "javascript",
})}`;

export function ForTeachersPage() {
  useEffect(() => {
    trackProLandingView();
    return applySeo({
      title: "TryJS for Teachers & Technical Authors — Pro Concept",
      description:
        "Create a shareable JavaScript or TypeScript example, place it in a lesson or article, and let learners edit and run it without setup.",
      canonical: "https://tryjs.app/for-teachers",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "TryJS for Teachers and Technical Authors",
          description:
            "A free runnable-example workflow and a demand test for possible organized, private, and branded examples.",
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
            <p class="teachers-eyebrow">For teachers and technical authors</p>
            <h1>Turn one code example into a runnable lesson.</h1>
            <p class="teachers-lede">
              Create a JavaScript or TypeScript example once. Share a link or
              embed it in your LMS, lesson, article, or docs. Learners open it
              without setup, change the code, and run it in their browser.
            </p>
            <div class="teachers-actions">
              <a class="teachers-btn teachers-btn--primary" href={LESSON_EXAMPLE_URL}>
                Open the working learner example
              </a>
              <a
                class="teachers-btn"
                href={EDUCATOR_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackProInterest("for_teachers_page", "willingness_to_pay")
                }
              >
                Tell us what you would pay for (opens GitHub)
              </a>
            </div>
            <p class="teachers-transparency">
              JavaScript and TypeScript share links and embeds work free today.
              Web and React playgrounds are free for editing and previewing, but
              do not have share or embed controls yet. Pro is only a concept test,
              and its proposed capabilities are not available. The feedback link
              opens a public, editable GitHub issue and requires a GitHub account.
              No payment, subscription, or private form is involved.
            </p>
          </div>

          <aside class="teachers-flow" aria-label="Teacher to learner workflow">
            <p class="teachers-flow__label">A real three-step workflow</p>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Create</strong>
                  <p>Write a focused JavaScript or TypeScript example.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Share or embed</strong>
                  <p>Place the link or iframe in a lesson, LMS, article, or docs.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Edit, run, and reset</strong>
                  <p>
                    Learners experiment without setup, then reopen the original
                    link to reset.
                  </p>
                </div>
              </li>
            </ol>
          </aside>
        </header>

        <section class="teachers-free" aria-labelledby="free-title">
          <div class="teachers-section-head">
            <p class="teachers-eyebrow">Works free today</p>
            <h2 id="free-title">Shareable JavaScript and TypeScript lessons.</h2>
            <p>
              Shared links carry the code, so readers can start from your exact
              example without an account or local setup. Reopening the original
              link restores your starting point. Web and React playgrounds remain
              free for editing and live preview.
            </p>
          </div>
          <div class="teachers-example">
            <div>
              <p class="teachers-example__label">Working lesson example</p>
              <h3>Change the passing score</h3>
              <p>
                Ask learners to change <code>80</code>, run the code, and explain
                which values remain. The linked playground is the actual learner view.
              </p>
              <a class="teachers-btn teachers-btn--primary" href={LESSON_EXAMPLE_URL}>
                Open the working learner example
              </a>
            </div>
            <pre aria-label="Working JavaScript lesson example"><code>{LESSON_EXAMPLE_CODE}</code></pre>
          </div>
        </section>

        <section class="teachers-proposal" aria-labelledby="proposal-title">
          <div class="teachers-section-head">
            <p class="teachers-eyebrow">Pro concept · nothing to buy yet</p>
            <h2 id="proposal-title">Pro ideas we are testing</h2>
            <p>
              These are hypotheses for teachers and technical authors, not student
              features or product promises. Each one is unavailable today.
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
            <p class="teachers-eyebrow">Teachers and authors only</p>
            <h2 id="teachers-close-title">Which workflow would be worth paying for?</h2>
            <p>
              Describe what you publish, how you share examples now, and whether an
              organized library, private examples, or branding would earn your budget.
              Your response is public on GitHub.
            </p>
          </div>
          <a
            class="teachers-btn teachers-btn--primary"
            href={EDUCATOR_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackProInterest("for_teachers_page", "willingness_to_pay")
            }
          >
            Describe your workflow (opens GitHub)
          </a>
        </section>
      </div>
    </main>
  );
}
