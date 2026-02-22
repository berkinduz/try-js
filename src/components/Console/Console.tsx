import { useRef, useEffect } from "preact/hooks";
import { consoleOutput, clearConsole } from "../../state/console";
import { ConsoleEntry } from "./ConsoleEntry";
import "./Console.css";

export function Console() {
  const listRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  const entries = consoleOutput.value;

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    const el = listRef.current;
    if (el && autoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries.length]);

  // Track if user scrolled away from bottom
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    autoScrollRef.current = atBottom;
  };

  return (
    <div class="console-panel">
      <div class="console-header">
        <span class="console-header__title">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
            <path d="M2 3l5 4-5 4V3zm6 8h6v1H8v-1z"/>
          </svg>
          Console
        </span>
        <button
          type="button"
          class="console-header__clear"
          onClick={clearConsole}
          title="Clear console (Ctrl+L / ⌘+L)"
          aria-label="Clear console"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6" />
            <line x1="5" y1="5" x2="11" y2="11" />
          </svg>
        </button>
      </div>
      <div class="console-list" ref={listRef} onScroll={onScroll}>
        {entries.length === 0 ? (
          <div class="console-empty">
            <span class="console-empty__prompt">{">"}</span>
            <span class="console-empty__text">
              Output from <kbd>console.log</kbd>, errors, and timers will appear here
            </span>
          </div>
        ) : (
          entries.map((entry) => (
            <ConsoleEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
