export interface RegexPattern {
  title: string;
  slug: string;
  description: string;
  pattern: string;
  flags: string;
  testInput: string;
  explanation: string;
  breakdown: { part: string; meaning: string }[];
  useCases: string[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  category: string;
}

export function findRegexBySlug(slug: string): RegexPattern | null {
  return REGEX_PATTERNS.find((p) => p.slug === slug) ?? null;
}

export function getAllRegexPatterns(): RegexPattern[] {
  return REGEX_PATTERNS;
}

export function getRegexCategories(): { name: string; patterns: RegexPattern[] }[] {
  const map = new Map<string, RegexPattern[]>();
  for (const p of REGEX_PATTERNS) {
    const arr = map.get(p.category) ?? [];
    arr.push(p);
    map.set(p.category, arr);
  }
  return Array.from(map.entries()).map(([name, patterns]) => ({ name, patterns }));
}

export const REGEX_PATTERNS: RegexPattern[] = [
  {
    title: "Email Validation",
    slug: "email-validation",
    category: "Validation",
    description: "Match and validate email addresses",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "gm",
    testInput: `valid@example.com
john.doe+label@company.co.uk
user@domain
@missing-local.com
test@.invalid
alice_bob@my-server.org`,
    explanation:
      "This regex validates email addresses by checking for a local part (letters, digits, dots, underscores, percent, plus, hyphen), followed by an @ symbol, a domain with dots, and a top-level domain of at least 2 characters.",
    breakdown: [
      { part: "^", meaning: "Start of string" },
      { part: "[a-zA-Z0-9._%+-]+", meaning: "One or more allowed characters in the local part" },
      { part: "@", meaning: "Literal @ symbol separating local and domain" },
      { part: "[a-zA-Z0-9.-]+", meaning: "One or more allowed characters in the domain" },
      { part: "\\.[a-zA-Z]{2,}", meaning: "A dot followed by at least 2 letters for the TLD" },
      { part: "$", meaning: "End of string" },
    ],
    useCases: [
      "Form validation for signup and login pages",
      "Filtering email addresses from text data",
      "Input sanitization before sending to backend",
      "Client-side validation in JavaScript applications",
    ],
    faq: [
      {
        question: "Does this regex catch all valid emails per RFC 5322?",
        answer:
          "No. The full RFC 5322 email spec is extremely complex and allows quoted strings, comments, and IP address literals. This regex covers the vast majority of real-world email addresses and is suitable for client-side validation.",
      },
      {
        question: "Should I rely only on regex for email validation?",
        answer:
          "No. Regex is a good first-pass filter, but you should always send a confirmation email to truly verify the address exists and is owned by the user.",
      },
    ],
    seoTitle: "Regex Email Validation — Pattern & JavaScript Example",
    seoDescription:
      "Validate email addresses with regex. Interactive tester with step-by-step breakdown, JavaScript example, and common use cases for email regex patterns.",
    seoKeywords: "regex email validation, email regex pattern, validate email javascript, email regular expression",
  },
  {
    title: "URL Matching",
    slug: "url-matching",
    category: "Validation",
    description: "Match HTTP and HTTPS URLs",
    pattern: "https?://[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:/[\\w./?#&=%-]*)?",
    flags: "gi",
    testInput: `Visit https://example.com for more info.
Check http://sub.domain.co.uk/path?q=1&r=2
Not a URL: ftp://files.example.com
Also valid: https://my-site.org/blog/post-1#section`,
    explanation:
      "This regex matches HTTP and HTTPS URLs including optional paths, query strings, and fragments. It requires a valid domain with a TLD of at least 2 characters.",
    breakdown: [
      { part: "https?://", meaning: "Match http:// or https://" },
      { part: "[\\w.-]+", meaning: "Domain name with letters, digits, dots, hyphens" },
      { part: "(?:\\.[a-zA-Z]{2,})", meaning: "TLD with at least 2 letters" },
      { part: "(?:/[\\w./?#&=%-]*)?", meaning: "Optional path, query params, and fragment" },
    ],
    useCases: [
      "Extracting URLs from user-generated content",
      "Auto-linking URLs in chat messages or comments",
      "Web scraping and crawling",
      "Validating URL inputs in forms",
    ],
    faq: [
      {
        question: "Does this regex match FTP or other protocols?",
        answer:
          "No. It specifically matches http and https. You can extend it by changing `https?` to `(?:https?|ftp)` to also match FTP URLs.",
      },
      {
        question: "Will it match URLs with ports like :8080?",
        answer:
          "The basic version shown here doesn't match ports. Add `(?::\\d+)?` after the domain part to support port numbers.",
      },
    ],
    seoTitle: "Regex URL Matching — HTTP/HTTPS Pattern & Tester",
    seoDescription:
      "Match and extract URLs with regex. Interactive tester for HTTP/HTTPS URL patterns with step-by-step breakdown and JavaScript examples.",
    seoKeywords: "regex url matching, url regex pattern, match url javascript, http url regular expression",
  },
  {
    title: "Phone Number",
    slug: "phone-number",
    category: "Validation",
    description: "Match US and international phone numbers",
    pattern: "(?:\\+?1[-\\s.]?)?\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}",
    flags: "g",
    testInput: `(555) 123-4567
555-123-4567
+1 555.123.4567
5551234567
+1(555)123-4567
123-45-6789
555-12-3456`,
    explanation:
      "This regex matches US phone numbers in various formats including with/without country code, parentheses, dashes, dots, or spaces as separators.",
    breakdown: [
      { part: "(?:\\+?1[-\\s.]?)?", meaning: "Optional +1 country code with optional separator" },
      { part: "\\(?\\d{3}\\)?", meaning: "3-digit area code with optional parentheses" },
      { part: "[-\\s.]?", meaning: "Optional separator (dash, space, or dot)" },
      { part: "\\d{3}", meaning: "3-digit exchange number" },
      { part: "[-\\s.]?", meaning: "Optional separator" },
      { part: "\\d{4}", meaning: "4-digit subscriber number" },
    ],
    useCases: [
      "Form validation for phone number inputs",
      "Extracting phone numbers from documents",
      "Formatting phone numbers for display",
      "CRM data cleanup and normalization",
    ],
    faq: [
      {
        question: "Does this work for international numbers?",
        answer:
          "This pattern is optimized for US/Canada (NANP) numbers. International numbers vary widely in format and length, so a more complex pattern or a dedicated library like libphonenumber is recommended.",
      },
      {
        question: "How can I also capture the area code separately?",
        answer:
          "Wrap the area code digits in a capturing group: `(?:\\+?1[-\\s.]?)?\\(?(\\d{3})\\)?[-\\s.]?(\\d{3})[-\\s.]?(\\d{4})` — this gives you three groups for area code, exchange, and subscriber number.",
      },
    ],
    seoTitle: "Regex Phone Number — US Phone Pattern & Validator",
    seoDescription:
      "Validate phone numbers with regex. Interactive tester for US phone number patterns including area codes, country codes, and various separators.",
    seoKeywords: "regex phone number, phone number regex, validate phone javascript, phone regular expression",
  },
  {
    title: "IP Address",
    slug: "ip-address",
    category: "Networking",
    description: "Match IPv4 addresses",
    pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
    flags: "g",
    testInput: `Server: 192.168.1.1
Gateway: 10.0.0.1
Invalid: 256.100.50.25
Google DNS: 8.8.8.8
Loopback: 127.0.0.1
Broadcast: 255.255.255.255
Bad: 999.999.999.999`,
    explanation:
      "This regex matches valid IPv4 addresses by checking each octet is between 0-255. It uses word boundaries to avoid matching partial numbers embedded in longer strings.",
    breakdown: [
      { part: "\\b", meaning: "Word boundary to avoid partial matches" },
      { part: "(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)", meaning: "Match a number 0-255" },
      { part: "\\.){3}", meaning: "Followed by a dot, repeated 3 times" },
      { part: "(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)", meaning: "Final octet (0-255)" },
      { part: "\\b", meaning: "Trailing word boundary" },
    ],
    useCases: [
      "Log file parsing for IP address extraction",
      "Network configuration validation",
      "Security monitoring and IP filtering",
      "Server access log analysis",
    ],
    faq: [
      {
        question: "Does this match IPv6 addresses?",
        answer:
          "No. IPv6 addresses use a completely different format (hex groups separated by colons). You need a separate regex for IPv6 validation.",
      },
      {
        question: "Why not just use \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}?",
        answer:
          "That simpler pattern would match invalid addresses like 999.999.999.999. The pattern used here validates each octet is actually in the 0-255 range.",
      },
    ],
    seoTitle: "Regex IP Address — IPv4 Validation Pattern & Tester",
    seoDescription:
      "Validate IPv4 addresses with regex. Interactive tester that checks each octet is 0-255, with step-by-step breakdown and JavaScript examples.",
    seoKeywords: "regex ip address, ipv4 regex, validate ip address javascript, ip address regular expression",
  },
  {
    title: "Password Strength",
    slug: "password-strength",
    category: "Validation",
    description: "Enforce password complexity requirements",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    testInput: `StrongP@ss1
weakpassword
NoSpecial1
SHORT!1a
MyP@ssw0rd!
12345678
Abcdefg1!`,
    explanation:
      "This regex enforces strong passwords by requiring at least 8 characters with a mix of uppercase, lowercase, digit, and special character. It uses lookaheads to check each requirement independently.",
    breakdown: [
      { part: "^", meaning: "Start of string" },
      { part: "(?=.*[a-z])", meaning: "Lookahead: at least one lowercase letter" },
      { part: "(?=.*[A-Z])", meaning: "Lookahead: at least one uppercase letter" },
      { part: "(?=.*\\d)", meaning: "Lookahead: at least one digit" },
      { part: "(?=.*[@$!%*?&])", meaning: "Lookahead: at least one special character" },
      { part: "[A-Za-z\\d@$!%*?&]{8,}", meaning: "At least 8 characters from the allowed set" },
      { part: "$", meaning: "End of string" },
    ],
    useCases: [
      "User registration form validation",
      "Password change/reset forms",
      "Admin security policy enforcement",
      "Client-side pre-validation before API call",
    ],
    faq: [
      {
        question: "Is regex the best way to check password strength?",
        answer:
          "Regex is good for enforcing basic complexity rules. For true strength estimation, consider libraries like zxcvbn which check for common patterns, dictionary words, and keyboard sequences.",
      },
      {
        question: "How do I make the minimum length configurable?",
        answer:
          "Replace `{8,}` with `{N,}` where N is your desired minimum. You can also use JavaScript to build the regex dynamically with a variable for the minimum length.",
      },
    ],
    seoTitle: "Regex Password Strength — Complexity Validation Pattern",
    seoDescription:
      "Enforce password strength with regex. Interactive tester for password complexity rules: uppercase, lowercase, digits, special characters, and minimum length.",
    seoKeywords: "regex password strength, password validation regex, strong password regex, password complexity regular expression",
  },
  {
    title: "Date Formats",
    slug: "date-formats",
    category: "Parsing",
    description: "Match common date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)",
    pattern: "(?:\\d{4}[-/](?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\\d|3[01]))|(?:(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\\d|3[01])[-/]\\d{4})",
    flags: "g",
    testInput: `2024-01-15
01/15/2024
12-31-2023
2024/06/30
13/01/2024
2024-00-10
03-25-2025`,
    explanation:
      "This regex matches dates in YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY, and MM-DD-YYYY formats. It validates month (01-12) and day (01-31) ranges but does not check calendar validity (e.g., Feb 30).",
    breakdown: [
      { part: "\\d{4}", meaning: "Four-digit year" },
      { part: "[-/]", meaning: "Date separator (dash or slash)" },
      { part: "(?:0[1-9]|1[0-2])", meaning: "Month: 01-12" },
      { part: "(?:0[1-9]|[12]\\d|3[01])", meaning: "Day: 01-31" },
    ],
    useCases: [
      "Parsing dates from CSV files and logs",
      "Form input validation for date fields",
      "Data migration between date format standards",
      "Text extraction from documents and reports",
    ],
    faq: [
      {
        question: "Does this regex validate that a date actually exists?",
        answer:
          "No. It checks format and basic ranges but won't catch invalid dates like Feb 30 or Apr 31. For full date validation, parse the matched string with JavaScript's Date constructor or a library like dayjs.",
      },
      {
        question: "How do I match dates with two-digit years?",
        answer:
          "Replace `\\d{4}` with `\\d{2,4}` to also match two-digit years. However, two-digit years are ambiguous (is 25 = 1925 or 2025?), so four-digit years are preferred.",
      },
    ],
    seoTitle: "Regex Date Formats — Match & Validate Date Patterns",
    seoDescription:
      "Match date formats with regex. Interactive tester for YYYY-MM-DD, MM/DD/YYYY, and more. Step-by-step breakdown and JavaScript date validation examples.",
    seoKeywords: "regex date format, date regex pattern, validate date javascript, date regular expression",
  },
  {
    title: "HTML Tags",
    slug: "html-tags",
    category: "Parsing",
    description: "Match and extract HTML/XML tags",
    pattern: "<\\/?([a-zA-Z][a-zA-Z0-9]*)(?:\\s[^>]*)?\\/?>",
    flags: "g",
    testInput: `<div class="container">
  <p>Hello <strong>world</strong></p>
  <img src="photo.jpg" alt="Photo" />
  <br>
  <a href="/link">Click here</a>
</div>`,
    explanation:
      "This regex matches opening, closing, and self-closing HTML tags. It captures the tag name and allows for attributes. Note: regex is not ideal for full HTML parsing — use a DOM parser for complex scenarios.",
    breakdown: [
      { part: "<", meaning: "Opening angle bracket" },
      { part: "\\/?", meaning: "Optional forward slash (for closing tags)" },
      { part: "([a-zA-Z][a-zA-Z0-9]*)", meaning: "Capture group: tag name starting with a letter" },
      { part: "(?:\\s[^>]*)?", meaning: "Optional attributes (any chars except >)" },
      { part: "\\/?>", meaning: "Optional self-closing slash and closing bracket" },
    ],
    useCases: [
      "Stripping HTML tags from text content",
      "Syntax highlighting for HTML editors",
      "Counting specific HTML elements in markup",
      "Quick HTML tag extraction from strings",
    ],
    faq: [
      {
        question: "Should I use regex to parse HTML?",
        answer:
          "For simple tag matching and extraction, regex works fine. For complex HTML parsing (nested tags, malformed HTML), use a proper parser like DOMParser in JavaScript or cheerio in Node.js.",
      },
      {
        question: "How do I strip all HTML tags from a string?",
        answer:
          "Use `string.replace(/<\\/?[^>]+(>|$)/g, '')` or better yet, create a temporary DOM element: `const div = document.createElement('div'); div.innerHTML = html; return div.textContent;`",
      },
    ],
    seoTitle: "Regex HTML Tags — Match & Extract Tag Patterns",
    seoDescription:
      "Match HTML tags with regex. Interactive tester for extracting opening, closing, and self-closing tags. Learn when to use regex vs DOM parsers for HTML.",
    seoKeywords: "regex html tags, html tag regex, extract html tags javascript, html regular expression",
  },
  {
    title: "Credit Card",
    slug: "credit-card",
    category: "Validation",
    description: "Match major credit card number formats",
    pattern: "\\b(?:4\\d{3}|5[1-5]\\d{2}|3[47]\\d{2}|6(?:011|5\\d{2}))[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{1,4}\\b",
    flags: "g",
    testInput: `Visa: 4111 1111 1111 1111
MasterCard: 5500-0000-0000-0004
Amex: 3782 822463 10005
Discover: 6011000000000004
Invalid: 1234567890123456
Test: 4111-1111-1111-1111`,
    explanation:
      "This regex matches credit card numbers for Visa (starts with 4), MasterCard (51-55), Amex (34/37), and Discover (6011/65). It allows spaces or dashes as separators.",
    breakdown: [
      { part: "\\b", meaning: "Word boundary" },
      { part: "4\\d{3}", meaning: "Visa: starts with 4" },
      { part: "5[1-5]\\d{2}", meaning: "MasterCard: starts with 51-55" },
      { part: "3[47]\\d{2}", meaning: "Amex: starts with 34 or 37" },
      { part: "6(?:011|5\\d{2})", meaning: "Discover: starts with 6011 or 65" },
      { part: "[- ]?\\d{4}", meaning: "Optional separator then 4 digits (repeats)" },
      { part: "\\d{1,4}", meaning: "Final 1-4 digits" },
    ],
    useCases: [
      "Payment form input validation",
      "Detecting card type from number prefix",
      "Masking card numbers for display",
      "Data loss prevention (DLP) scanning",
    ],
    faq: [
      {
        question: "Is regex enough to validate a credit card?",
        answer:
          "No. Regex only checks the format and prefix. You should also validate using the Luhn algorithm (checksum) and ultimately verify with a payment processor.",
      },
      {
        question: "How do I detect the card type?",
        answer:
          "Use the prefix: 4 = Visa, 51-55 = MasterCard, 34/37 = Amex, 6011/65 = Discover. Use separate regex tests or extract the first few digits to determine the type.",
      },
    ],
    seoTitle: "Regex Credit Card — Number Validation Pattern & Tester",
    seoDescription:
      "Validate credit card numbers with regex. Interactive tester matching Visa, MasterCard, Amex, and Discover formats with step-by-step pattern breakdown.",
    seoKeywords: "regex credit card, credit card regex, validate credit card javascript, credit card number regular expression",
  },
  {
    title: "Slug Extraction",
    slug: "slug-extraction",
    category: "Parsing",
    description: "Match URL-friendly slugs",
    pattern: "(?<=\\/)[a-z0-9]+(?:-[a-z0-9]+)*(?=\\/?(?:[?#]|$))",
    flags: "g",
    testInput: `/blog/my-first-post
/products/blue-widget-2024
/about
/category/web-development/
/api/v2/user-profile?id=123`,
    explanation:
      "This regex extracts URL slugs — the URL-friendly, lowercase, hyphen-separated path segments. It uses lookbehind for a slash and lookahead for the end of the path segment.",
    breakdown: [
      { part: "(?<=\\/)", meaning: "Lookbehind: preceded by a forward slash" },
      { part: "[a-z0-9]+", meaning: "One or more lowercase letters or digits" },
      { part: "(?:-[a-z0-9]+)*", meaning: "Optional hyphen-separated words" },
      { part: "(?=\\/?(?:[?#]|$))", meaning: "Lookahead: followed by optional slash then query, hash, or end" },
    ],
    useCases: [
      "Extracting slugs from URLs for routing",
      "Validating user-provided slugs for blog posts",
      "SEO-friendly URL generation and validation",
      "URL parsing for analytics and tracking",
    ],
    faq: [
      {
        question: "What makes a good URL slug?",
        answer:
          "A good slug is lowercase, uses hyphens to separate words, contains only letters, numbers, and hyphens, is concise, and describes the content. Example: 'my-blog-post-title'.",
      },
      {
        question: "How do I generate a slug from a title string?",
        answer:
          "Convert to lowercase, replace spaces and special characters with hyphens, remove consecutive hyphens, and trim hyphens from the start and end: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`.",
      },
    ],
    seoTitle: "Regex Slug Extraction — URL Slug Pattern & Validator",
    seoDescription:
      "Extract and validate URL slugs with regex. Interactive tester for URL-friendly slug patterns with JavaScript examples for slug generation.",
    seoKeywords: "regex slug extraction, url slug regex, extract slug javascript, url slug regular expression",
  },
  {
    title: "Whitespace Cleanup",
    slug: "whitespace-cleanup",
    category: "Text Processing",
    description: "Match and normalize excess whitespace",
    pattern: "[^\\S\\n]+|^\\s+|\\s+$",
    flags: "gm",
    testInput: `  Hello    world!
This   has    too   many   spaces.
   Leading spaces here.
Trailing spaces here.
	Tabs	and    mixed   whitespace.`,
    explanation:
      "This regex matches excess horizontal whitespace (multiple spaces/tabs), leading whitespace, and trailing whitespace on each line. Use with replace to normalize spacing.",
    breakdown: [
      { part: "[^\\S\\n]+", meaning: "One or more whitespace chars that are not newlines (spaces, tabs)" },
      { part: "|", meaning: "OR" },
      { part: "^\\s+", meaning: "Leading whitespace at line start" },
      { part: "|", meaning: "OR" },
      { part: "\\s+$", meaning: "Trailing whitespace at line end" },
    ],
    useCases: [
      "Cleaning up user-pasted text content",
      "Normalizing whitespace in data imports",
      "Pre-processing text before comparison",
      "Code formatting and indentation cleanup",
    ],
    faq: [
      {
        question: "How do I replace multiple spaces with a single space?",
        answer:
          "Use `text.replace(/ +/g, ' ').trim()` for a simple approach, or use this regex pattern with `.replace()` to normalize all whitespace types at once.",
      },
      {
        question: "How do I preserve newlines but clean up other whitespace?",
        answer:
          "Use `[^\\S\\n]+` to match only non-newline whitespace characters. This keeps line breaks intact while collapsing spaces and tabs.",
      },
    ],
    seoTitle: "Regex Whitespace Cleanup — Normalize Spacing Pattern",
    seoDescription:
      "Clean up whitespace with regex. Interactive tester for removing extra spaces, tabs, leading and trailing whitespace. JavaScript whitespace normalization examples.",
    seoKeywords: "regex whitespace cleanup, whitespace regex, remove extra spaces javascript, whitespace regular expression",
  },
  {
    title: "Hex Color Code",
    slug: "hex-color",
    category: "Parsing",
    description: "Match CSS hex color values (#RGB and #RRGGBB)",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: "g",
    testInput: `body { color: #333; }
.header { background: #FF5733; }
.link { color: #1a2b3c; }
.invalid { color: #GGG; }
border: 1px solid #000;
accent: #f0d000;`,
    explanation:
      "This regex matches hexadecimal color codes used in CSS — both 3-digit shorthand (#RGB) and 6-digit full format (#RRGGBB). It requires a # prefix and valid hex characters (0-9, a-f).",
    breakdown: [
      { part: "#", meaning: "Literal hash symbol prefix" },
      { part: "[0-9a-fA-F]{3}", meaning: "Exactly 3 hex characters" },
      { part: "{1,2}", meaning: "The 3-char group appears 1 or 2 times (3 or 6 hex chars)" },
      { part: "\\b", meaning: "Word boundary to prevent partial matches" },
    ],
    useCases: [
      "Extracting colors from CSS stylesheets",
      "Color picker input validation",
      "Theme analysis and color palette extraction",
      "Converting between color formats (hex to RGB)",
    ],
    faq: [
      {
        question: "Does this match 8-digit hex colors with alpha (#RRGGBBAA)?",
        answer:
          "No. To match 8-digit hex with alpha, change the pattern to `#(?:[0-9a-fA-F]{3,4}){1,2}\\b` which allows 3, 4, 6, or 8 hex digits.",
      },
      {
        question: "How do I convert a matched hex color to RGB?",
        answer:
          "Parse the hex string: `const r = parseInt(hex.slice(1,3), 16); const g = parseInt(hex.slice(3,5), 16); const b = parseInt(hex.slice(5,7), 16);` For 3-digit hex, double each digit first.",
      },
    ],
    seoTitle: "Regex Hex Color — CSS Color Code Pattern & Tester",
    seoDescription:
      "Match hex color codes with regex. Interactive tester for #RGB and #RRGGBB CSS color patterns with JavaScript color conversion examples.",
    seoKeywords: "regex hex color, hex color regex, css color regex, hex color code regular expression",
  },
  {
    title: "Username Validation",
    slug: "username-validation",
    category: "Validation",
    description: "Validate usernames with common rules",
    pattern: "^[a-zA-Z][a-zA-Z0-9._-]{2,29}$",
    flags: "",
    testInput: `alice
john_doe
user.name-123
_invalid_start
ab
a_very_long_username_that_exceeds_limit_definitely
User123
x`,
    explanation:
      "This regex validates usernames that start with a letter, are 3-30 characters long, and contain only letters, numbers, dots, underscores, and hyphens.",
    breakdown: [
      { part: "^", meaning: "Start of string" },
      { part: "[a-zA-Z]", meaning: "Must start with a letter" },
      { part: "[a-zA-Z0-9._-]{2,29}", meaning: "2-29 more allowed characters (total 3-30)" },
      { part: "$", meaning: "End of string" },
    ],
    useCases: [
      "User registration form validation",
      "Social media handle validation",
      "API username parameter validation",
      "Database constraint enforcement",
    ],
    faq: [
      {
        question: "Why require starting with a letter?",
        answer:
          "Starting with a letter prevents confusion with numeric IDs, avoids issues with systems that treat leading dots/underscores specially, and is a common convention across platforms like GitHub and Twitter.",
      },
      {
        question: "How do I prevent consecutive special characters?",
        answer:
          "Add a negative lookahead: `^[a-zA-Z](?!.*[._-]{2})[a-zA-Z0-9._-]{2,29}$` — this rejects strings with two consecutive dots, underscores, or hyphens.",
      },
    ],
    seoTitle: "Regex Username Validation — Pattern & JavaScript Example",
    seoDescription:
      "Validate usernames with regex. Interactive tester for username rules: length limits, allowed characters, and starting character requirements.",
    seoKeywords: "regex username validation, username regex pattern, validate username javascript, username regular expression",
  },
  {
    title: "Markdown Links",
    slug: "markdown-links",
    category: "Parsing",
    description: "Extract Markdown-style links [text](url)",
    pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)",
    flags: "g",
    testInput: `Check out [TryJS](https://tryjs.app) for a JS playground.
Read the [documentation](https://docs.example.com/guide).
This [link with spaces](https://example.com/my page) might work.
Not a link: [just brackets] or (just parens)
[Empty]() and [](empty-text) edge cases.`,
    explanation:
      "This regex matches Markdown links in the format [text](url). It captures both the link text and the URL in separate groups for easy extraction.",
    breakdown: [
      { part: "\\[", meaning: "Opening square bracket" },
      { part: "([^\\]]+)", meaning: "Capture group 1: link text (anything except ])" },
      { part: "\\]", meaning: "Closing square bracket" },
      { part: "\\(", meaning: "Opening parenthesis" },
      { part: "([^)]+)", meaning: "Capture group 2: URL (anything except ))" },
      { part: "\\)", meaning: "Closing parenthesis" },
    ],
    useCases: [
      "Markdown to HTML conversion",
      "Link extraction from documentation",
      "Broken link detection in markdown files",
      "Content management system processing",
    ],
    faq: [
      {
        question: "How do I also match image syntax ![alt](src)?",
        answer:
          "Prefix with an optional exclamation mark: `!?\\[([^\\]]+)\\]\\(([^)]+)\\)`. Check if the match starts with `!` to distinguish images from links.",
      },
      {
        question: "How do I replace Markdown links with HTML anchor tags?",
        answer:
          "Use `.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href=\"$2\">$1</a>')` to convert all Markdown links to HTML anchor elements.",
      },
    ],
    seoTitle: "Regex Markdown Links — Extract [text](url) Patterns",
    seoDescription:
      "Extract Markdown links with regex. Interactive tester for [text](url) patterns with capture groups for link text and URLs. JavaScript examples included.",
    seoKeywords: "regex markdown links, markdown link regex, extract links regex, markdown url regular expression",
  },
  {
    title: "CSS Properties",
    slug: "css-properties",
    category: "Parsing",
    description: "Match CSS property declarations",
    pattern: "([a-z-]+)\\s*:\\s*([^;}{]+?)\\s*(?:;|$)",
    flags: "gm",
    testInput: `color: #333;
font-size: 14px;
background-color: rgba(0, 0, 0, 0.5);
margin: 10px 20px;
display: flex;
border: 1px solid #ccc;`,
    explanation:
      "This regex matches CSS property-value pairs. It captures the property name and its value separately, handling various value formats including functions like rgba().",
    breakdown: [
      { part: "([a-z-]+)", meaning: "Capture group 1: property name (lowercase letters and hyphens)" },
      { part: "\\s*:\\s*", meaning: "Colon with optional whitespace" },
      { part: "([^;}{]+?)", meaning: "Capture group 2: property value (lazy match until ; or end)" },
      { part: "\\s*(?:;|$)", meaning: "Optional whitespace and semicolon or end of line" },
    ],
    useCases: [
      "CSS parsing and analysis tools",
      "Style extraction for theme building",
      "CSS-to-JS object conversion",
      "Linting and validating CSS properties",
    ],
    faq: [
      {
        question: "Can this parse nested CSS like SCSS or CSS-in-JS?",
        answer:
          "This works for flat CSS declarations. Nested syntaxes require a proper CSS parser that understands nesting context. For SCSS, use a dedicated SCSS parser.",
      },
      {
        question: "How do I convert matched CSS to a JavaScript object?",
        answer:
          "Match all pairs and build an object: properties become camelCase keys (`font-size` → `fontSize`) and values become strings. Libraries like css-to-js can automate this.",
      },
    ],
    seoTitle: "Regex CSS Properties — Match CSS Declarations Pattern",
    seoDescription:
      "Match CSS property declarations with regex. Interactive tester for extracting property names and values from stylesheets with JavaScript examples.",
    seoKeywords: "regex css properties, css regex pattern, parse css regex, css property regular expression",
  },
  {
    title: "JSON Key-Value",
    slug: "json-key-value",
    category: "Parsing",
    description: "Extract JSON string keys and their values",
    pattern: '"([^"]+)"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*"|\\d+(?:\\.\\d+)?|true|false|null)',
    flags: "g",
    testInput: `{
  "name": "Alice",
  "age": 30,
  "active": true,
  "score": 99.5,
  "bio": "She said \\"hello\\"",
  "data": null
}`,
    explanation:
      "This regex extracts key-value pairs from JSON strings. It matches string keys and values that are strings (with escaped quotes), numbers, booleans, or null.",
    breakdown: [
      { part: '"([^"]+)"', meaning: 'Capture group 1: key name (string in quotes)' },
      { part: "\\s*:\\s*", meaning: "Colon separator with optional whitespace" },
      { part: '"(?:[^"\\\\]|\\\\.)*"', meaning: "String value (handles escaped quotes)" },
      { part: "\\d+(?:\\.\\d+)?", meaning: "OR: number (integer or decimal)" },
      { part: "true|false|null", meaning: "OR: boolean or null literal" },
    ],
    useCases: [
      "Quick JSON value extraction without full parsing",
      "Log file analysis with JSON entries",
      "Configuration file inspection",
      "Data migration and transformation scripts",
    ],
    faq: [
      {
        question: "Should I use regex instead of JSON.parse()?",
        answer:
          "No. For well-formed JSON, always use JSON.parse(). Regex is useful when dealing with partial JSON, JSON embedded in other text, or when you need to extract specific keys without parsing the entire structure.",
      },
      {
        question: "Can this handle nested objects and arrays?",
        answer:
          "No. Nested structures require recursive or balanced-bracket matching which is beyond standard regex. Use JSON.parse() for nested data structures.",
      },
    ],
    seoTitle: "Regex JSON Key-Value — Extract JSON Pairs Pattern",
    seoDescription:
      "Extract JSON key-value pairs with regex. Interactive tester matching strings, numbers, booleans, and null values with step-by-step pattern breakdown.",
    seoKeywords: "regex json key value, json regex pattern, extract json regex, json key value regular expression",
  },
  {
    title: "UUID/GUID",
    slug: "uuid-guid",
    category: "Validation",
    description: "Match UUID version 4 format",
    pattern: "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}",
    flags: "gi",
    testInput: `550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
f47ac10b-58cc-4372-a567-0d02b2c3d479
not-a-uuid-at-all
123e4567-e89b-12d3-a456-426614174000
invalid-0000-0000-0000-000000000000`,
    explanation:
      "This regex matches UUID v4 format: 8-4-4-4-12 hex characters where the version digit (position 13) is 4 and the variant digit (position 17) is 8, 9, a, or b.",
    breakdown: [
      { part: "[0-9a-f]{8}", meaning: "First 8 hex characters" },
      { part: "-[0-9a-f]{4}", meaning: "Dash then 4 hex characters" },
      { part: "-4[0-9a-f]{3}", meaning: "Dash, version '4', then 3 hex chars" },
      { part: "-[89ab][0-9a-f]{3}", meaning: "Dash, variant (8/9/a/b), then 3 hex chars" },
      { part: "-[0-9a-f]{12}", meaning: "Dash then final 12 hex characters" },
    ],
    useCases: [
      "Validating UUID inputs in API endpoints",
      "Extracting UUIDs from log files",
      "Database record identification",
      "Distributed system trace ID validation",
    ],
    faq: [
      {
        question: "What's the difference between UUID and GUID?",
        answer:
          "They're essentially the same format. UUID (Universally Unique Identifier) is the standard term, while GUID (Globally Unique Identifier) is Microsoft's terminology. Both follow the same 8-4-4-4-12 hex format.",
      },
      {
        question: "How do I match any UUID version, not just v4?",
        answer:
          "Replace `4[0-9a-f]{3}` with `[0-9a-f]{4}` and `[89ab][0-9a-f]{3}` with `[0-9a-f]{4}` to match any UUID regardless of version and variant bits.",
      },
    ],
    seoTitle: "Regex UUID/GUID — Validate UUID v4 Pattern & Tester",
    seoDescription:
      "Validate UUIDs with regex. Interactive tester for UUID v4 format (8-4-4-4-12 hex) with step-by-step breakdown and JavaScript generation examples.",
    seoKeywords: "regex uuid, uuid regex pattern, validate uuid javascript, guid regular expression",
  },
  {
    title: "Semantic Version",
    slug: "semantic-version",
    category: "Validation",
    description: "Match semantic versioning (semver) strings",
    pattern: "\\bv?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[\\da-zA-Z-]+(?:\\.[\\da-zA-Z-]+)*)?(?:\\+[\\da-zA-Z-]+(?:\\.[\\da-zA-Z-]+)*)?\\b",
    flags: "g",
    testInput: `v1.0.0
2.3.4
0.1.0-alpha
1.2.3-beta.1
10.20.30+build.123
1.0.0-rc.1+sha.abc123
v01.2.3
1.2
latest`,
    explanation:
      "This regex matches semantic version strings (semver). It validates MAJOR.MINOR.PATCH format with optional pre-release labels and build metadata. Prevents leading zeros in version numbers.",
    breakdown: [
      { part: "\\b", meaning: "Word boundary" },
      { part: "v?", meaning: "Optional 'v' prefix" },
      { part: "(?:0|[1-9]\\d*)", meaning: "Major version (no leading zeros)" },
      { part: "\\.(?:0|[1-9]\\d*)", meaning: "Dot + minor version" },
      { part: "\\.(?:0|[1-9]\\d*)", meaning: "Dot + patch version" },
      { part: "(?:-[\\da-zA-Z-]+(?:\\.[\\da-zA-Z-]+)*)?", meaning: "Optional pre-release label" },
      { part: "(?:\\+[\\da-zA-Z-]+(?:\\.[\\da-zA-Z-]+)*)?", meaning: "Optional build metadata" },
    ],
    useCases: [
      "Package manager version validation (npm, pip)",
      "Release tag parsing in CI/CD pipelines",
      "Changelog generation and version tracking",
      "Dependency constraint matching",
    ],
    faq: [
      {
        question: "What is semantic versioning?",
        answer:
          "Semantic versioning (semver) uses MAJOR.MINOR.PATCH format. MAJOR increments for breaking changes, MINOR for new features, and PATCH for bug fixes. Pre-release and build metadata can be appended with - and + respectively.",
      },
      {
        question: "How do I compare two semver strings?",
        answer:
          "Parse each version into [major, minor, patch] numbers and compare numerically. For pre-release versions, comparison is more complex — consider using a library like semver (npm) for reliable comparison.",
      },
    ],
    seoTitle: "Regex Semantic Version — Semver Pattern & Validator",
    seoDescription:
      "Validate semantic versions with regex. Interactive tester for semver format (MAJOR.MINOR.PATCH) with pre-release and build metadata support.",
    seoKeywords: "regex semantic version, semver regex, validate version regex, semantic versioning regular expression",
  },
  {
    title: "Log Timestamp",
    slug: "log-timestamp",
    category: "Parsing",
    description: "Extract timestamps from log file entries",
    pattern: "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?",
    flags: "g",
    testInput: `2024-01-15T10:30:00Z INFO Starting server
2024-01-15 10:30:01.123 DEBUG Loading config
2024-01-15T10:30:02+05:30 WARN High memory
2024-01-15T10:30:03.456789Z ERROR Connection failed
[2024-01-15 10:30:04-0800] Request timeout
Not a timestamp: 2024-99-99`,
    explanation:
      "This regex matches ISO 8601 and common log timestamp formats. It supports T or space separators, optional milliseconds, and timezone indicators (Z, +HH:MM, -HHMM).",
    breakdown: [
      { part: "\\d{4}-\\d{2}-\\d{2}", meaning: "Date: YYYY-MM-DD" },
      { part: "[T ]", meaning: "T or space separator" },
      { part: "\\d{2}:\\d{2}:\\d{2}", meaning: "Time: HH:MM:SS" },
      { part: "(?:\\.\\d+)?", meaning: "Optional fractional seconds" },
      { part: "(?:Z|[+-]\\d{2}:?\\d{2})?", meaning: "Optional timezone (Z, +HH:MM, or -HHMM)" },
    ],
    useCases: [
      "Log file parsing and analysis",
      "Monitoring and alerting systems",
      "Time-series data extraction",
      "Audit trail processing",
    ],
    faq: [
      {
        question: "How do I parse the matched timestamp in JavaScript?",
        answer:
          "Use `new Date(matchedString)` for ISO 8601 formats, or use a library like dayjs for more flexible parsing. Ensure timezone handling is correct for your use case.",
      },
      {
        question: "How do I match timestamps with different date separators?",
        answer:
          "Replace the `-` in the date part with `[-/.]` to also match formats like 2024/01/15 or 2024.01.15 alongside the standard hyphen format.",
      },
    ],
    seoTitle: "Regex Log Timestamp — ISO 8601 Date/Time Pattern",
    seoDescription:
      "Extract timestamps from logs with regex. Interactive tester for ISO 8601 and common log timestamp formats with timezone support and JavaScript parsing examples.",
    seoKeywords: "regex log timestamp, iso 8601 regex, timestamp regex pattern, log date regular expression",
  },
];
