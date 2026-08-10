// Injected into the Web and React preview iframes before console interception.
// Keep this script dependency-free because it runs inside a sandboxed browser realm.
export const PREVIEW_CONSOLE_FORMATTER = `
  var maxConsoleDepth = 4;

  function safeString(value) {
    try {
      return String(value);
    } catch (e) {
      return "[Unformattable]";
    }
  }

  function formatConsoleValue(value, depth, seen) {
    if (value === null) return "null";

    var type = typeof value;
    if (type === "string") return JSON.stringify(value);
    if (type !== "object") return safeString(value);
    if (seen.indexOf(value) !== -1) return "[Circular]";
    if (depth >= maxConsoleDepth) return "[Max Depth]";

    seen.push(value);
    try {
      if (typeof value.toJSON === "function") {
        try {
          return formatConsoleValue(value.toJSON(), depth + 1, seen);
        } catch (e) {
          return "[Thrown]";
        }
      }

      if (value instanceof Map) {
        var mapEntries = [];
        value.forEach(function(entryValue, key) {
          mapEntries.push(
            formatConsoleValue(key, depth + 1, seen) +
            " => " +
            formatConsoleValue(entryValue, depth + 1, seen)
          );
        });
        return "Map(" + value.size + ") {" +
          (mapEntries.length ? " " + mapEntries.join(", ") + " " : "") +
          "}";
      }

      if (value instanceof Set) {
        var setItems = [];
        value.forEach(function(item) {
          setItems.push(formatConsoleValue(item, depth + 1, seen));
        });
        return "Set(" + value.size + ") {" +
          (setItems.length ? " " + setItems.join(", ") + " " : "") +
          "}";
      }

      if (Array.isArray(value)) {
        return "[" + value.map(function(item) {
          return formatConsoleValue(item, depth + 1, seen);
        }).join(", ") + "]";
      }

      var properties = Object.keys(value).map(function(key) {
        var propertyValue;
        try {
          propertyValue = formatConsoleValue(value[key], depth + 1, seen);
        } catch (e) {
          propertyValue = "[Thrown]";
        }
        return JSON.stringify(key) + ": " + propertyValue;
      });
      return "{" + (properties.length ? " " + properties.join(", ") + " " : "") + "}";
    } finally {
      seen.pop();
    }
  }

  function formatConsoleArg(value) {
    try {
      if (typeof value !== "object") return safeString(value);
      if (value instanceof Map || value instanceof Set) {
        return formatConsoleValue(value, 0, []);
      }

      try {
        var json = JSON.stringify(value, null, 2);
        if (typeof json === "string") return json;
      } catch (e) {
        // Fall through to the circular/depth-safe formatter.
      }
      return formatConsoleValue(value, 0, []);
    } catch (e) {
      return safeString(value);
    }
  }
`;
