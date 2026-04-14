import { useEffect, useRef, useState } from "preact/hooks";
import { trackEvent } from "../../utils/analytics";
import "./FeedbackButton.css";

const FEATURE_URL =
  "https://github.com/berkinduz/try-js/issues/new?template=feature_request.md&labels=feature+request";
const BUG_URL =
  "https://github.com/berkinduz/try-js/issues/new?template=bug_report.md&labels=bug";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) trackEvent("feedback_open");
  };

  const handleFeature = () => {
    trackEvent("feedback_feature_click");
    setOpen(false);
  };

  const handleBug = () => {
    trackEvent("feedback_bug_click");
    setOpen(false);
  };

  return (
    <div class="feedback-wrap" ref={ref}>
      {open && (
        <div class="feedback-menu" role="menu" aria-label="Send feedback">
          <p class="feedback-menu__title">What would you like to share?</p>
          <a
            class="feedback-menu__item"
            href={FEATURE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleFeature}
            role="menuitem"
          >
            <span class="feedback-menu__icon" aria-hidden>
              💡
            </span>
            <span>
              <strong>Request a feature</strong>
              <br />
              <span class="feedback-menu__sub">
                Missing something you need? Tell us.
              </span>
            </span>
          </a>
          <a
            class="feedback-menu__item"
            href={BUG_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBug}
            role="menuitem"
          >
            <span class="feedback-menu__icon" aria-hidden>
              🐞
            </span>
            <span>
              <strong>Report a bug</strong>
              <br />
              <span class="feedback-menu__sub">
                Something broken? Let us know.
              </span>
            </span>
          </a>
          <p class="feedback-menu__hint">
            Opens a GitHub issue — takes 30 seconds.
          </p>
        </div>
      )}
      <button
        type="button"
        class={`feedback-btn ${open ? "feedback-btn--open" : ""}`}
        onClick={toggle}
        aria-label="Send feedback"
        aria-expanded={open}
        title="Send feedback"
      >
        <span aria-hidden>💬</span>
        <span class="feedback-btn__label">Feedback</span>
      </button>
    </div>
  );
}
