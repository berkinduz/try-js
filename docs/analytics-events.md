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

Local playground actions also use bounded event properties:

| Event | Trigger | Properties |
| --- | --- | --- |
| `editor_keymap_change` | The user toggles Vim | `keymap`: `vim` or `standard` |
| `playground_saved` | Browser storage confirms a named save | `surface`; `action`: `create` or `update` |
| `playground_opened` | The user opens a saved playground | `surface` |
| `playground_backup_imported` | A valid backup is saved successfully | None |
| `playground_backup_exported` | A local download is requested | `scope`: `current` or `all` |

These events never contain saved IDs, names, timestamps, source code, filenames, URLs, or package names. Save timestamps and IDs exist only inside the local library and user-requested JSON backups. The export event measures a download request, not confirmation that the operating system retained the file.

Existing diagnostic events such as `playground_view`, `code_run`, `code_share`, and `language_switch` remain unchanged. `code_run` and `code_share` describe attempts; `successful_run`, `share_created`, and `embed_copied` are the corresponding outcome events to use for activation measurement.

## New versus returning

Classification uses two non-identifying browser markers:

- `localStorage["tryjs:analytics:returning:v1"] = "1"` records only that a previous browser session exists.
- `sessionStorage["tryjs:analytics:visitor-type:v1"]` keeps the initial `new` or `returning` classification stable for the current tab session.

No analytics identifier, timestamp, account, cookie, fingerprint, IP address, or cross-device linkage is created by this classification. If browser storage is blocked, classification degrades to `new` and analytics remains non-blocking.

## Privacy and cardinality rules

- Never send editor contents, generated share URLs, embed markup, console output, error messages, selected text, filenames, or package names.
- Keep properties to the enumerated, low-cardinality values above.
- Session de-duplication uses boolean keys in `sessionStorage`, with an in-memory fallback when storage is unavailable.
- Analytics failures and blockers must never interrupt editing, execution, sharing, or navigation.

## Funnel queries

A basic activation funnel is:

1. `visitor_classified`
2. `first_meaningful_edit`
3. `successful_run`
4. `share_created` or `embed_copied`

Segment each step by `visitor_type` at the reporting layer and use `surface` to compare JS, TypeScript, Web, and React. Use `support_clicked` to measure clicks on Buy Me a Coffee.

The `playground_opened` event can show whether the library is being reused across visits. The existing new/returning classification is a browser-level indicator, not a D7 retention cohort or a cross-device user identity.
