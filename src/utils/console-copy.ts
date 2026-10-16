import type { OutputEntry } from "../state/console";
import { formatValue } from "./format.ts";
import type { SerializedValue } from "./format.ts";

function errorText(message: string, stack?: string): string {
  if (!stack) return message;
  return stack.split("\n", 1)[0].includes(message) ? stack : `${message}\n${stack}`;
}

function collectionText(name: string, size: number, items: string[]): string {
  if (items.length < size) items.push("[Entries unavailable]");
  return `${name}(${size}) {${items.length ? ` ${items.join(", ")} ` : ""}}`;
}

function valueText(value: SerializedValue, nested = false): string {
  switch (value.type) {
    case "string":
      return nested ? JSON.stringify(value.value) : value.value;
    case "object":
    case "array":
      // Copy the captured representation verbatim, including serialization limits
      // such as [Object] or [Array]. It is output text, not a JSON export.
      return typeof value.value === "string" ? value.value : "[Value unavailable]";
    case "map":
      return collectionText("Map", value.size, (value.entries ?? []).map(
        (entry) => `${valueText(entry.key, true)} => ${valueText(entry.value, true)}`,
      ));
    case "set":
      return collectionText("Set", value.size, (value.items ?? []).map((item) => valueText(item, true)));
    case "error":
      return errorText(value.message, value.stack);
    default:
      return formatValue(value);
  }
}

/** Plain text from the stored console snapshot, independent of inspector expansion. */
export function consoleEntryText(entry: OutputEntry): string {
  if (entry.kind === "console") {
    return entry.args.map((arg) => valueText(arg)).join(" ");
  }

  const line = entry.location?.line ?? entry.lineno;
  const column = entry.location?.column ?? entry.colno;
  const location = line != null || column != null
    ? ` (line ${line ?? "?"}, column ${column ?? "?"})`
    : "";
  return [entry.message + location, entry.stack].filter(Boolean).join("\n");
}
