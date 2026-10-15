import { capturePlayground } from "../../state/editor";
import { shareUrl } from "../../utils/share";

export function EmbedOpenLink() {
  let url: string;
  try { url = shareUrl(capturePlayground(), window.location.origin); }
  catch { return null; }
  return <a class="embed-open-link" href={url} target="_blank" rel="noopener noreferrer">Open in TryJS</a>;
}
