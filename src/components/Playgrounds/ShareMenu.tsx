import { useEffect, useId, useRef, useState } from "preact/hooks";
import { capturePlayground, mode } from "../../state/editor";
import { selectedText } from "../../state/selection";
import { generateEmbedCode, shareToClipboard } from "../../utils/share";
import { downloadText } from "../../utils/download";
import { exportBackup, newSavedPlayground } from "../../utils/library";
import { trackEmbedCopied, trackEvent, trackShareCreated } from "../../utils/analytics";
import { openScreenshotModal } from "../Screenshot/ScreenshotModal";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

export function ShareMenu({ label = false }: { label?: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const isScript = mode.value === "js";

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); }
    };
    wrapperRef.current?.querySelector<HTMLButtonElement>(".playground-share-menu button")?.focus();
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const share = async (embed = false) => {
    setOpen(false);
    buttonRef.current?.focus();
    const state = capturePlayground();
    const surface = state.mode === "web" || state.mode === "react" ? state.mode : state.language;
    const selection = !embed && isScript && Boolean(selectedText.value);
    try {
      trackEvent("code_share", { method: embed ? "embed" : "url" });
      if (embed) {
        await navigator.clipboard.writeText(generateEmbedCode(state, window.location.origin));
        trackEmbedCopied(surface);
        showToast("Embed code copied!");
      } else {
        if (selection) state.code = selectedText.value;
        const result = await shareToClipboard(state);
        trackShareCreated(surface, selection ? "selection" : "document", Boolean(result.warning));
        showToast(result.warning ?? (selection ? "Selection link copied!" : "Link copied to clipboard!"), result.warning ? "warning" : "success", result.warning ? 5000 : 2500);
      }
    } catch (cause) {
      showToast(cause instanceof Error && cause.message.includes("too large") ? cause.message : "Could not copy. Export a JSON backup to share this playground.", "error", 4500);
    }
  };

  return <div class={`playground-share ${open ? "is-open" : ""}`} ref={wrapperRef}>
    <button type="button" ref={buttonRef} class={label ? "playgrounds-button" : "editor-action-btn"}
      title="Share" aria-label="Share" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4m0-11-6.8 4" />
      </svg>{label && "Share"}
    </button>
    {open && <div class="playground-share-menu" id={id}>
      <button type="button" onClick={() => { void share(); }}>{isScript && selectedText.value ? "Copy selection link" : "Copy link"}</button>
      <button type="button" onClick={() => { void share(true); }}>Copy embed code</button>
      <button type="button" onClick={() => {
        setOpen(false);
        try {
          downloadText(exportBackup([newSavedPlayground("Untitled playground", capturePlayground())]), "tryjs-playground.json");
          trackEvent("playground_backup_exported", { scope: "current" });
        } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not export this playground.", "error"); }
      }}>Export JSON</button>
      {isScript && <button type="button" onClick={() => {
        setOpen(false); trackEvent("screenshot_export");
        openScreenshotModal(selectedText.value || capturePlayground().code);
      }}>Export as image</button>}
    </div>}
  </div>;
}
