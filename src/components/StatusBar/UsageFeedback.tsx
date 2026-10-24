import { signal } from "@preact/signals";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { currentSurface } from "../../state/editor";
import {
  trackUsageIntentSelected,
  trackUsageInviteClicked,
  trackUsageInviteDismissed,
  trackUsageInviteViewed,
  trackUsageQuestionOpened,
  trackUsageQuestionViewed,
} from "../../utils/analytics";
import type { UsageQuestionPlacement } from "../../utils/analytics";
import { hasSessionEvent, isUsageIntent } from "../../utils/analytics-policy";
import type { UsageIntent } from "../../utils/analytics-policy";
import { readLocal, writeLocal, readSession, writeSession } from "../../utils/storage";
import { showToast } from "../Toast/Toast";
import "./UsageFeedback.css";

const FEEDBACK_KEY = "tryjs:usage-feedback:v1";
const ANSWER_KEY = "tryjs:usage-feedback:answer:v1";
const INVITE_AFTER_KEY = "tryjs:usage-invite:after:v2";
const DAY_MS = 24 * 60 * 60 * 1000;
const tabStorage = { getItem: readSession, setItem: writeSession };
const previousAnswer = readSession(FEEDBACK_KEY);
if (isUsageIntent(previousAnswer) && !isUsageIntent(readLocal(ANSWER_KEY))) writeLocal(ANSWER_KEY, previousAnswer);
const hidden = signal(previousAnswer === "skipped" || isUsageIntent(previousAnswer) || isUsageIntent(readLocal(ANSWER_KEY)));

function postponeInvite(duration: number) {
  const previous = Number(readLocal(INVITE_AFTER_KEY));
  writeLocal(INVITE_AFTER_KEY, String(Math.max(Number.isFinite(previous) ? previous : 0, Date.now() + duration)));
}

function inviteAllowed() {
  const after = Number(readLocal(INVITE_AFTER_KEY));
  return !hidden.value && !isUsageIntent(readLocal(ANSWER_KEY)) && (!Number.isFinite(after) || after <= Date.now());
}

// Respect explicit dismissals from the earlier invitation without treating old
// impression/open analytics claims as a permanent UI preference.
if (readLocal(INVITE_AFTER_KEY) === null && hasSessionEvent(tabStorage, "usage_invite_dismissed")) postponeInvite(7 * DAY_MS);
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
    if (isHidden || open || inviteVisible || !inviteAllowed()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let waitingForDialog: MutationObserver | undefined;
    const appRoot = document.getElementById("app") ?? document.body;
    const dialogOpen = () => Array.from(appRoot.querySelectorAll<HTMLElement>('[role="dialog"], dialog[open], .gallery-modal, .screenshot-modal'))
      .some((element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0 && style.visibility !== "hidden" && style.opacity !== "0" && element.getAttribute("aria-hidden") !== "true";
      });
    const cancel = () => {
      clearTimeout(timer); timer = undefined;
      waitingForDialog?.disconnect(); waitingForDialog = undefined;
    };
    const show = () => {
      timer = undefined;
      if (!inviteAllowed() || document.visibilityState !== "visible") return;
      if (dialogOpen()) {
        waitingForDialog = new MutationObserver(() => {
          if (dialogOpen()) return;
          waitingForDialog?.disconnect(); waitingForDialog = undefined;
          show();
        });
        waitingForDialog.observe(appRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "hidden", "class", "style", "aria-hidden"] });
        return;
      }
      setInviteVisible(true);
    };
    const schedule = () => {
      if (timer !== undefined || waitingForDialog || document.visibilityState !== "visible" || !inviteAllowed()) return;
      timer = setTimeout(show, 10_000);
    };
    const onVisibilityChange = () => { if (document.hidden) cancel(); else schedule(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();
    return () => {
      cancel();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isHidden, open, inviteVisible]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANSWER_KEY && isUsageIntent(event.newValue)) hidden.value = true;
      if (event.key === INVITE_AFTER_KEY && Number(event.newValue) > Date.now()) setInviteVisible(false);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const invite = inviteRef.current;
    if (!inviteVisible || isHidden || !invite) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
      postponeInvite(DAY_MS);
      trackUsageInviteViewed(surface);
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(invite);
    return () => observer.disconnect();
  }, [inviteVisible, isHidden, surface]);

  useEffect(() => {
    if (!open || isHidden) return;
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
  }, [open, isHidden]);

  const finish = (intent: UsageIntent | "skipped") => {
    if (hidden.value) return;
    if (intent !== "skipped") {
      writeLocal(ANSWER_KEY, intent);
      trackUsageIntentSelected(currentSurface.value, intent);
    } else postponeInvite(7 * DAY_MS);
    writeSession(FEEDBACK_KEY, intent);
    setOpen(false);
    hidden.value = true;
    focusEditor();
    if (intent !== "skipped") showToast("Thanks for the feedback!");
  };

  const openQuestion = (source: UsageQuestionPlacement) => {
    postponeInvite(7 * DAY_MS);
    if (source === "invite") {
      trackUsageInviteViewed(currentSurface.value);
      trackUsageInviteClicked(currentSurface.value);
    }
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
              postponeInvite(7 * DAY_MS);
              setInviteVisible(false);
              trackUsageInviteViewed(currentSurface.value);
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
