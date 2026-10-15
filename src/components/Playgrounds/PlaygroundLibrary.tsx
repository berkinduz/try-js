import { signal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { applyPlayground, capturePlayground, PREVIOUS_PLAYGROUND_KEY, restorePreviousDraft } from "../../state/editor";
import { playgroundLabel } from "../../utils/playground";
import { readLocal } from "../../utils/storage";
import { downloadText } from "../../utils/download";
import { exportBackup, MAX_BACKUP_BYTES, mergePlaygrounds, newSavedPlayground, parseBackup, readLibrary, writeLibrary } from "../../utils/library";
import type { SavedPlayground } from "../../utils/library";
import { trackEvent } from "../../utils/analytics";
import { showToast } from "../Toast/Toast";
import "./Playgrounds.css";

const libraryOpen = signal(false);
const activeId = signal<string | null>(null);
export function openLibrary() { libraryOpen.value = true; }

function surface(entry: SavedPlayground) {
  return entry.state.mode === "web" || entry.state.mode === "react" ? entry.state.mode : entry.state.language;
}

export function PlaygroundLibrary() {
  const isOpen = libraryOpen.value;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<SavedPlayground[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState<SavedPlayground | null>(null);
  const snapshot = isOpen ? capturePlayground() : null;
  const active = snapshot && entries.find((entry) => entry.id === activeId.value &&
    (entry.state.mode ?? "js") === (snapshot.mode ?? "js") && entry.state.language === snapshot.language);
  const normalizedName = name.trim().slice(0, 80) || "Untitled playground";

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    setError("");
    setDeleted(null);
    try {
      const saved = readLibrary(window.localStorage).sort((a, b) => b.updatedAt - a.updatedAt);
      setEntries(saved);
      setName(saved.find((entry) => entry.id === activeId.value)?.name ?? "");
    } catch {
      setError("Saved playgrounds could not be read. You can still export the current playground as a backup.");
    }
    dialogRef.current?.showModal();
    return () => {
      dialogRef.current?.close();
      previousFocus?.focus();
    };
  }, [isOpen]);

  const change = (action: (current: SavedPlayground[]) => SavedPlayground[]) => {
    try {
      const next = action(readLibrary(window.localStorage));
      writeLibrary(window.localStorage, next);
      setEntries([...next].sort((a, b) => b.updatedAt - a.updatedAt));
      setError("");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Changes could not be saved. Export a backup to keep your work.");
      return false;
    }
  };

  const save = (event: Event) => {
    event.preventDefault();
    let entry: SavedPlayground;
    try { entry = newSavedPlayground(name, capturePlayground()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This playground could not be saved."); return; }
    const updating = Boolean(active && active.name === entry.name);
    if (updating) entry.id = active!.id;
    if (!change((current) => [entry, ...current.filter((item) => item.id !== entry.id)])) return;
    activeId.value = entry.id;
    setName(entry.name);
    setDeleted(null);
    trackEvent("playground_saved", { surface: surface(entry), action: updating ? "update" : "create" });
    showToast("Playground saved in this browser.");
  };

  const open = (entry: SavedPlayground) => {
    try { applyPlayground(entry.state); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This playground could not be opened."); return; }
    activeId.value = entry.id;
    trackEvent("playground_opened", { surface: surface(entry) });
    libraryOpen.value = false;
    showToast(`Opened ${entry.name}`);
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 2 MB.");
      const incoming = parseBackup(await file.text());
      if (change((current) => mergePlaygrounds(current, incoming))) {
        setDeleted(null);
        showToast(`Imported ${incoming.length} playground${incoming.length === 1 ? "" : "s"}.`);
        trackEvent("playground_backup_imported");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "This backup could not be imported."); }
    if (importRef.current) importRef.current.value = "";
  };

  const exportCurrent = () => {
    try {
      downloadText(exportBackup([newSavedPlayground(name, capturePlayground())]), "tryjs-playground.json");
      trackEvent("playground_backup_exported", { scope: "current" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "This playground could not be exported."); }
  };

  const recover = () => {
    try {
      restorePreviousDraft();
      activeId.value = null;
      libraryOpen.value = false;
      showToast("Previous draft restored.");
    } catch { setError("The previous draft could not be restored."); }
  };

  if (!isOpen || !snapshot) return null;
  return (
    <dialog class="playgrounds-dialog" ref={dialogRef} aria-labelledby="playgrounds-title"
      onCancel={() => { libraryOpen.value = false; }}
      onClick={(event) => { if (event.target === event.currentTarget) libraryOpen.value = false; }}>
      <div class="playgrounds-shell">
        <header class="playgrounds-header">
          <div><h2 id="playgrounds-title">My playgrounds</h2><p>Saved in this browser. Export a backup to keep a separate copy.</p></div>
          <button type="button" class="playgrounds-close" aria-label="Close saved playgrounds" onClick={() => { libraryOpen.value = false; }}>×</button>
        </header>
        <div class="playgrounds-body">
          <form class="playgrounds-save" onSubmit={save}>
            <label class="sr-only" for="playground-name">Playground name</label>
            <input id="playground-name" autoFocus value={name} onInput={(event) => setName(event.currentTarget.value)} maxLength={80} placeholder={`Untitled ${playgroundLabel(snapshot)} playground`} />
            <button class="playgrounds-button playgrounds-button--primary" type="submit">{active ? normalizedName === active.name ? "Save changes" : "Save a copy" : "Save current"}</button>
          </form>
          {error && <p class="playgrounds-error" role="alert">{error}</p>}
          {deleted && <div class="playgrounds-notice" role="status">Removed {deleted.name}. <button type="button" onClick={() => { if (change((current) => mergePlaygrounds(current, [deleted]))) setDeleted(null); }}>Undo</button></div>}
          <ul class="playgrounds-list" aria-label="Saved playgrounds">
            {entries.map((entry) => <li key={entry.id}>
              <button type="button" class="playgrounds-open" onClick={() => open(entry)}>
                <strong>{entry.name}</strong><span>{playgroundLabel(entry.state)} · {new Date(entry.updatedAt).toLocaleDateString()}</span>
              </button>
              <div class="playgrounds-row-actions">
                <button type="button" class="playgrounds-button" aria-label={`Duplicate ${entry.name}`} title="Duplicate" onClick={() => {
                  const copy = newSavedPlayground(`${entry.name} copy`, entry.state);
                  if (change((current) => [copy, ...current])) setDeleted(null);
                }}>Copy</button>
                <button type="button" class="playgrounds-button" aria-label={`Remove ${entry.name}`} title="Remove" onClick={() => {
                  if (change((current) => current.filter((item) => item.id !== entry.id))) {
                    setDeleted(entry);
                    if (activeId.value === entry.id) activeId.value = null;
                  }
                }}>×</button>
              </div>
            </li>)}
          </ul>
          {!entries.length && <p class="playgrounds-empty">Save the current playground to pick up where you left off.</p>}
        </div>
        <footer class="playgrounds-footer">
          <input type="file" ref={importRef} accept=".json,application/json" hidden onChange={(event) => { void importFile(event.currentTarget.files?.[0]); }} />
          <button type="button" class="playgrounds-button" onClick={() => importRef.current?.click()}>Import</button>
          <button type="button" class="playgrounds-button" onClick={exportCurrent}>Export current</button>
          {entries.length > 0 && <button type="button" class="playgrounds-button" onClick={() => {
            try { downloadText(exportBackup(readLibrary(window.localStorage)), "tryjs-playgrounds.json"); trackEvent("playground_backup_exported", { scope: "all" }); }
            catch (cause) { setError(cause instanceof Error ? cause.message : "Backup could not be exported."); }
          }}>Export all</button>}
          {readLocal(PREVIOUS_PLAYGROUND_KEY) && <button type="button" class="playgrounds-button playgrounds-recover" onClick={recover}>Previous draft</button>}
        </footer>
      </div>
    </dialog>
  );
}
