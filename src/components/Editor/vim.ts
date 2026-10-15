import { effect } from "@preact/signals";
import { Compartment } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";
import { vimEnabled, setVimEnabled } from "../../state/settings";
import { saveDraft } from "../../state/editor";
import { showToast } from "../Toast/Toast";

let modulePromise: Promise<typeof import("@replit/codemirror-vim")> | undefined;
function loadVim() {
  return modulePromise ??= import("@replit/codemirror-vim").then((module) => {
    module.Vim.defineEx("write", "w", () => { saveDraft(); });
    return module;
  }).catch((error) => {
    modulePromise = undefined;
    throw error;
  });
}

/** Load only when enabled; each editor has its own compartment and lifecycle. */
export function optionalVim() {
  const compartment = new Compartment();
  return [compartment.of([]), ViewPlugin.define((view) => {
    let destroyed = false;
    let generation = 0;
    const stop = effect(() => {
      const enabled = vimEnabled.value;
      const current = ++generation;
      queueMicrotask(async () => {
        try {
          const extension = enabled ? (await loadVim()).vim({ status: true }) : [];
          if (!destroyed && current === generation) view.dispatch({ effects: compartment.reconfigure(extension) });
        } catch {
          if (destroyed || current !== generation) return;
          setVimEnabled(false);
          showToast("Vim mode could not load. Standard editing is still available.", "error");
        }
      });
    });
    return { destroy() { destroyed = true; stop(); } };
  })];
}
