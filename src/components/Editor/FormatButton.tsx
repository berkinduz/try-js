import { formatActiveEditor, formatting, formatShortcutLabel } from "./formatting";
import "./FormatButton.css";

export function FormatButton() {
  const isFormatting = formatting.value;

  return (
    <button
      type="button"
      class="format-code-button"
      onClick={formatActiveEditor}
      disabled={isFormatting}
      aria-label="Format code"
      aria-busy={isFormatting}
      aria-keyshortcuts="Alt+Shift+F"
      title={`Format code (${formatShortcutLabel})`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m7 4-4 4 4 4m10 0 4 4-4 4M11 5h10M11 8h7M3 16h10M6 19h7" />
      </svg>
      <span>{isFormatting ? "Formatting…" : "Format"}</span>
    </button>
  );
}
