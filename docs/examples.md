# Interactive example library

The Examples collection uses `/snippets` and retains all 22 original detail URLs. Ten additional examples cover data tasks, Zod, TypeScript runtime validation, React optimistic UI and form actions, Vue reactivity, debounced input, CSS container queries and Canvas drawing.

## Data and discovery

- `src/data/snippets.ts` retains the original explanations and combines the new definitions.
- `src/data/example-definitions.ts` defines the new examples and their JS/TS, Web or React playground state.
- `src/data/examples.ts` normalizes both sets, supplies a concrete edit suggestion and expected result, searches tasks/packages/technologies, and scores related examples by tags, goal and technology.
- `src/data/example-ids.ts` is the allowlist for analytics and the inline editor protocol. Tests keep it in agreement with the catalog.
- `src/utils/runtime-versions.ts` contains explicit React, Vue and Zod versions. React's import map and example metadata use the same React constant. These versions were checked against npm during implementation; no claim of automatic updates is made.

The public collection and in-editor dialog share the same search and filters. Queries stay in page memory. Technology filters use the execution surface; Vue is discoverable through its name and tags inside Web. Adding a framework label does not add a compiler or server runtime.

## Live editor and drafts

Each detail is prerendered with its description, instructions, expected result, explanation and original code. JavaScript adds one same-origin lazy iframe at `/embed?example=<allowlisted-slug>#<state>`. It reuses the existing editor and sandbox, including TypeScript checking, npm imports, Web and React previews. The editor's user code runs in the existing nested sandbox; the parent article never executes it directly. Web/React previews allow scripts and form submission while keeping an opaque origin (no allow-same-origin). The trusted editor frame also permits its user-requested JSON downloads and opening the full playground.

Inline state never saves over the normal drafts or named library. Open in TryJS serializes the **current edited state**, opening a new tab with the existing shared-link draft-recovery behavior. Reset example restores the original state. Copy example link shares the canonical article URL; it does not claim to include edits.

The gallery applies the selected complete playground state, using the same dirty-save protection and previous-draft recovery as other loads. It supports keyboard focus trapping, Escape and focus return. A successful gallery load starts an example-specific edit context; switching language, mode or document clears it.

## Measurement and support

See [analytics-events.md](analytics-events.md#interactive-examples). Inline frames suppress their own pageview and ordinary analytics and report bounded activity to the parent. Parent window, origin and slug checks prevent unrelated frames or messages from being attributed to an example. An initial run or a preview interaction is not edited activation.

A single optional Support TryJS link below the editor opens the existing Buy Me a Coffee page. There is no timed support prompt, payment gate or account requirement. A support click is not a purchase; verify actual revenue on the provider.

## Adding or updating an example

1. Add a definition with a unique stable slug, specific description, honest runtime/package version, a supported playground state, tags, goal, something to change, expected result and a useful explanation.
2. Add its slug to the allowlist. Do not rename existing slugs to change display copy.
3. Run `npm run check` and `npm audit --audit-level=high`.
4. Open the live example in a real browser, verify its starting result, perform the suggested change and verify the new result. Check npm and framework examples against the pinned versions before updating them.
5. Verify the old routes, mobile editor/output layout, shared snapshot and draft preservation. Use `npm run verify:seo -- https://tryjs.app` after publication.

Do not add paid labels, fabricated reviews, package compatibility promises, automatic verification dates or SEO-only hidden content. Source in native details elements is user-readable and available without JavaScript. Keep optional explanations proportional to the example.
