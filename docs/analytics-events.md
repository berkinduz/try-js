# Product analytics events

TryJS sends custom events to the existing Vercel Analytics and Umami integrations through `src/utils/analytics.ts`. No additional analytics service or paid dependency is required.

## Event definitions

| Event | Trigger | Properties | Frequency / guard |
| --- | --- | --- | --- |
| `visitor_classified` | Application startup | `visitor_type`: `new` or `returning` | Once per page load. A session keeps its original classification across reloads. |
| `playground_entered` | A full playground mounts, including direct JS/TS, Web and React entries | `surface`: `javascript`, `typescript`, `web`, or `react` | Once per tab session, across all surfaces. Informational pages and embeds do not qualify. Remounts, mode switches and reloads do not inflate the entry count. |
| `editor_empty_viewed` | The JS/TS empty editor's example choices are visible | `surface`: `javascript` or `typescript` | Once per surface and tab session. Focus/blur, reloads and remounts do not inflate the count. Excludes embeds. |
| `quick_example_loaded` | The user loads the short local console example from the empty editor | `surface`: `javascript` or `typescript` | Every completed load, excluding embeds. No code, selection or URL is sent. Does not claim an edit or activation. |
| `usage_question_viewed` | The optional status-bar feedback button becomes visible | `surface` | Once per tab session across all surfaces; excludes embeds. |
| `usage_question_opened` | The user clicks a feedback call to action and opens the question | `surface`; `placement`: `statusbar` or `invite` | Once per tab session across all surfaces; excludes embeds. Reopening does not inflate the count. Automatic invitation display does not trigger this event. |
| `usage_invite_viewed` | The small feedback invitation becomes visible above the bottom-right status bar | `surface` | Once per tab session. Eligible after 10 seconds on a visible playground, without an edit/run requirement. A real visible impression starts a 24-hour browser cooldown. Excludes embeds, answered questions and active cooldowns. |
| `usage_invite_clicked` | The user clicks Answer 1 question on the invitation | `surface` | Once per tab session. Independent of the first question-open event, so a prior question opening cannot consume this click. |
| `usage_invite_dismissed` | The user closes the small invitation | `surface` | Once per tab session. The status-bar question remains available. |
| `usage_intent_selected` | The user chooses an answer | `surface`; `intent`: `check_snippet`, `learn_js_ts`, `try_web_ui`, or `other` | Once per tab session; excludes embeds. No free text, code, URL or contact details are collected. |
| `features_playground_clicked` | A playground link is clicked on Features | `target`: `js-ts`, `web`, or `react`; `placement`: `navigation`, `hero`, `mode`, `faq`, `closing`, or `footer` | Every explicit click. Measures intent; `playground_entered` confirms the editor mounted. Ordinary links still work without JavaScript. |
| `first_meaningful_edit` | A CodeMirror user-input transaction changes trimmed document content | `surface`: `javascript`, `typescript`, `web`, or `react` | First qualifying edit per tab session across all surfaces. Programmatic snippet, starter-template, language, and tab loads do not qualify. |
| `successful_run` | JS/TS sandbox posts `done` without a transpile, runtime, or timeout error; Web/React preview posts an explicit success message | `surface`; `trigger`: `manual` or `auto` | First success per surface and tab session. Auto-run/preview success is ignored until a meaningful edit has occurred, so rendering default code is not activation. |
| `activation_completed` | The same confirmed success, after a meaningful edit existed when that run began | `surface`; `trigger`: `manual` or `auto` | First edited success per tab session, excluding embeds. A manual starter-code run cannot consume this event; existing `successful_run` behavior is preserved. |
| `share_created` | A share URL is successfully written to the clipboard | `surface`; `scope`: `document` or `selection`; `length_warning`: boolean | Every completed share action. Failed clipboard writes are excluded. |
| `embed_copied` | Embed markup is successfully written to the clipboard | `surface` | Every completed embed copy. Failed clipboard writes are excluded. |
| `support_clicked` | Buy Me a Coffee link is clicked | `provider`: `buy_me_a_coffee`; `placement`: `toolbar` | Every explicit click. |

Local playground actions also use bounded event properties:

| Event | Trigger | Properties |
| --- | --- | --- |
| `editor_keymap_change` | The user toggles Vim | `keymap`: `vim` or `standard` |
| `playground_saved` | Browser storage confirms a named save | `surface`; `action`: `create` or `update` |
| `playground_library_opened` | The user opens a readable saved library | `has_saved_playgrounds`: boolean |
| `playground_save_started` | The naming form opens from Save or Save a copy | `surface`; `action`: `create` or `copy` |
| `playground_opened` | A saved playground is successfully applied | `surface`; `saved_before_page_load`: boolean |
| `playground_started` | New successfully restores the current mode’s defaults | `surface` |
| `playground_backup_imported` | A valid backup is saved successfully | None |
| `playground_backup_exported` | A local download is requested | `scope`: `current` or `all` |

These events never contain saved IDs, names, timestamps, source code, filenames, URLs, or package names. Features click targets use only the enumerated mode names above. Save timestamps and IDs exist only inside the local library and user-requested JSON backups. The export event measures a download request, not confirmation that the operating system retained the file.

The Umami script uses `data-domains="tryjs.app,www.tryjs.app"` so local and Vercel preview checks do not contribute production pageviews or events. `data-exclude-hash="true"` omits share/embed code from Umami’s default URL payload. See the [official tracker configuration](https://docs.umami.is/docs/tracker-configuration). Custom events that occur before the deferred script loads wait in memory (maximum 50, maximum 15 seconds); load flushes them once, and error/timeout discards them without polling, storage or retries. Collection is still best effort when analytics is blocked or the page closes.

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

1. `playground_entered`
2. `first_meaningful_edit`
3. `activation_completed`

Use a 60-minute maximum gap between consecutive steps. Track Features acquisition separately as `features_view → features_playground_clicked`. A click measures intent, not a confirmed destination load. The once-per-tab entry may already have occurred before a Features visit, so it is not a required step in that acquisition funnel. A person who visits the editor directly belongs in activation without having to visit Features. Since the first edit and entry are once per tab across all modes, they can occur on different surfaces. The entry's `surface` is the initial editor; do not interpret this funnel as proof that all steps occurred in one mode.

Keep `share_created`, `embed_copied`, and `playground_saved` as independent goals. They are optional outcomes, not requirements for activation. A `successful_run` goal also includes an explicit manual run without editing. Use `activation_completed` for edited success: a manual starter run may have already claimed `successful_run` before the first edit, so the existing success event is unsuitable as the last step in this ordered funnel.

Use Umami's built-in device and source filters to compare the same funnel. Compare individual outcome events by `surface`. Only `visitor_classified` carries `visitor_type`: its new/returning breakdown does not automatically segment other events or the entire funnel.

The quick example targets the entry-to-edit drop-off. Keep the main activation funnel above for all entrants, and use `editor_empty_viewed → quick_example_loaded → first_meaningful_edit → activation_completed` as a separate 60-minute diagnostic funnel for the empty-state path. Loading the example selects a number and focuses the editor; only subsequent user input qualifies as an edit. Example loading and its initial auto-run are not activation in a fresh tab session. The new empty-state events start with this update and cannot be backfilled for the October 17–23 baseline. Surface properties label the event's current mode, not an immutable cohort.

Use `usage_question_viewed → usage_question_opened → usage_intent_selected` as a separate 60-minute response funnel. Answers are voluntary and self-selected; their distribution does not represent all visitors. Feedback is not an activation or retention goal. Only the answer event carries `intent`, so it does not automatically segment the main activation funnel. `surface` is the mode when each event occurs; people can switch modes between viewing and answering. A versioned session-storage value (`tryjs:usage-feedback:v1`) holds only the selected enum or `skipped` so the question stays hidden for that tab after an answer or Not now. A completed answer is also stored as the same enum in local storage (`tryjs:usage-feedback:answer:v1`) to avoid asking this question again in later tabs or visits. Existing tab answers are migrated locally without sending another response. Storage failures use the existing in-memory fallback. Feedback events begin with this update and cannot be backfilled for the October 17–23 period.

To measure the invitation's first click, use `usage_invite_viewed → usage_invite_clicked`. `usage_question_opened.placement` still describes the first question opening, but an earlier opening cannot hide a later invitation click from the dedicated metric. The invitation says “Help improve TryJS” and explains that the question takes about five seconds. It never opens the question or moves keyboard focus automatically. Its 10-second delay restarts when a background tab becomes visible, and an existing dialog defers the invitation until that dialog closes. Invitation scheduling is independent of analytics delivery and activation. Old `usage_invite_shown` and `usage_question_opened` analytics claims do not permanently suppress the UI.

The UI-only local preference `tryjs:usage-invite:after:v2` stores the next permitted invitation time: 24 hours after a visible impression, or at least 7 days after an invitation dismissal, a question opening, or Not now. Earlier explicit invitation dismissals are migrated to a 7-day cooldown. This timestamp is not sent to analytics and is not a retention identifier. The cooldown is recorded only when the invitation is actually visible, not when its timer starts. Later tabs respect the cooldown; a completed answer hides the question entirely. Storage blockers degrade persistence to the current page's memory. Invitation events remain deduplicated per tab and should not be treated as a count of every repeated impression in a long-lived tab.

Use `playground_library_opened → playground_opened` to assess whether people find and open named saves, and `playground_save_started → playground_saved` to assess naming completion. `saved_before_page_load` compares the saved version’s local timestamp with this page’s initialization time and sends only the boolean. It can include a reload, a second tab, or a clock change; it does not prove a distinct later visit. The existing new/returning classification is a browser-level indicator, not a D7 retention cohort or a cross-device user identity. Do not interpret repeated openings or owner smoke tests as retention growth.

The common entry, edited activation and Features click events begin with the October 16, 2026 analytics update. Earlier records cannot be backfilled. Use a chart note for the release date and allow fresh traffic to accumulate before comparing conversion rates. Production verification creates a small number of owner test events; those are delivery checks, not evidence of user activation or growth.
