import { useEffect, useRef, useState } from "preact/hooks";
import {
  activeSavedPlayground, capturePlayground, currentSurface, playgroundVersion,
  PREVIOUS_PLAYGROUND_KEY, restorePreviousDraft, setActiveSavedPlayground,
} from "../../state/editor";
import {
  activePlayground, canSavePlayground, duplicateSavedPlayground, importPlaygrounds,
  libraryError, openSavedPlayground, playgroundDialog, removeSavedPlayground,
  renameSavedPlayground, restoreSavedPlayground, savedElsewhere, savedPlaygrounds,
  savePlaygroundAs,
} from "../../state/playgrounds";
import type { PlaygroundDialog } from "../../state/playgrounds";
import type { SavedPlayground } from "../../utils/library";
import { exportBackup, MAX_BACKUP_BYTES, newSavedPlayground, parseBackup, readLibrary } from "../../utils/library";
import { playgroundLabel, playgroundSurface, playgroundText } from "../../utils/playground";
import { readLocal } from "../../utils/storage";
import { downloadText } from "../../utils/download";
import { trackEvent } from "../../utils/analytics";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Changes could not be saved. Export a backup to keep your work.";
}

function exportCurrent() {
  const state = capturePlayground();
  const name = activePlayground.value?.name ?? `Untitled ${playgroundLabel(state)}`;
  downloadText(exportBackup([newSavedPlayground(name, state)]), "tryjs-playground.json");
  trackEvent("playground_backup_exported", { scope: "current" });
}

function FolderIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" /></svg>;
}

function SaveForm({ view }: { view: Exclude<PlaygroundDialog, { kind: "browse" }> }) {
  const renaming = view.kind === "rename";
  const target = renaming ? savedPlaygrounds.value.find(entry => entry.id === view.id) : activePlayground.value;
  const [name, setName] = useState(renaming ? target?.name ?? "" : view.kind === "copy" && target ? `${target.name.slice(0, 75)} copy` : "");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); nameRef.current?.select(); }, []);

  const submit = (event: Event) => {
    event.preventDefault();
    try {
      if (view.kind === "rename") {
        renameSavedPlayground(view.id, name);
        playgroundDialog.value = { kind: "browse" };
        showToast("Playground renamed.");
      } else {
        const entry = savePlaygroundAs(name);
        playgroundDialog.value = null;
        showToast(`Saved “${entry.name}” in My playgrounds.`);
      }
    } catch (cause) { setError(message(cause)); }
  };

  return <form class="playgrounds-save" onSubmit={submit}>
    <label for="playground-name">Playground name</label>
    <input ref={nameRef} id="playground-name" value={name} required maxLength={80}
      placeholder="e.g. Fetch experiment" autoComplete="off"
      onInput={event => setName(event.currentTarget.value)} aria-describedby="playground-save-help" />
    <p id="playground-save-help" class="playgrounds-help">{view.kind === "copy" && savedElsewhere.value
      ? "Another tab saved a different version. A copy will keep both playgrounds."
      : renaming ? "This changes the name. Your current edits stay in the editor."
        : "Find it in My playgrounds when you return to this browser. No account needed."}</p>
    {!renaming && <p class="playgrounds-help">Saved on this device only. Download a backup from My playgrounds to keep a separate copy.</p>}
    {error && <div role="alert" class="playgrounds-error"><p>{error}</p><button type="button" class="playgrounds-button" onClick={() => {
      try { exportCurrent(); } catch (cause) { setError(message(cause)); }
    }}>Export current as backup</button></div>}
    <div class="playgrounds-form-actions">
      <button type="button" class="playgrounds-button" onClick={() => { playgroundDialog.value = renaming ? { kind: "browse" } : null; }}>Cancel</button>
      <button type="submit" class="playgrounds-button playgrounds-button--primary" disabled={!name.trim()}>{renaming ? "Rename" : view.kind === "copy" ? "Save copy" : "Save playground"}</button>
    </div>
  </form>;
}

export function PlaygroundLibrary() {
  const view = playgroundDialog.value;
  const isOpen = view !== null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deletion, setDeletion] = useState<{ name: string; undo: () => void } | null>(null);
  const entries = savedPlaygrounds.value;
  const matching = entries.filter(entry => `${entry.name} ${playgroundLabel(entry.state)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    setError(""); setQuery(""); setExpandedId(null); setDeletion(null);
    dialogRef.current?.showModal();
    const nameInput = dialogRef.current?.querySelector<HTMLInputElement>("#playground-name");
    nameInput?.focus(); nameInput?.select();
    return () => {
      dialogRef.current?.close();
      if (previousFocus?.isConnected && !previousFocus.matches(":disabled")) previousFocus.focus();
      else document.getElementById("playground-library")?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (view?.kind === "browse") { headingRef.current?.focus(); setError(""); }
  }, [view?.kind]);

  const attempt = (action: () => void) => {
    try { action(); setError(""); } catch (cause) { setError(message(cause)); }
  };
  const remove = (entry: SavedPlayground) => attempt(() => {
    const previousRef = activeSavedPlayground.value;
    const revision = playgroundVersion.value;
    const surface = currentSurface.value;
    const removed = removeSavedPlayground(entry.id);
    setExpandedId(null);
    let restoredAlready = false;
    const undo = () => {
      if (restoredAlready) return;
      try {
        const restored = restoreSavedPlayground(removed);
        restoredAlready = true;
        if (previousRef?.id === removed.id && playgroundVersion.value === revision &&
          currentSurface.value === surface && !activeSavedPlayground.value) {
          setActiveSavedPlayground({ id: restored.id, updatedAt: previousRef.updatedAt });
        }
        setDeletion(null); showToast("Playground restored.");
      } catch (cause) { setError(message(cause)); showToast(message(cause), "error"); }
    };
    setDeletion({ name: removed.name, undo });
    showToast(`Deleted “${removed.name}”.`, "success", 8000, { label: "Undo", onClick: undo });
  });
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 2 MB.");
      const incoming = parseBackup(await file.text());
      importPlaygrounds(incoming);
      setQuery(""); setError("");
      showToast(`Imported ${incoming.length} playground${incoming.length === 1 ? "" : "s"}.`);
    } catch (cause) { setError(message(cause)); }
    if (importRef.current) importRef.current.value = "";
  };

  if (!view) return null;
  const title = view.kind === "browse" ? "My playgrounds" : view.kind === "rename" ? "Rename playground" : view.kind === "copy" ? "Save a copy" : "Save playground";
  return <dialog class={`playgrounds-dialog${view.kind !== "browse" ? " playgrounds-dialog--save" : ""}`} ref={dialogRef}
    aria-labelledby="playgrounds-title" aria-describedby="playgrounds-description"
    onCancel={() => { playgroundDialog.value = null; }}
    onClick={event => { if (event.target === event.currentTarget) playgroundDialog.value = null; }}>
    <div class="playgrounds-shell">
      <header class="playgrounds-header">
        <div><h2 id="playgrounds-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          <p id="playgrounds-description">{view.kind === "browse" ? "Your named playgrounds, kept in this browser." : view.kind === "rename" ? "Give this playground a new name." : "Keep this code so you can open it again."}</p></div>
        <button type="button" class="playgrounds-close" aria-label="Close playground dialog" onClick={() => { playgroundDialog.value = null; }}>×</button>
      </header>
      {view.kind !== "browse" ? <SaveForm key={`${view.kind}:${view.kind === "rename" ? view.id : ""}`} view={view} /> : <>
        <div class="playgrounds-body">
          {(error || libraryError.value) && <p class="playgrounds-error" role="alert">{error || libraryError.value}</p>}
          {deletion && <p class="playgrounds-notice" role="status">Deleted “{deletion.name}”. <button type="button" onClick={deletion.undo}>Undo</button></p>}
          {entries.length > 0 && <div class="playgrounds-search">
            <label class="sr-only" for="playground-search">Find a saved playground</label>
            <input id="playground-search" type="search" value={query} placeholder="Find a playground…" onInput={event => setQuery(event.currentTarget.value)} />
          </div>}
          {entries.length > 0 && <ul class="playgrounds-list" aria-label="Saved playgrounds">
            {matching.map(entry => <li key={entry.id}>
              <div class="playgrounds-row">
                <button type="button" class="playgrounds-open" aria-label={`Open ${entry.name}`} onClick={() => attempt(() => {
                  const opened = openSavedPlayground(entry.id); showToast(`Opened “${opened.name}”.`);
                })}>
                  <span class={`playgrounds-mode playgrounds-mode--${playgroundSurface(entry.state)}`} aria-hidden="true">{entry.state.mode === "web" ? "</>" : entry.state.mode === "react" ? "JSX" : entry.state.language === "typescript" ? "TS" : "JS"}</span>
                  <span class="playgrounds-entry"><strong>{entry.name}</strong><span>{playgroundLabel(entry.state)} · Saved {new Date(entry.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></span>
                  <span class="playgrounds-open-label">Open <span aria-hidden="true">↗</span></span>
                </button>
                {entry.id === activePlayground.value?.id && <span class="playgrounds-editing">Editing</span>}
                <button type="button" class="playgrounds-more" aria-label={`Actions for ${entry.name}`} aria-expanded={expandedId === entry.id} aria-controls={`playground-actions-${entry.id}`}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>•••</button>
              </div>
              {expandedId === entry.id && <div class="playgrounds-row-actions" id={`playground-actions-${entry.id}`}>
                <button type="button" class="playgrounds-button" onClick={() => { playgroundDialog.value = { kind: "rename", id: entry.id }; }}>Rename</button>
                <button type="button" class="playgrounds-button" onClick={() => attempt(() => {
                  duplicateSavedPlayground(entry.id); setExpandedId(null); showToast("Saved playground duplicated.");
                })}>Duplicate</button>
                <button type="button" class="playgrounds-button playgrounds-button--danger" onClick={() => remove(entry)}>Delete</button>
              </div>}
            </li>)}
          </ul>}
          {entries.length > 0 && matching.length === 0 && <p class="playgrounds-no-results" role="status">No playgrounds match “{query}”.</p>}
          {entries.length === 0 && !libraryError.value && <div class="playgrounds-empty">
            <FolderIcon /><h3>A place for code you want to keep</h3>
            <p>Use Save in the editor to name a playground.<br />It will appear here when you come back.</p>
            <button type="button" class="playgrounds-button playgrounds-button--primary" onClick={() => {
              if (canSavePlayground.value && playgroundText(capturePlayground()).trim()) {
                playgroundDialog.value = { kind: "save" };
                trackEvent("playground_save_started", { surface: currentSurface.value, action: "create" });
              } else playgroundDialog.value = null;
            }}>{canSavePlayground.value ? "Save this playground" : "Back to editor"}</button>
          </div>}
        </div>
        <footer class="playgrounds-footer">
          {readLocal(PREVIOUS_PLAYGROUND_KEY) && <button type="button" class="playgrounds-recover" onClick={() => attempt(() => {
            restorePreviousDraft(); playgroundDialog.value = null; showToast("Previous draft restored.");
          })}>Restore previous draft</button>}
          <details class="playgrounds-backups"><summary>Backups</summary>
            <p>Download a separate copy before clearing this browser’s data.</p>
            <div class="playgrounds-backup-actions">
              <input type="file" ref={importRef} accept=".json,application/json" hidden onChange={event => { void importFile(event.currentTarget.files?.[0]); }} />
              <button type="button" class="playgrounds-button" onClick={() => importRef.current?.click()}>Import JSON</button>
              <button type="button" class="playgrounds-button" onClick={() => attempt(exportCurrent)}>Export current</button>
              {entries.length > 0 && <button type="button" class="playgrounds-button" onClick={() => attempt(() => {
                downloadText(exportBackup(readLibrary(window.localStorage)), "tryjs-playgrounds.json");
                trackEvent("playground_backup_exported", { scope: "all" });
              })}>Export all</button>}
            </div>
          </details>
        </footer>
      </>}
    </div>
  </dialog>;
}
