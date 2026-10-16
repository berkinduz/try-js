import { useEffect, useRef, useState } from "preact/hooks";
import {
  capturePlayground, captureSavedPlayground, currentSurface,
  openedSavedPlayground, playgroundVersion, previousPlayground, setActiveSavedPlayground,
} from "../../state/editor";
import {
  activePlayground, beginPlaygroundSave, canSavePlayground, completePlaygroundTransition,
  duplicateSavedPlayground, hasPendingSavedChanges, importPlaygrounds, libraryError, openedChangedElsewhere,
  playgroundDialog, removeSavedPlayground, renameSavedPlayground, requestPlaygroundTransition,
  restoreSavedPlayground, savedPlaygrounds, savePlaygroundAs, updateSavedPlayground,
} from "../../state/playgrounds";
import type { PlaygroundDialog } from "../../state/playgrounds";
import type { SavedPlayground } from "../../utils/library";
import { exportBackup, MAX_BACKUP_BYTES, newSavedPlayground, parseBackup, readLibrary } from "../../utils/library";
import { playgroundLabel, playgroundSurface, playgroundText, samePlayground } from "../../utils/playground";
import { downloadText } from "../../utils/download";
import { trackEvent } from "../../utils/analytics";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

type SaveView = Extract<PlaygroundDialog, { kind: "save" | "copy" } | { kind: "rename" }>;

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Changes could not be saved. Download your playground to keep a copy.";
}

function downloadPlayground(entry: SavedPlayground) {
  downloadText(exportBackup([entry]), "tryjs-playground.json");
  trackEvent("playground_backup_exported", { scope: "single" });
}

function SaveForm({ view }: { view: SaveView }) {
  const renaming = view.kind === "rename";
  const target = renaming ? savedPlaygrounds.value.find(entry => entry.id === view.id)
    : view.next ? openedSavedPlayground.value : activePlayground.value;
  const [name, setName] = useState(renaming ? target?.name ?? "" : view.kind === "copy" && target ? `${target.name.slice(0, 75)} copy` : "");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); nameRef.current?.select(); }, []);

  const cancel = () => {
    playgroundDialog.value = view.kind !== "rename" && view.next ? { kind: "confirm", next: view.next } : { kind: "browse" };
  };
  const submit = (event: Event) => {
    event.preventDefault();
    try {
      if (view.kind === "rename") {
        renameSavedPlayground(view.id, name);
        playgroundDialog.value = { kind: "browse" };
        showToast("Playground renamed.");
      } else {
        const entry = savePlaygroundAs(name, view.next ? captureSavedPlayground()! : capturePlayground());
        if (view.next) completePlaygroundTransition(view.next);
        else playgroundDialog.value = null;
        showToast(`Saved “${entry.name}” in My playgrounds, in this browser.`);
      }
    } catch (cause) { setError(message(cause)); }
  };
  return <form class="playgrounds-save" onSubmit={submit}>
    <label for="playground-name">Playground name</label>
    <input id="playground-name" ref={nameRef} type="text" maxLength={80} required value={name}
      placeholder="e.g. Fetch example" autoComplete="off" aria-describedby="playground-save-help"
      onInput={event => setName(event.currentTarget.value)} />
    <p id="playground-save-help" class="playgrounds-help">{renaming
      ? "Your code stays as it is."
      : "Open it again from My playgrounds in this browser. No account needed."}</p>
    {error && <div class="playgrounds-error" role="alert"><p>{error}</p><button type="button" class="playgrounds-button" onClick={() => {
      try {
        const state = view.kind !== "rename" && view.next ? captureSavedPlayground()! : capturePlayground();
        downloadPlayground(newSavedPlayground(name || "Untitled playground", state));
      } catch (cause) { setError(message(cause)); }
    }}>Download playground (.json)</button></div>}
    <div class="playgrounds-form-actions">
      <button type="button" class="playgrounds-button" onClick={cancel}>Cancel</button>
      <button type="submit" class="playgrounds-button playgrounds-button--primary" disabled={!name.trim()}>{renaming ? "Rename" : view.kind === "copy" ? "Save copy" : "Save playground"}</button>
    </div>
  </form>;
}

function SaveBeforeLeaving({ view }: { view: Extract<PlaygroundDialog, { kind: "confirm" }> }) {
  const [error, setError] = useState("");
  const conflict = openedChangedElsewhere.value;
  const leaving = view.next.kind === "close" ? "close this playground" : view.next.kind === "recover" ? "open the earlier code" : "open another playground";
  const complete = (save: boolean) => {
    try {
      if (save && hasPendingSavedChanges.value) updateSavedPlayground();
      completePlaygroundTransition(view.next, !save);
      showToast(view.next.kind === "close" ? "Back to your previous code." : "Playground opened.");
    } catch (cause) { setError(message(cause)); }
  };
  return <div class="playgrounds-save">
    <p class="playgrounds-help playgrounds-help--first">{conflict
      ? "The saved copy changed or was removed. Save your edits as a separate playground to keep both versions."
      : `Save your changes before you ${leaving}?`}</p>
    {error && <p class="playgrounds-error" role="alert">{error}</p>}
    <div class="playgrounds-leave-actions">
      <button type="button" class="playgrounds-button playgrounds-button--primary" onClick={() => {
        if (conflict) playgroundDialog.value = { kind: "copy", next: view.next };
        else complete(true);
      }}>{conflict ? "Save a copy…" : view.next.kind === "close" ? "Save and close" : "Save and open"}</button>
      <button type="button" class="playgrounds-button" onClick={() => complete(false)}>{view.next.kind === "close" ? "Close without saving" : "Open without saving"}</button>
      <button type="button" class="playgrounds-button" onClick={() => { playgroundDialog.value = null; }}>Keep editing</button>
    </div>
  </div>;
}

export function PlaygroundLibrary() {
  const view = playgroundDialog.value;
  const isOpen = view !== null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef(true);
  const [mobile, setMobile] = useState(window.innerWidth <= 600);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deletion, setDeletion] = useState<{ name: string; undo: () => void } | null>(null);
  const entries = savedPlaygrounds.value;
  const previous = previousPlayground.value;
  const modal = mobile || view?.kind !== "browse";
  const matching = entries.filter(entry => `${entry.name} ${playgroundLabel(entry.state)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth <= 600);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    restoreFocusRef.current = true;
    setQuery(""); setExpandedId(null); setDeletion(null); setError("");
    return () => {
      if (!restoreFocusRef.current) return;
      const previous = previousFocusRef.current;
      if (previous?.isConnected && !previous.matches(":disabled")) previous.focus();
      else document.getElementById("playground-library")?.focus();
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (modal) dialog?.showModal();
    else dialog?.show();
    const input = dialog?.querySelector<HTMLInputElement>("#playground-name");
    input?.focus(); input?.select();
    return () => dialog?.close();
  }, [isOpen, modal]);
  useEffect(() => {
    setError("");
    if (view?.kind === "browse" || view?.kind === "confirm") headingRef.current?.focus();
  }, [view?.kind]);
  useEffect(() => {
    if (!isOpen || modal) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!dialogRef.current?.contains(target) && !document.getElementById("playground-library")?.contains(target)) {
        restoreFocusRef.current = false;
        playgroundDialog.value = null;
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); playgroundDialog.value = null; }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, modal]);

  const attempt = (action: () => void) => {
    try { action(); setError(""); } catch (cause) { setError(message(cause)); }
  };
  const remove = (entry: SavedPlayground) => attempt(() => {
    const previousRef = openedSavedPlayground.value;
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
        if (previousRef?.id === removed.id && playgroundVersion.value === revision && currentSurface.value === surface && openedSavedPlayground.value?.id === removed.id) {
          setActiveSavedPlayground({ ...restored, updatedAt: previousRef.updatedAt });
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
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a TryJS file smaller than 2 MB.");
      const incoming = parseBackup(await file.text());
      importPlaygrounds(incoming);
      setQuery(""); setError("");
      showToast(`Imported ${incoming.length} playground${incoming.length === 1 ? "" : "s"}.`);
    } catch (cause) { setError(message(cause)); }
    if (importRef.current) importRef.current.value = "";
  };

  if (!view) return null;
  const title = view.kind === "browse" ? "My playgrounds" : view.kind === "rename" ? "Rename playground"
    : view.kind === "confirm" ? `Changes to “${openedSavedPlayground.value?.name ?? "your playground"}”`
      : view.kind === "copy" ? "Save a copy" : "Save playground";
  return <dialog id="playground-dialog" class={`playgrounds-dialog${view.kind === "browse" ? " playgrounds-dialog--panel" : " playgrounds-dialog--save"}`}
    ref={dialogRef} aria-labelledby="playgrounds-title" aria-describedby="playgrounds-description"
    onCancel={event => { event.preventDefault(); playgroundDialog.value = null; }}
    onClick={event => { if (event.target === event.currentTarget) playgroundDialog.value = null; }}>
    <div class="playgrounds-shell">
      <header class="playgrounds-header">
        <div><h2 id="playgrounds-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          <p id="playgrounds-description">{view.kind === "browse" ? "Saved in this browser" : view.kind === "rename" ? "Give this playground a new name."
            : view.kind === "confirm" ? "Your saved version has not been updated." : "Keep this code so you can open it again."}</p></div>
        <button type="button" class="playgrounds-close" aria-label="Close My playgrounds" onClick={() => { playgroundDialog.value = null; }}>×</button>
      </header>
      {view.kind === "confirm" ? <SaveBeforeLeaving view={view} /> : view.kind !== "browse" ? <SaveForm key={`${view.kind}:${view.kind === "rename" ? view.id : ""}`} view={view} /> : <>
        <div class="playgrounds-body">
          {(error || libraryError.value) && <p class="playgrounds-error" role="alert">{error || libraryError.value}</p>}
          {deletion && <p class="playgrounds-notice" role="status">Deleted “{deletion.name}”. <button type="button" onClick={deletion.undo}>Undo</button></p>}
          <div class="playgrounds-create">
            <button type="button" class="playgrounds-button playgrounds-button--primary" disabled={!canSavePlayground.value} onClick={() => beginPlaygroundSave(Boolean(activePlayground.value))}>
              {activePlayground.value ? "Save a copy…" : "Save current code…"}
            </button>
            {!canSavePlayground.value && <span>Write some code first.</span>}
          </div>
          {entries.length > 4 && <div class="playgrounds-search">
            <label class="sr-only" for="playground-search">Find a saved playground</label>
            <input id="playground-search" type="search" value={query} placeholder="Find a playground…" onInput={event => setQuery(event.currentTarget.value)} />
          </div>}
          {entries.length > 0 && <ul class="playgrounds-list" aria-label="Saved playgrounds">
            {matching.map(entry => <li key={entry.id}>
              <div class="playgrounds-row">
                <button type="button" class="playgrounds-open" aria-label={`Open ${entry.name}`} onClick={() => attempt(() => { requestPlaygroundTransition({ kind: "open", id: entry.id }); })}>
                  <span class={`playgrounds-mode playgrounds-mode--${playgroundSurface(entry.state)}`} aria-hidden="true">{entry.state.mode === "web" ? "</>" : entry.state.mode === "react" ? "JSX" : entry.state.language === "typescript" ? "TS" : "JS"}</span>
                  <span class="playgrounds-entry"><strong>{entry.name}</strong><span>{playgroundLabel(entry.state)}</span></span>
                  <span class="playgrounds-open-label">Open</span>
                </button>
                <button type="button" class="playgrounds-more" aria-label={`Actions for ${entry.name}`} aria-expanded={expandedId === entry.id} aria-controls={`playground-actions-${entry.id}`}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>•••</button>
              </div>
              {expandedId === entry.id && <div class="playgrounds-row-actions" id={`playground-actions-${entry.id}`}>
                <button type="button" class="playgrounds-button" onClick={() => { playgroundDialog.value = { kind: "rename", id: entry.id }; }}>Rename</button>
                <button type="button" class="playgrounds-button" onClick={() => attempt(() => {
                  duplicateSavedPlayground(entry.id); setExpandedId(null); showToast("Playground duplicated.");
                })}>Duplicate</button>
                <button type="button" class="playgrounds-button" onClick={() => attempt(() => downloadPlayground(entry))}>Download (.json)</button>
                <button type="button" class="playgrounds-button playgrounds-button--danger" onClick={() => remove(entry)}>Delete</button>
              </div>}
            </li>)}
          </ul>}
          {entries.length > 0 && matching.length === 0 && <p class="playgrounds-no-results" role="status">No playgrounds match “{query}”.</p>}
          {entries.length === 0 && !libraryError.value && <div class="playgrounds-empty">
            <h3>No saved playgrounds yet</h3><p>Save code with a name to open it here later.</p>
          </div>}
          {previous && !samePlayground(previous, capturePlayground()) && <div class="playgrounds-earlier">
            <span>Code replaced earlier · {playgroundLabel(previous)}</span>
            <code>{playgroundText(previous).trim().split("\n", 1)[0].slice(0, 90)}</code>
            <button type="button" class="playgrounds-file-action" onClick={() => attempt(() => requestPlaygroundTransition({ kind: "recover" }))}>Open this code</button>
          </div>}
        </div>
        <footer class="playgrounds-footer">
          <input type="file" ref={importRef} accept=".json,application/json" hidden onChange={event => { void importFile(event.currentTarget.files?.[0]); }} />
          <button type="button" class="playgrounds-file-action" onClick={() => importRef.current?.click()}>Import playgrounds (.json)</button>
          {entries.length > 0 && <button type="button" class="playgrounds-file-action" onClick={() => attempt(() => {
            downloadText(exportBackup(readLibrary(window.localStorage)), "tryjs-playgrounds.json");
            trackEvent("playground_backup_exported", { scope: "all" });
          })}>Download all playgrounds (.json)</button>}
        </footer>
      </>}
    </div>
  </dialog>;
}
