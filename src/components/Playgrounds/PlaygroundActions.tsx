import { useEffect, useId, useRef, useState } from "preact/hooks";
import {
  activeSavedPlayground, applyPlayground, capturePlayground, currentSurface,
  setActiveSavedPlayground, startNewPlayground,
} from "../../state/editor";
import {
  activePlayground, canSavePlayground, hasUnsavedChanges, libraryError, openLibrary,
  playgroundDialog, savedElsewhere, savedPlaygrounds, updateSavedPlayground,
} from "../../state/playgrounds";
import { clearConsole } from "../../state/console";
import { playgroundLabel, playgroundText } from "../../utils/playground";
import { trackEvent } from "../../utils/analytics";
import { useKeyboard } from "../../hooks/useKeyboard";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Your work could not be saved. Export a backup to keep it.";
}

export function PlaygroundActions() {
  const active = activePlayground.value;
  const dirty = hasUnsavedChanges.value;
  const conflict = savedElsewhere.value;
  const canSave = canSavePlayground.value;
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const label = currentSurface.value === "web" ? "Web" : currentSurface.value === "react" ? "React"
    : currentSurface.value === "typescript" ? "TypeScript" : "JavaScript";

  const openSave = (copy = false) => {
    setOptionsOpen(false);
    playgroundDialog.value = { kind: copy ? "copy" : "save" };
    trackEvent("playground_save_started", { surface: currentSurface.value, action: copy ? "copy" : "create" });
  };

  const save = () => {
    if (document.querySelector("dialog[open]")) return;
    if (!canSavePlayground.value) return;
    if (!activePlayground.value) { openSave(); return; }
    if (savedElsewhere.value) { openSave(true); return; }
    if (!hasUnsavedChanges.value) return;
    try {
      const saved = updateSavedPlayground();
      showToast(`Saved “${saved.name}” in this browser.`);
    } catch (cause) { showToast(message(cause), "error", 6000); }
  };

  const startFresh = () => {
    const previous = capturePlayground();
    const previousRef = activeSavedPlayground.value;
    try {
      startNewPlayground();
      clearConsole();
      trackEvent("playground_started", { surface: currentSurface.value });
      showToast(`New ${playgroundLabel(capturePlayground())} playground.`, "success", 8000,
        playgroundText(previous).trim() || previousRef ? {
          label: "Undo",
          onClick: () => {
            try {
              applyPlayground(previous, true);
              if (previousRef) setActiveSavedPlayground(previousRef);
              showToast("Previous playground restored.");
            } catch (cause) { showToast(message(cause), "error", 6000); }
          },
        } : undefined);
    } catch (cause) { showToast(message(cause), "error", 6000); }
  };

  useKeyboard([{ key: "s", mod: true, handler: save }]);

  useEffect(() => {
    if (!optionsOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) setOptionsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation(); setOptionsOpen(false); optionsButtonRef.current?.focus();
      }
    };
    optionsRef.current?.querySelector<HTMLButtonElement>(".playground-save-menu button")?.focus();
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [optionsOpen]);

  const status = libraryError.value ? "Local saves unavailable" : conflict ? "Changed in another tab"
    : active ? dirty ? "Unsaved changes" : "Saved in this browser" : "Draft";

  return <>
    <div class="playground-identity">
      <span class="playground-identity__name" title={active?.name}>{active?.name ?? `Untitled ${label}`}</span>
      <span class={`playground-identity__status ${dirty || conflict ? "is-unsaved" : ""}`} role="status">{status}</span>
    </div>
    <div class="playground-actions">
      <button type="button" class="playgrounds-button" onClick={startFresh} aria-label="New playground"
        title={`Start a fresh ${label} playground. Your saved playgrounds are kept.`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        New
      </button>
      <div class="playground-save-control" ref={optionsRef}>
        <button id="playground-save" type="button" class="playgrounds-button playgrounds-button--primary"
          disabled={!canSave || Boolean(active && !dirty && !conflict)} onClick={save}
          aria-label={conflict ? "Save a copy" : active ? dirty ? "Save changes" : "Playground saved" : "Save playground"}
          title={!canSave ? "Write some code, then save it with a name." : conflict ? "Save a copy to keep both versions." : "Save in this browser (Ctrl+S / ⌘S)"}>
          {active && !dirty && !conflict ? "Saved" : conflict ? "Save a copy" : "Save"}
        </button>
        {active && <button type="button" class="playgrounds-button playground-save-options" ref={optionsButtonRef}
          aria-label="Save options" aria-expanded={optionsOpen} aria-controls={menuId} onClick={() => setOptionsOpen(!optionsOpen)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>}
        {optionsOpen && active && <div class="playground-save-menu" id={menuId}>
          <button type="button" onClick={() => openSave(true)}>Save a copy…</button>
          <button type="button" onClick={() => {
            setOptionsOpen(false); playgroundDialog.value = { kind: "rename", id: active.id };
          }}>Rename…</button>
        </div>}
      </div>
      <button id="playground-library" type="button" class="playgrounds-button playgrounds-trigger" onClick={openLibrary} aria-haspopup="dialog">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z" /></svg>
        My playgrounds {savedPlaygrounds.value.length > 0 && <span class="playgrounds-count">{savedPlaygrounds.value.length}</span>}
      </button>
    </div>
  </>;
}
