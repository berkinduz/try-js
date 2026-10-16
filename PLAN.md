# TryJS product maintenance

The current focus is usage and repeat visits, while retaining the simple two-pane playground.

## Implemented scope

- Preserve edits when switching languages after opening a shared link.
- Resolve versioned npm imports without rewriting comments or ordinary strings.
- Run React as ES modules with a pinned React 19 runtime and shared dependency imports.
- Use official TypeScript/DOM libraries and bounded package type acquisition in a lazy worker.
- Provide optional Vim keybindings through the shared editor extension.
- Keep the normal editor ready for quick experiments, with one quiet My playgrounds entry for optional saving and reopening.
- Show name, save state, Save changes and Close only for an open saved playground. Keep its working copy separate from normal drafts and restore the starting editor on Close.
- Preserve the open saved editor and return point across refreshes, ask before discarding edits, and offer a copy when another tab changes or removes the saved version.
- Keep JSON import/download actions visible in the library and identify recoverable earlier code with a language label and preview.
- Queue early Umami events until its deferred tracker loads, exclude development/preview domains, and omit source-bearing URL hashes.
- Share and embed JS, TS, Web, and React with empty tabs preserved.
- Run regression tests before deployment builds and in GitHub Actions.

## Release checks

Run `npm ci`, `npm run check`, and `npm audit`. Test the built preview in a browser:

- JS/TS execution, genuine type errors, and `Promise.allSettled` without false diagnostics.
- Versioned npm imports in JS and React, React hooks, and React CSS.
- Language/mode switching and browser refresh without losing fresh edits.
- Save, reopen, update, copy, remove/undo, and JSON import/export.
- Save immediately followed by refresh; dirty state and rename without overwriting current edits; cross-tab save conflicts.
- A to B to Close across all surfaces, returning to the original code (including an empty editor) while keeping other normal drafts and saved records intact.
- Save/discard/keep-editing decisions for Close and Open, including a paused editor in another language and a deleted or changed saved copy.
- Opening a shared link and a saved playground, followed by draft recovery.
- JS/TS/Web/React embeds and small-screen editor/output visibility.
- Switching examples within one embed, including reload/back/forward, without changing local drafts or retaining an old sandbox.
- Vim insert/normal modes, motions, deletion, undo, persistence, and standard-mode restoration.
- Mobile and light/dark layouts, keyboard focus, and dialog escape behavior.

Build/test success and a deployed-site check are separate states. A pull request or local preview does not mean production has been updated.

## Ongoing decisions

Review actual requests and the edit/run/share funnel before selecting the next feature. Reopening saved playgrounds is the next repeat-use signal to examine; current analytics does not measure a true D7 cohort.

Compare library opens with completed opens, and naming starts with completed saves after release. Exclude development/preview traffic and account for owner smoke tests before interpreting adoption. The `saved_before_page_load` flag distinguishes an earlier saved version from one saved during the current page lifetime; a reload can qualify and this is not a retention cohort.

Multi-file projects, cloud sync, Gist loading, collaboration, and embedded AI require a specific usage signal and an explicit scope before implementation.
