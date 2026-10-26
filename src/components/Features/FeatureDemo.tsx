import type { ComponentChildren } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { FEATURE_DEMOS } from "../../data/feature-demos";
import type { FeatureSection } from "../../data/features";
import { FEATURE_DEMO_IDS, isFeatureDemoActivity } from "../../utils/feature-demo-context";
import type { FeatureDemoId } from "../../utils/feature-demo-context";
import { trackEvent, trackFeaturesPlaygroundClick } from "../../utils/analytics";
import { encodeToHash } from "../../utils/share";
import { playgroundPath } from "../../utils/playground";

export function FeatureDemo({ section, fallback }: {
  section: FeatureSection;
  fallback: ComponentChildren;
}) {
  const [selected, setSelected] = useState<FeatureDemoId>("check-code");
  const [enabled, setEnabled] = useState(false);
  const [revision, setRevision] = useState(0);
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [slowFor, setSlowFor] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const demo = FEATURE_DEMOS[selected];
  const key = `${selected}:${revision}`;
  const ready = readyFor === key;
  const hash = encodeToHash(demo.state);
  const fullUrl = `${playgroundPath(demo.state)}${hash}`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setEnabled(true);
      observer.disconnect();
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!enabled) return;
    const timeout = window.setTimeout(() => setSlowFor(key), 20_000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin ||
          event.source !== frameRef.current?.contentWindow ||
          !isFeatureDemoActivity(event.data, selected)) return;
      if (event.data.action === "loaded") {
        window.clearTimeout(timeout);
        setReadyFor(key);
      } else {
        trackFeaturesPlaygroundClick(playgroundPath(demo.state), "use-case");
      }
    };
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [enabled, key, selected]);

  const choose = (id: FeatureDemoId) => {
    if (id === selected) return;
    setSelected(id);
    setRevision(0);
    setReadyFor(null);
    setSlowFor(null);
    trackEvent("features_demo_selected", { demo: id });
  };

  return (
    <section class="features-use-cases" id={section.id}
      aria-labelledby={`${section.id}-heading`} ref={sectionRef}>
      <div class="features-section-heading">
        <h2 id={`${section.id}-heading`}>{section.title}</h2>
        <p>{section.summary}</p>
      </div>
      <div class="features-demo-choices" role="group" aria-label="Choose a live demo">
        {section.details.map((detail, index) => {
          const id = FEATURE_DEMO_IDS[index];
          return (
            <article class="features-demo-choice" key={id} data-demo={id}>
              <h3>
                <button type="button" aria-pressed={selected === id}
                  aria-controls="features-demo-stage" disabled={!enabled}
                  onClick={() => choose(id)}>
                  <span class="features-demo-badge" aria-hidden="true">{FEATURE_DEMOS[id].badge}</span>
                  {detail.title}
                </button>
              </h3>
              <p>{detail.description}</p>
            </article>
          );
        })}
      </div>
      <div class="features-demo">
        <div class="features-demo__instruction">
          <p aria-live="polite">{demo.instruction}</p>
          <button type="button" disabled={!enabled} onClick={() => {
            setReadyFor(null);
            setSlowFor(null);
            setRevision((value) => value + 1);
          }}>Reset</button>
        </div>
        <div class="features-demo__stage" id="features-demo-stage" aria-busy={enabled && !ready}>
          {enabled ? (
            <iframe key={key} ref={frameRef}
              title={`${section.details[FEATURE_DEMO_IDS.indexOf(selected)].title} — live TryJS playground`}
              src={`/embed?demo=${selected}${hash}`} loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox" />
          ) : (
            <div class="features-demo__fallback">{fallback}</div>
          )}
        </div>
      </div>
      <p class="features-demo__note">
        Your drafts stay yours. <strong>Open in TryJS</strong> keeps your demo edits.
      </p>
      {!ready && (
        <p class="features-demo__fallback-link">
          {enabled ? (slowFor === key ? "Taking longer than usual. " : "Loading the playground… ") : "Prefer the full editor? "}
          <a href={fullUrl} target="_blank" rel="noopener noreferrer"
            onClick={() => trackFeaturesPlaygroundClick(playgroundPath(demo.state), "use-case")}>
            Open this example in TryJS
          </a>
        </p>
      )}
    </section>
  );
}
