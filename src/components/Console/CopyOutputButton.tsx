import { showToast } from "../Toast/Toast";
import "./CopyOutputButton.css";

export function CopyOutputButton({ getText }: { getText: () => string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      showToast("Output copied", "success", 1500);
    } catch {
      showToast("Could not copy output. Select the text and copy it manually.", "error", 4500);
    }
  };

  return <button
    type="button"
    class="console-copy"
    aria-label="Copy output"
    title="Copy output as text"
    onClick={copy}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    Copy
  </button>;
}
