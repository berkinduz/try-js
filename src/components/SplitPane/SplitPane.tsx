import { useRef } from "preact/hooks";
import { splitRatio, setSplitRatio } from "../../state/settings";
import { MIN_PANE_SIZE } from "../../utils/constants";
import "./SplitPane.css";

interface Props {
  left: preact.ComponentChildren;
  right: preact.ComponentChildren;
}

export function SplitPane({ left, right }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onPointerDown = (e: PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minRatio = MIN_PANE_SIZE / rect.width;
    const maxRatio = 1 - minRatio;
    const newRatio = (e.clientX - rect.left) / rect.width;
    setSplitRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)));
  };

  const onPointerUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const ratio = splitRatio.value;

  return (
    <div class="split-pane" ref={containerRef}>
      <div class="split-pane__left" style={{ flexBasis: `${ratio * 100}%` }}>
        {left}
      </div>
      <div
        class="split-pane__divider"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div class="split-pane__divider-line" />
      </div>
      <div class="split-pane__right" style={{ flexBasis: `${(1 - ratio) * 100}%` }}>
        {right}
      </div>
    </div>
  );
}
