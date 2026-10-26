import { capturePlayground } from "../../state/editor";
import { shareUrl } from "../../utils/share";
import { useEffect } from "preact/hooks";
import { reportExampleActivity } from "../../utils/example-context";
import { ExternalArrow } from "../Snippets/ExternalArrow";
import { reportFeatureDemoActivity } from "../../utils/feature-demo-context";

export function EmbedOpenLink() {
  useEffect(() => { reportExampleActivity("loaded"); reportFeatureDemoActivity("loaded"); }, []);
  let url: string;
  try { url = shareUrl(capturePlayground(), window.location.origin); }
  catch { return null; }
  return <a class="embed-open-link" href={url} target="_blank" rel="noopener noreferrer" onClick={() => { reportExampleActivity("opened"); reportFeatureDemoActivity("opened"); }}>Open in TryJS <ExternalArrow /></a>;
}
