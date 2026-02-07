export type SerializedValue =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "null" }
  | { type: "undefined" }
  | { type: "object"; value: string; preview: string }
  | { type: "array"; value: string; length: number }
  | { type: "function"; name: string }
  | { type: "symbol"; description: string }
  | { type: "error"; message: string; stack?: string }
  | { type: "bigint"; value: string }
  | { type: "circular" };

export function formatValue(val: SerializedValue): string {
  switch (val.type) {
    case "string":
      return val.value;
    case "number":
    case "boolean":
      return String(val.value);
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "object":
      return val.value;
    case "array":
      return val.value;
    case "function":
      return `[Function: ${val.name || "anonymous"}]`;
    case "symbol":
      return `Symbol(${val.description})`;
    case "error":
      return val.message;
    case "bigint":
      return `${val.value}n`;
    case "circular":
      return "[Circular]";
  }
}

export function getValueClass(val: SerializedValue): string {
  switch (val.type) {
    case "string":
      return "val-string";
    case "number":
    case "bigint":
      return "val-number";
    case "boolean":
      return "val-boolean";
    case "null":
    case "undefined":
      return "val-null";
    case "function":
      return "val-function";
    case "error":
      return "val-error";
    default:
      return "val-object";
  }
}
