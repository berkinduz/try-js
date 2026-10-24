import { signal } from "@preact/signals";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { currentSurface } from "../../state/editor";
import {
  trackUsageIntentSelected,
  trackUsageQuestionOpened,
  trackUsageQuestionViewed,
} from "../../utils/analytics";
import { isUsageIntent } from "../../utils/analytics-policy";
import type { UsageIntent } from "../../utils/analytics-policy";
import { readSession, writeSession } from "../../utils/storage";
import { showToast } from "../Toast/Toast";
import "./UsageFeedback.css";

const FEEDBACK_KEY = "tryjs:usage-feedback:v1";
const previousAnswer = readSession(FEEDBACK_KEY);
const hidden = signal(previousAnswer === "skipped" || isUsageIntent(previousAnswer));
const OPTIONS: { intent: UsageIntent; label: string }[] = [
  { intent: "check_snippet", label: "Check a code snippet" },
  { intent: "learn_js_ts", label: "Learn JavaScript / TypeScript" },
  { intent: "try_web_ui", label: "Try a small web interface" },
  { intent: "other", label: "Something else" },
];

function focusEditor() {
  const editor = Array.from(document.querySelectorAll<HTMLElement>(".cm-content"))
    .find((element) => element.getClientRects().length > 0);
  editor?.focus({ preventScroll: true });
}

export function UsageFeedback() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const isHidden = hidden.value;
  const surface = currentSurface.value;

  useEffect(() => {
    const button = triggerRef.current;
    if (isHidden || !button) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackUsageQuestionViewed(surface);
      observer.disconnect();
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [isHidden, surface]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", onKeyDown);
    firstOptionRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const finish = (intent: UsageIntent | "skipped") => {
    if (hidden.value) return;
    if (intent !== "skipped") trackUsageIntentSelected(currentSurface.value, intent);
    writeSession(FEEDBACK_KEY, intent);
    setOpen(false);
    hidden.value = true;
    focusEditor();
    if (intent !== "skipped") showToast("Thanks for the feedback!");
  };

  if (isHidden) return null;

  return (
    <div class="usage-feedback" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        class="usage-feedback__trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => {
          if (!open) trackUsageQuestionOpened(currentSurface.value);
          setOpen((value) => !value);
        }}
      >
        What brings you here?
      </button>
      {open && (
        <div id={id} class="usage-feedback__panel" role="dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
          <div class="usage-feedback__heading">
            <h2 id={`${id}-title`}>What are you trying today?</h2>
            <button type="button" class="usage-feedback__close" aria-label="Close question" onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}>×</button>
          </div>
          <p id={`${id}-description`}>One optional question to help improve TryJS.</p>
          <div class="usage-feedback__options">
            {OPTIONS.map((option, index) => (
              <button
                key={option.intent}
                ref={index === 0 ? firstOptionRef : undefined}
                type="button"
                onClick={() => finish(option.intent)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" class="usage-feedback__skip" onClick={() => finish("skipped")}>Not now</button>
        </div>
      )}
    </div>
  );
}
