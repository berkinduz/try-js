import { useState } from "preact/hooks";
import type { SerializedValue } from "../../utils/format";
import { formatValue, getValueClass } from "../../utils/format";

interface Props {
  value: SerializedValue;
}

function Primitive({ val }: { val: SerializedValue }) {
  const cls = getValueClass(val);
  if (val.type === "string") {
    return <span class={`oi-value ${cls}`}>"{val.value}"</span>;
  }
  return <span class={`oi-value ${cls}`}>{formatValue(val)}</span>;
}

export function ObjectInspector({ value }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (value.type === "object") {
    const entries = value.entries || [];
    const isEmpty = entries.length === 0;

    if (!expanded) {
      return (
        <span class="object-inspector">
          <button
            type="button"
            class="oi-toggle"
            onClick={() => setExpanded(true)}
            aria-label="Expand object"
          >
            ▶
          </button>
          <span class="oi-preview">
            {isEmpty ? "Object {}" : `Object ${value.preview}`}
          </span>
        </span>
      );
    }

    return (
      <span class="object-inspector">
        <button
          type="button"
          class="oi-toggle"
          onClick={() => setExpanded(false)}
          aria-label="Collapse object"
        >
          ▼
        </button>
        <span class="oi-bracket">{"{"}</span>
        <div class="oi-children">
          {entries.map((entry) => (
            <div class="oi-node" key={entry.key}>
              <span class="oi-key">{entry.key}</span>
              <span class="oi-colon">: </span>
              <ObjectInspector value={entry.value} />
            </div>
          ))}
        </div>
        <span class="oi-bracket">{"}"}</span>
      </span>
    );
  }

  if (value.type === "array") {
    const items = value.items || [];
    const isEmpty = items.length === 0;

    if (!expanded) {
      return (
        <span class="object-inspector">
          <button
            type="button"
            class="oi-toggle"
            onClick={() => setExpanded(true)}
            aria-label="Expand array"
          >
            ▶
          </button>
          <span class="oi-preview">
            {isEmpty ? "Array(0) []" : `Array(${value.length})`}
          </span>
        </span>
      );
    }

    return (
      <span class="object-inspector">
        <button
          type="button"
          class="oi-toggle"
          onClick={() => setExpanded(false)}
          aria-label="Collapse array"
        >
          ▼
        </button>
        <span class="oi-bracket">{"["}</span>
        <div class="oi-children">
          {items.map((item, index) => (
            <div class="oi-node" key={String(index)}>
              <span class="oi-index">{index}</span>
              <span class="oi-colon">: </span>
              <ObjectInspector value={item} />
            </div>
          ))}
        </div>
        <span class="oi-bracket">{"]"}</span>
      </span>
    );
  }

  if (value.type === "map") {
    const entries = value.entries || [];

    if (!expanded) {
      return (
        <span class="object-inspector">
          <button
            type="button"
            class="oi-toggle"
            onClick={() => setExpanded(true)}
            aria-label="Expand map"
          >
            ▶
          </button>
          <span class="oi-preview">Map({value.size})</span>
        </span>
      );
    }

    return (
      <span class="object-inspector">
        <button
          type="button"
          class="oi-toggle"
          onClick={() => setExpanded(false)}
          aria-label="Collapse map"
        >
          ▼
        </button>
        <span class="oi-preview">Map({value.size}) </span>
        <span class="oi-bracket">{"{"}</span>
        <div class="oi-children">
          {entries.map((entry, index) => (
            <div class="oi-node" key={String(index)}>
              <ObjectInspector value={entry.key} />
              <span class="oi-colon"> =&gt; </span>
              <ObjectInspector value={entry.value} />
            </div>
          ))}
        </div>
        <span class="oi-bracket">{"}"}</span>
      </span>
    );
  }

  if (value.type === "set") {
    const items = value.items || [];

    if (!expanded) {
      return (
        <span class="object-inspector">
          <button
            type="button"
            class="oi-toggle"
            onClick={() => setExpanded(true)}
            aria-label="Expand set"
          >
            ▶
          </button>
          <span class="oi-preview">Set({value.size})</span>
        </span>
      );
    }

    return (
      <span class="object-inspector">
        <button
          type="button"
          class="oi-toggle"
          onClick={() => setExpanded(false)}
          aria-label="Collapse set"
        >
          ▼
        </button>
        <span class="oi-preview">Set({value.size}) </span>
        <span class="oi-bracket">{"{"}</span>
        <div class="oi-children">
          {items.map((item, index) => (
            <div class="oi-node" key={String(index)}>
              <ObjectInspector value={item} />
            </div>
          ))}
        </div>
        <span class="oi-bracket">{"}"}</span>
      </span>
    );
  }

  return <Primitive val={value} />;
}
