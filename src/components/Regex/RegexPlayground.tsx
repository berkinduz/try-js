import { useState, useMemo, useCallback } from "preact/hooks";
import { explainRegex } from "./regexExplain";

const ALL_FLAGS = [
  { flag: "g", label: "g", title: "Global — find all matches" },
  { flag: "i", label: "i", title: "Case-insensitive" },
  { flag: "m", label: "m", title: "Multiline — ^ and $ match line boundaries" },
  { flag: "s", label: "s", title: "Dotall — . matches newline" },
  { flag: "u", label: "u", title: "Unicode — enable full Unicode matching" },
  { flag: "d", label: "d", title: "Indices — include match indices" },
] as const;

interface Match {
  value: string;
  index: number;
  groups: string[];
  indices?: [number, number];
}

interface Props {
  initialPattern?: string;
  initialFlags?: string;
  initialTestInput?: string;
}

export function RegexPlayground({
  initialPattern = "",
  initialFlags = "g",
  initialTestInput = "",
}: Props) {
  const [pattern, setPattern] = useState(initialPattern);
  const [flags, setFlags] = useState(initialFlags);
  const [testInput, setTestInput] = useState(initialTestInput);
  const [showExplain, setShowExplain] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches" | "table">("matches");

  const toggleFlag = useCallback(
    (f: string) => {
      setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
    },
    []
  );

  // Build regex and find matches
  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] as Match[] };
    try {
      const re = new RegExp(pattern, flags);
      const results: Match[] = [];

      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        re.lastIndex = 0;
        while ((m = re.exec(testInput)) !== null && safety++ < 500) {
          results.push({
            value: m[0],
            index: m.index,
            groups: m.slice(1),
            indices: [m.index, m.index + m[0].length],
          });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const m = re.exec(testInput);
        if (m) {
          results.push({
            value: m[0],
            index: m.index,
            groups: m.slice(1),
            indices: [m.index, m.index + m[0].length],
          });
        }
      }

      return { regex: re, error: null, matches: results };
    } catch (e: any) {
      return { regex: null, error: e.message as string, matches: [] as Match[] };
    }
  }, [pattern, flags, testInput]);

  // Build highlighted text
  const highlighted = useMemo(() => {
    if (!matches.length || !testInput) return null;

    const parts: { text: string; isMatch: boolean }[] = [];
    let lastEnd = 0;

    // Sort matches by index to handle properly
    const sorted = [...matches].sort((a, b) => a.index - b.index);

    for (const m of sorted) {
      if (m.index > lastEnd) {
        parts.push({ text: testInput.slice(lastEnd, m.index), isMatch: false });
      }
      if (m.index >= lastEnd) {
        parts.push({ text: m.value, isMatch: true });
        lastEnd = m.index + m.value.length;
      }
    }

    if (lastEnd < testInput.length) {
      parts.push({ text: testInput.slice(lastEnd), isMatch: false });
    }

    return parts;
  }, [matches, testInput]);

  // Explain tokens
  const tokens = useMemo(() => {
    if (!pattern || !showExplain) return [];
    return explainRegex(pattern);
  }, [pattern, showExplain]);

  return (
    <div class="regex-playground__editor-wrap">
      {/* Flags toolbar */}
      <div class="regex-playground__toolbar">
        <span class="regex-playground__toolbar-label">Flags</span>
        <div class="regex-flags">
          {ALL_FLAGS.map((f) => (
            <button
              key={f.flag}
              type="button"
              class={`regex-flag-btn ${flags.includes(f.flag) ? "regex-flag-btn--active" : ""}`}
              onClick={() => toggleFlag(f.flag)}
              title={f.title}
              aria-pressed={flags.includes(f.flag)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern input */}
      <div class="regex-pattern-row">
        <span class="regex-pattern-slash">/</span>
        <input
          type="text"
          class="regex-pattern-input"
          value={pattern}
          onInput={(e) => setPattern((e.target as HTMLInputElement).value)}
          placeholder="Enter regex pattern..."
          spellcheck={false}
          autocomplete="off"
          autocapitalize="off"
        />
        <span class="regex-pattern-flags-display">/{flags || " "}</span>
      </div>

      {/* Error */}
      {error && <div class="regex-error">{error}</div>}

      {/* Test input */}
      <div class="regex-test-area">
        <label>Test String</label>
        <textarea
          class="regex-test-input"
          value={testInput}
          onInput={(e) => setTestInput((e.target as HTMLTextAreaElement).value)}
          placeholder="Type or paste text to test against the regex..."
          spellcheck={false}
        />
      </div>

      {/* Results */}
      {pattern && testInput && !error && (
        <div class="regex-results">
          <div class="regex-results__header">
            <span class="regex-results__title">Results</span>
            <span class="regex-results__count">
              <strong>{matches.length}</strong> match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>

          {/* Tabs */}
          <div class="regex-tabs">
            <button
              type="button"
              class={`regex-tab ${activeTab === "matches" ? "regex-tab--active" : ""}`}
              onClick={() => setActiveTab("matches")}
            >
              Highlighted
            </button>
            <button
              type="button"
              class={`regex-tab ${activeTab === "table" ? "regex-tab--active" : ""}`}
              onClick={() => setActiveTab("table")}
            >
              Match Details
            </button>
          </div>

          {activeTab === "matches" && (
            <div style={{ marginTop: "10px" }}>
              {highlighted ? (
                <div class="regex-highlighted">
                  {highlighted.map((part, i) =>
                    part.isMatch ? (
                      <mark key={i} class="regex-match">
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )}
                </div>
              ) : (
                <p class="regex-no-match">No matches found.</p>
              )}
            </div>
          )}

          {activeTab === "table" && (
            <div class="regex-match-details" style={{ marginTop: "10px" }}>
              {matches.length === 0 ? (
                <p class="regex-no-match">No matches found.</p>
              ) : (
                <table class="regex-match-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Match</th>
                      <th>Index</th>
                      {matches.some((m) => m.groups.length > 0) && <th>Groups</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, i) => (
                      <tr key={i}>
                        <td class="regex-match-table__index">{i + 1}</td>
                        <td class="regex-match-table__value">"{m.value}"</td>
                        <td>{m.indices ? `${m.indices[0]}–${m.indices[1]}` : m.index}</td>
                        {matches.some((m) => m.groups.length > 0) && (
                          <td class="regex-match-table__group">
                            {m.groups.length > 0
                              ? m.groups.map((g, gi) => (
                                  <span key={gi}>
                                    {gi > 0 ? ", " : ""}${gi + 1}: "{g ?? "undefined"}"
                                  </span>
                                ))
                              : "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions: Explain toggle */}
      <div class="regex-playground__actions">
        <button
          type="button"
          class={`regex-explain-btn ${showExplain ? "regex-explain-btn--active" : ""}`}
          onClick={() => setShowExplain((v) => !v)}
          disabled={!pattern}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Explain Regex
        </button>
      </div>

      {/* Explain mode */}
      {showExplain && tokens.length > 0 && (
        <div class="regex-explain">
          <div class="regex-explain__title">Pattern Breakdown</div>
          <ul class="regex-explain__list">
            {tokens.map((t, i) => (
              <li key={i} class="regex-explain__item">
                <span class="regex-explain__token">{t.token}</span>
                <span class="regex-explain__desc">{t.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
