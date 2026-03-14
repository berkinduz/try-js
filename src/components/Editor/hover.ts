/**
 * Hover-tooltip extension for the TryJS editor.
 *
 * Shows type information when the user hovers over identifiers,
 * powered by the TypeScript Language Service.
 */

import { hoverTooltip } from "@codemirror/view";
import type { EditorView, Tooltip } from "@codemirror/view";
import { getHoverInfo } from "../../sandbox/ts-completions";

/**
 * CodeMirror extension that displays type info on hover.
 * Only activates when the TypeScript compiler has been loaded.
 */
export const tsHoverTooltip = hoverTooltip(
  async (view: EditorView, pos: number): Promise<Tooltip | null> => {
    // Don't attempt if TS isn't loaded yet
    if (!(window as any).ts) return null;

    const source = view.state.doc.toString();
    const info = await getHoverInfo(source, pos);

    if (!info) return null;

    return {
      pos: info.from,
      end: info.to,
      above: true,
      create() {
        const dom = document.createElement("div");
        dom.className = "cm-hover-tooltip";

        const parts = info.text.split("\n\n");

        // Type signature
        if (parts[0]) {
          const sig = document.createElement("div");
          sig.className = "cm-hover-sig";
          sig.textContent = parts[0];
          dom.appendChild(sig);
        }

        // Documentation (if present)
        if (parts[1]) {
          const doc = document.createElement("div");
          doc.className = "cm-hover-doc";
          doc.textContent = parts[1];
          dom.appendChild(doc);
        }

        return { dom };
      },
    };
  },
  { hoverTime: 350 },
);
