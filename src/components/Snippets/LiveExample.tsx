import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import type { Example } from "../../data/examples";
import { isExampleActivity } from "../../utils/example-context";
import { trackExampleActivity } from "../../utils/analytics";
import { encodeToHash } from "../../utils/share";
import { playgroundPath } from "../../utils/playground";

export function LiveExample({ example }: { example: Example }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [revision, setRevision] = useState(0);
  const hash = encodeToHash(example.state);
  const fullUrl = `${playgroundPath(example.state)}${hash}`;

  useEffect(() => {
    setEnabled(true);
  }, []);
  useLayoutEffect(() => {
    let edited = false;
    setReady(false);
    setSlow(false);
    const timeout = window.setTimeout(() => setSlow(true), 20_000);
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        !isExampleActivity(event.data, example.slug)
      )
        return;
      const action = event.data.action;
      if (action === "activated" && !edited) return;
      if (action === "edited") edited = true;
      if (action === "loaded") {
        setReady(true);
        setSlow(false);
        window.clearTimeout(timeout);
      }
      trackExampleActivity(action, example.slug, "inline");
    };
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [example.slug, revision]);

  return (
    <section class="example-live" aria-label="Live example">
      <div class="example-live__bar">
        <span>
          <span class={`example-live__dot ${ready ? "is-ready" : ""}`} />
          {ready ? "Live playground" : "Loading playground…"}
        </span>
        <button
          type="button"
          class="examples-text-button"
          onClick={() => setRevision((value) => value + 1)}
          title="Restore the original example code"
        >
          Reset example ↻
        </button>
      </div>
      <div
        class={`example-live__frame ${example.state.mode === "web" || example.state.mode === "react" ? "example-live__frame--visual" : ""}`}
      >
        {enabled ? (
          <iframe
            key={`${example.slug}:${revision}`}
            ref={frameRef}
            title={`${example.title} — editable playground`}
            src={`/embed?example=${example.slug}${hash}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <div class="example-live__fallback">
            <p>The live editor loads here with JavaScript enabled.</p>
            <a href={fullUrl}>Run in Playground ↗</a>
            <p>The original source and explanation are available below.</p>
          </div>
        )}
      </div>
      {slow && !ready && (
        <p class="example-live__slow" role="status">
          Taking longer than usual.{" "}
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackExampleActivity("opened", example.slug, "inline")
            }
          >
            Open in the full playground ↗
          </a>{" "}
          or reset the example to retry.
        </p>
      )}
      <p class="example-live__note">
        Changes here stay separate from your main playground. Use{" "}
        <strong>Open in TryJS</strong> inside the editor to keep working with
        your changes.
      </p>
    </section>
  );
}
