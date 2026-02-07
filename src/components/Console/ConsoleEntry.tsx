import type { OutputEntry } from "../../state/console";
import { formatValue, getValueClass } from "../../utils/format";
import type { SerializedValue } from "../../utils/format";

interface Props {
  entry: OutputEntry;
}

const METHOD_ICONS: Record<string, string> = {
  log: "",
  info: "ℹ",
  warn: "⚠",
  error: "✕",
  table: "▦",
  result: "←",
};

function renderValue(val: SerializedValue, index: number) {
  const text = formatValue(val);
  const cls = getValueClass(val);

  if (val.type === "object" || val.type === "array") {
    return (
      <pre key={index} class={`console-value ${cls}`}>
        {text}
      </pre>
    );
  }

  return (
    <span key={index} class={`console-value ${cls}`}>
      {text}
    </span>
  );
}

function renderTable(args: SerializedValue[]) {
  // Try to parse the first argument as array of objects for table display
  if (args.length === 0) return null;
  const first = args[0];
  if (first.type !== "array" && first.type !== "object") {
    return <div class="console-args">{args.map(renderValue)}</div>;
  }

  try {
    const data = JSON.parse(first.value);
    if (!Array.isArray(data) || data.length === 0) {
      return <pre class="console-value val-object">{first.value}</pre>;
    }

    const allKeys = new Set<string>();
    data.forEach((row: Record<string, unknown>) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((k) => allKeys.add(k));
      }
    });
    const keys = Array.from(allKeys);

    if (keys.length === 0) {
      return <pre class="console-value val-object">{first.value}</pre>;
    }

    return (
      <table class="console-table">
        <thead>
          <tr>
            <th>(index)</th>
            {keys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: Record<string, unknown>, i: number) => (
            <tr key={i}>
              <td>{i}</td>
              {keys.map((k) => (
                <td key={k}>{row && typeof row === "object" ? String(row[k] ?? "") : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch {
    return <pre class="console-value val-object">{first.value}</pre>;
  }
}

export function ConsoleEntry({ entry }: Props) {
  if (entry.kind === "error") {
    const location =
      entry.lineno != null || entry.colno != null
        ? ` (line ${entry.lineno ?? "?"}, column ${entry.colno ?? "?"})`
        : "";
    return (
      <div class="console-entry console-entry--error">
        <span class="console-icon">✕</span>
        <div class="console-content">
          <span class="console-message">{entry.message}{location}</span>
          {entry.stack && (
            <pre class="console-stack">{entry.stack}</pre>
          )}
        </div>
      </div>
    );
  }

  const method = entry.method;
  const icon = METHOD_ICONS[method] || "";

  if (method === "table") {
    return (
      <div class={`console-entry console-entry--${method}`}>
        {icon && <span class="console-icon">{icon}</span>}
        <div class="console-content">{renderTable(entry.args)}</div>
      </div>
    );
  }

  return (
    <div class={`console-entry console-entry--${method}`}>
      {icon && <span class="console-icon">{icon}</span>}
      <div class="console-content console-args">
        {entry.args.map(renderValue)}
      </div>
    </div>
  );
}
