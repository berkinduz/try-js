import {
  activePlayground, beginPlaygroundSave, canSavePlayground, hasUnsavedChanges,
  libraryError, openLibrary, playgroundDialog, requestPlaygroundTransition,
  savedElsewhere, updateSavedPlayground,
} from "../../state/playgrounds";
import { useKeyboard } from "../../hooks/useKeyboard";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

function attempt(action: () => void) {
  try { action(); }
  catch (cause) { showToast(cause instanceof Error ? cause.message : "Your changes could not be saved.", "error", 6000); }
}

function save() {
  if (playgroundDialog.value || !canSavePlayground.value) return;
  if (!activePlayground.value) { beginPlaygroundSave(); return; }
  if (savedElsewhere.value) { beginPlaygroundSave(true); return; }
  if (!hasUnsavedChanges.value) return;
  attempt(() => {
    const entry = updateSavedPlayground();
    showToast(`Saved changes to “${entry.name}”.`);
  });
}

export function PlaygroundActions() {
  useKeyboard([{ key: "s", mod: true, handler: save }]);
  return <button id="playground-library" type="button" class="playgrounds-trigger"
    onClick={() => playgroundDialog.value ? playgroundDialog.value = null : openLibrary()}
    aria-haspopup="dialog" aria-expanded={playgroundDialog.value !== null} aria-controls="playground-dialog">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z" /></svg>
    My playgrounds
  </button>;
}

export function PlaygroundContext() {
  const active = activePlayground.value;
  if (!active) return null;
  const dirty = hasUnsavedChanges.value;
  const conflict = savedElsewhere.value;
  const status = libraryError.value ? "Saved copy unavailable" : conflict ? "Saved copy changed or removed"
    : dirty ? "Changes not saved" : "Saved in this browser";
  return <div class="playground-context" aria-label="Open playground">
    <div class="playground-identity">
      <span class="playground-identity__name" title={active.name}>{active.name}</span>
      <span class={`playground-identity__status${dirty || conflict ? " is-unsaved" : ""}`} role="status">{status}</span>
    </div>
    <div class="playground-context__actions">
      {(dirty || conflict) && <button type="button" class="playgrounds-button playgrounds-button--primary" onClick={save}>
        {conflict ? "Save a copy…" : "Save changes"}
      </button>}
      <button type="button" class="playgrounds-button" onClick={() => attempt(() => {
        requestPlaygroundTransition({ kind: "close" });
        if (!playgroundDialog.value) showToast("Back to your previous code.");
      })}>Close playground</button>
    </div>
  </div>;
}
