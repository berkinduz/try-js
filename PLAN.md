# TryJS product maintenance

The current focus is usage and repeat visits, while retaining the simple two-pane playground.

## Implemented scope

- Preserve edits when switching languages after opening a shared link.
- Resolve versioned npm imports without rewriting comments or ordinary strings.
- Run React as ES modules with a pinned React 19 runtime and shared dependency imports.
- Use official TypeScript/DOM libraries and bounded package type acquisition in a lazy worker.
- Provide optional Vim keybindings through the shared editor extension.
- Keep named local saves, copying, recovery, import, and export in one dialog.
- Share and embed JS, TS, Web, and React with empty tabs preserved.
- Run regression tests before deployment builds and in GitHub Actions.

## Release checks

Run `npm ci`, `npm run check`, and `npm audit`. Test the built preview in a browser:

- JS/TS execution, genuine type errors, and `Promise.allSettled` without false diagnostics.
- Versioned npm imports in JS and React, React hooks, and React CSS.
- Language/mode switching and browser refresh without losing fresh edits.
- Save, reopen, update, copy, remove/undo, and JSON import/export.
- Opening a shared link and a saved playground, followed by draft recovery.
- JS/TS/Web/React embeds and small-screen editor/output visibility.
- Vim insert/normal modes, motions, deletion, undo, persistence, and standard-mode restoration.
- Mobile and light/dark layouts, keyboard focus, and dialog escape behavior.

Build/test success and a deployed-site check are separate states. A pull request or local preview does not mean production has been updated.

## Ongoing decisions

Review actual requests and the edit/run/share funnel before selecting the next feature. Reopening saved playgrounds is the next repeat-use signal to examine; current analytics does not measure a true D7 cohort.

Multi-file projects, cloud sync, Gist loading, collaboration, and embedded AI require a specific usage signal and an explicit scope before implementation.
