/** Parse a regex pattern string and return human-readable token descriptions. */
export interface RegexToken {
  token: string;
  description: string;
}

const TOKEN_MAP: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\^/, () => "Start of string (or line in multiline mode)"],
  [/^\$/, () => "End of string (or line in multiline mode)"],
  [/^\\b/, () => "Word boundary"],
  [/^\\B/, () => "Non-word boundary"],
  [/^\\d/, () => "Any digit (0-9)"],
  [/^\\D/, () => "Any non-digit character"],
  [/^\\w/, () => "Any word character (letter, digit, underscore)"],
  [/^\\W/, () => "Any non-word character"],
  [/^\\s/, () => "Any whitespace character (space, tab, newline)"],
  [/^\\S/, () => "Any non-whitespace character"],
  [/^\\n/, () => "Newline character"],
  [/^\\r/, () => "Carriage return"],
  [/^\\t/, () => "Tab character"],
  [/^\\0/, () => "Null character"],
  [/^\\(.)/, (m) => `Escaped literal '${m[1]}'`],
  [/^\./, () => "Any character (except newline by default)"],
  [/^\|/, () => "OR — alternation between expressions"],
  [/^\(\?:/, () => "Non-capturing group start"],
  [/^\(\?=/, () => "Positive lookahead — matches if followed by"],
  [/^\(\?!/, () => "Negative lookahead — matches if NOT followed by"],
  [/^\(\?<=/, () => "Positive lookbehind — matches if preceded by"],
  [/^\(\?<!/, () => "Negative lookbehind — matches if NOT preceded by"],
  [/^\(\?<([^>]+)>/, (m) => `Named capturing group '${m[1]}'`],
  [/^\(/, () => "Capturing group start"],
  [/^\)/, () => "Group end"],
  [
    /^\[(\^?)((?:[^\]\\]|\\.)*)]/,
    (m) => {
      const neg = m[1] === "^";
      return `Character class${neg ? " (negated)" : ""}: match ${neg ? "anything except" : "one of"} ${summarizeCharClass(m[2])}`;
    },
  ],
  [/^\{(\d+),(\d+)\}/, (m) => `Between ${m[1]} and ${m[2]} times`],
  [/^\{(\d+),\}/, (m) => `${m[1]} or more times`],
  [/^\{(\d+)\}/, (m) => `Exactly ${m[1]} times`],
  [/^\*\?/, () => "Zero or more times (lazy / non-greedy)"],
  [/^\*/, () => "Zero or more times (greedy)"],
  [/^\+\?/, () => "One or more times (lazy / non-greedy)"],
  [/^\+/, () => "One or more times (greedy)"],
  [/^\?\?/, () => "Zero or one time (lazy / non-greedy)"],
  [/^\?/, () => "Zero or one time (optional)"],
];

function summarizeCharClass(inner: string): string {
  // show the raw content in a readable way
  const cleaned = inner
    .replace(/\\d/g, "0-9")
    .replace(/\\w/g, "a-zA-Z0-9_")
    .replace(/\\s/g, "whitespace")
    .replace(/\\\./g, ".")
    .replace(/\\-/g, "-")
    .replace(/\\\\/g, "\\");
  if (cleaned.length <= 30) return `[${cleaned}]`;
  return `[${cleaned.substring(0, 27)}...]`;
}

export function explainRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let remaining = pattern;

  while (remaining.length > 0) {
    let matched = false;

    for (const [re, descFn] of TOKEN_MAP) {
      const m = remaining.match(re);
      if (m) {
        tokens.push({ token: m[0], description: descFn(m) });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // literal character
      const ch = remaining[0];
      tokens.push({ token: ch, description: `Literal '${ch}'` });
      remaining = remaining.slice(1);
    }
  }

  // merge consecutive literals
  const merged: RegexToken[] = [];
  for (const t of tokens) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.description.startsWith("Literal '") &&
      t.description.startsWith("Literal '")
    ) {
      const prevChar = prev.token;
      prev.token = prevChar + t.token;
      prev.description = `Literal string '${prev.token}'`;
    } else {
      merged.push({ ...t });
    }
  }

  return merged;
}
