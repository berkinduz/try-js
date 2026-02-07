// This file is converted to a string and injected into the sandboxed iframe.
// It intercepts console.* calls and errors, sending them to the parent via postMessage.

export const SANDBOX_BOOTSTRAP = `
(function() {
  var _timers = {};

  // Exposed globally so the result capture code can use it
  window.__jspark_serialize = serialize;

  function serialize(val, depth, seen) {
    if (depth === undefined) depth = 0;
    if (seen === undefined) seen = new WeakSet();
    if (depth > 5) return { type: "string", value: "[Max depth]" };

    if (val === null) return { type: "null" };
    if (val === undefined) return { type: "undefined" };

    var t = typeof val;

    if (t === "string") return { type: "string", value: val };
    if (t === "number") return { type: "number", value: val };
    if (t === "boolean") return { type: "boolean", value: val };
    if (t === "bigint") return { type: "bigint", value: val.toString() };
    if (t === "symbol") return { type: "symbol", description: val.description || "" };
    if (t === "function") return { type: "function", name: val.name || "anonymous" };

    if (t === "object") {
      if (val instanceof Error) {
        return { type: "error", message: val.message, stack: val.stack };
      }

      if (seen.has(val)) return { type: "circular" };
      seen.add(val);

      if (Array.isArray(val)) {
        try {
          var items = val.map(function(item) { return serialize(item, depth + 1, seen); });
          return {
            type: "array",
            value: JSON.stringify(val, null, 2),
            length: val.length
          };
        } catch(e) {
          return { type: "array", value: "[Array]", length: val.length };
        }
      }

      try {
        var preview = Object.keys(val).slice(0, 5).join(", ");
        return {
          type: "object",
          value: JSON.stringify(val, null, 2),
          preview: "{ " + preview + (Object.keys(val).length > 5 ? ", ..." : "") + " }"
        };
      } catch(e) {
        return { type: "object", value: "[Object]", preview: "[Object]" };
      }
    }

    return { type: "string", value: String(val) };
  }

  var methods = ["log", "warn", "error", "info", "table", "clear", "time", "timeEnd"];

  methods.forEach(function(method) {
    var original = console[method];
    console[method] = function() {
      var args = Array.prototype.slice.call(arguments);

      if (method === "clear") {
        parent.postMessage({ source: "jspark", type: "console", method: "clear", args: [] }, "*");
        return;
      }

      if (method === "time") {
        _timers[args[0] || "default"] = performance.now();
        return;
      }

      if (method === "timeEnd") {
        var label = args[0] || "default";
        var start = _timers[label];
        if (start !== undefined) {
          var elapsed = performance.now() - start;
          delete _timers[label];
          parent.postMessage({
            source: "jspark",
            type: "console",
            method: "log",
            args: [{ type: "string", value: label + ": " + elapsed.toFixed(3) + "ms" }]
          }, "*");
        }
        return;
      }

      var serialized = args.map(function(a) { return serialize(a, 0); });

      parent.postMessage({
        source: "jspark",
        type: "console",
        method: method,
        args: serialized
      }, "*");

      if (original) original.apply(console, args);
    };
  });

  function sendDone(executionTime) {
    parent.postMessage({
      source: "jspark",
      type: "done",
      executionTime: typeof executionTime === "number" ? executionTime : 0
    }, "*");
  }

  window.onerror = function(message, source, lineno, colno, error) {
    parent.postMessage({
      source: "jspark",
      type: "error",
      errorType: "error",
      message: String(message),
      stack: error ? error.stack : undefined,
      lineno: lineno,
      colno: colno
    }, "*");
    sendDone(0);
    return true;
  };

  window.addEventListener("unhandledrejection", function(event) {
    parent.postMessage({
      source: "jspark",
      type: "error",
      errorType: "unhandledrejection",
      message: event.reason ? String(event.reason) : "Unhandled Promise Rejection",
      stack: event.reason && event.reason.stack ? event.reason.stack : undefined
    }, "*");
    sendDone(0);
  });

  window.addEventListener("message", function(e) {
    if (!e.data || e.data.source !== "jspark" || e.data.type !== "run") return;
    var code = e.data.code;
    try {
      eval(code);
    } catch (err) {
      parent.postMessage({
        source: "jspark",
        type: "error",
        errorType: "error",
        message: err.message || String(err),
        stack: err.stack,
        lineno: err.lineno,
        colno: err.colno
      }, "*");
    }
    var execTime = (typeof __endTime !== "undefined" && typeof __startTime !== "undefined") ? (__endTime - __startTime) : 0;
    parent.postMessage({ source: "jspark", type: "done", executionTime: execTime }, "*");
  });

  parent.postMessage({ source: "jspark", type: "ready" }, "*");
})();
`;
