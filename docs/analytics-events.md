# Product analytics events

TryJS sends custom events to the existing Vercel Analytics and Umami integrations through `src/utils/analytics.ts`. No additional analytics service or paid dependency is required.

## Event definitions

| Event | Trigger | Properties | Frequency / guard |
| --- | --- | --- | --- |
| `visitor_classified` | Application startup | `visitor_type`: `new` or `returning` | Once per page load. A session keeps its original classification across reloads. |
| `first_meaningful_edit` | A CodeMirror user-input transaction changes trimmed document content | `surface`: `javascript`, `typescript`, `web`, or `react` | First qualifying edit per tab session across all surfaces. Programmatic snippet, starter-template, language, and tab loads do not qualify. |
| `successful_run` | JS/TS sandbox posts `done` without a transpile, runtime, or timeout error; Web/React preview posts an explicit success message | `surface`; `trigger`: `manual` or `auto` | First success per surface and tab session. Auto-run/preview success is ignored until a meaningful edit has occurred, so rendering default code is not activation. |
| `share_created` | A share URL is successfully written to the clipboard | `surface`; `scope`: `document` or `selection`; `length_warning`: boolean | Every completed share action. Failed clipboard writes are excluded. |
| `embed_copied` | Embed markup is successfully written to the clipboard | `surface` | Every completed embed copy. Failed clipboard writes are excluded. |
| `support_clicked` | Buy Me a Coffee link is clicked | `provider`: `buy_me_a_coffee`; `placement`: `toolbar` | Every explicit click. |
| `pro_landing_view` | The `/for-teachers` concept page loads | `audience`: `teachers_authors` | First page render per tab session. This is the conversion denominator. |
| `pro_interest` | An explicit Pro or educator CTA calls `trackProInterest` | `source`; `intent`: `pricing`, `early_access`, `educator_workflow`, or `willingness_to_pay` | First interaction per source, intent, and tab session. The shared educator entry on JS, TypeScript, Web, and React uses `source=toolbar`, `intent=educator_workflow`; the extra `/web` and `/react` workflow link uses `source=web_preview`, `intent=educator_workflow`; the public GitHub feedback link uses `source=for_teachers_page`, `intent=willingness_to_pay`. |

Existing diagnostic events such as `playground_view`, `code_run`, `code_share`, and `language_switch` remain unchanged. `code_run` and `code_share` describe attempts; `successful_run`, `share_created`, and `embed_copied` are the corresponding outcome events to use for activation measurement.

## New versus returning

Classification uses two non-identifying browser markers:

- `localStorage["tryjs:analytics:returning:v1"] = "1"` records only that a previous browser session exists.
- `sessionStorage["tryjs:analytics:visitor-type:v1"]` keeps the initial `new` or `returning` classification stable for the current tab session.

No random identifier, timestamp, account, cookie, fingerprint, IP address, or cross-device linkage is created. If browser storage is blocked, classification degrades to `new` and analytics remains non-blocking.

## Privacy and cardinality rules

- Never send editor contents, generated share URLs, embed markup, console output, error messages, selected text, filenames, or package names.
- Keep properties to the enumerated, low-cardinality values above. `source` for Pro interest must be a static placement name, not a URL or user-provided value.
- Session de-duplication uses boolean keys in `sessionStorage`, with an in-memory fallback when storage is unavailable.
- Analytics failures and blockers must never interrupt editing, execution, sharing, or navigation.

## Funnel queries

A basic activation funnel is:

1. `visitor_classified`
2. `first_meaningful_edit`
3. `successful_run`
4. `share_created` or `embed_copied`

Segment each step by `visitor_type` at the reporting layer and use `surface` to compare JS, TypeScript, Web, and React. Monetization signals are `support_clicked` and `pro_interest`. The fixed decision window and success/stop thresholds for the current Pro test are documented in `docs/pro-demand-validation.md`.
