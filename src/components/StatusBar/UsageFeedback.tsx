import { signal } from "@preact/signals";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { currentSurface } from "../../state/editor";
import {
  trackUsageIntentSelected,
  trackUsageInviteDismissed,
  trackUsageInviteViewed,
  trackUsageQuestionOpened,
  trackUsageQuestionViewed,
} from "../../utils/analytics";
import type { UsageQuestionPlacement } from "../../utils/analytics";
import { ACTIVATION_COMPLETED_EVENT, claimSessionEvent, hasSessionEvent, isUsageIntent } from "../../utils/analytics-policy";
import type { UsageIntent } from "../../utils/analytics-policy";
import { readSession, writeSession } from "../../utils/storage";
import { showToast } from "../Toast/Toast";
import "./UsageFeedback.css";

const FEEDBACK_KEY = "tryjs:usage-feedback:v1";
const INVITE_SHOWN_KEY = "usage_invite_shown";
const tabStorage = { getItem: readSession, setItem: writeSession };
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
  const [inviteVisible, setInviteVisible] = useState(false);
  const [placement, setPlacement] = useState<UsageQuestionPlacement>("statusbar");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
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
    if (isHidden || open) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const eligible = () => !hidden.value &&
      hasSessionEvent(tabStorage, "activation_completed") &&
      !hasSessionEvent(tabStorage, "usage_question_opened") &&
      !hasSessionEvent(tabStorage, INVITE_SHOWN_KEY);
    const cancel = () => { clearTimeout(timer); timer = undefined; };
    const schedule = () => {
      if (timer !== undefined || document.visibilityState !== "visible" || !eligible()) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (!eligible() || document.visibilityState !== "visible" ||
          document.querySelector('[role="dialog"], dialog[open], .gallery-modal, .screenshot-modal')) return;
        if (claimSessionEvent(tabStorage, INVITE_SHOWN_KEY)) setInviteVisible(true);
      }, 15_000);
    };
    const onVisibilityChange = () => { if (document.hidden) cancel(); else schedule(); };
    window.addEventListener(ACTIVATION_COMPLETED_EVENT, schedule);
    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();
    return () => {
      cancel();
      window.removeEventListener(ACTIVATION_COMPLETED_EVENT, schedule);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isHidden, open]);

  useEffect(() => {
    const invite = inviteRef.current;
    if (!inviteVisible || isHidden || !invite) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackUsageInviteViewed(surface);
      observer.disconnect();
    });
    observer.observe(invite);
    return () => observer.disconnect();
  }, [inviteVisible, isHidden, surface]);

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

  const openQuestion = (source: UsageQuestionPlacement) => {
    trackUsageQuestionOpened(currentSurface.value, source);
    setPlacement(source);
    setInviteVisible(false);
    setOpen(true);
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
          if (open) setOpen(false);
          else openQuestion("statusbar");
        }}
      >
        Help improve TryJS · 5 sec
      </button>
      {inviteVisible && !open && (
        <aside ref={inviteRef} class="usage-feedback__invite" aria-label="Feedback invitation">
          <div class="usage-feedback__heading">
            <strong>Help improve TryJS</strong>
            <button type="button" class="usage-feedback__close" aria-label="Dismiss feedback invitation" onClick={() => {
              setInviteVisible(false);
              trackUsageInviteDismissed(currentSurface.value);
              triggerRef.current?.focus();
            }}>×</button>
          </div>
          <p>One quick question. About 5 seconds.</p>
          <button type="button" class="usage-feedback__invite-action" aria-haspopup="dialog" aria-controls={id}
            onClick={() => openQuestion("invite")}>Answer 1 question</button>
        </aside>
      )}
      {open && (
        <div id={id} class={`usage-feedback__panel ${placement === "invite" ? "usage-feedback__panel--invite" : ""}`} role="dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
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
