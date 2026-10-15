# TryJS

A fast, free JavaScript & TypeScript playground that runs entirely in your browser. Write code, see output instantly — no setup, no backend.

**Live:** [tryjs.app](https://tryjs.app) · **Features:** [tryjs.app/features](https://tryjs.app/features)

## Features

### JavaScript & TypeScript Playground

![TryJS JavaScript playground demo](public/tryJS_JS_gif.gif)

- **Instant execution** — code auto-runs on change with configurable debounce; `Cmd+Enter` runs immediately
- **JavaScript & TypeScript** — toggle with one click; TypeScript is transpiled in-browser via Sucrase
- **NPM imports** — browser-compatible packages, versioned imports (`zod@4.1.0`), scoped packages, and literal dynamic imports are resolved through [esm.sh](https://esm.sh)
- **REPL-style evaluation** — bare expressions display their result in the console, like Chrome DevTools
- **Object inspector** — expand objects, arrays, Maps, and Sets inline
- **Console output** — supports `log`, `warn`, `error`, `info`, `table`, `time`/`timeEnd`, and `clear`
- **Sandboxed execution** — code runs in an iframe sandbox with a 5-second timeout (15s for module loading)

### Themes & Editor Customization

![TryJS theme change demo](public/tryJS_theme_change_gif.gif)

- **6 syntax themes** — One Dark, One Light, Dracula, GitHub Light, Monokai, Solarized Dark
- **3 editor fonts** — Geist Mono, Fira Code, JetBrains Mono
- **Optional Vim keybindings** — enable Vim from the status bar in JS, TS, HTML, CSS, and JSX editors; standard editing remains the default, and the Vim extension loads only when enabled
- **Persistent preferences** — syntax theme, editor font, Vim mode, and split position are remembered in this browser

### Web Playground (HTML/CSS/JS)

![TryJS HTML playground demo](public/tryjs_html_gif.gif)

- **Vanilla mode** — tabbed HTML/CSS/JS editor with a live iframe preview and built-in console drawer

### React Playground

![TryJS React playground demo](public/tryjs_react_gif.gif)

- **React mode** — write JSX components with a CSS tab, normal ES module imports, and a pinned React 19 runtime from esm.sh; dependency imports use the shared React runtime, with render errors surfaced in the preview and console

### Code-to-PNG Export

![TryJS export to image demo](public/tryjs_export_image_gif.gif)

- **Export as image** — generate code screenshots with syntax themes, Safari/minimal frames, padding options, and gradient backgrounds (download PNG or copy to clipboard)

### Editor & IntelliSense

- **Smart code completions** — 60+ snippet templates (`fn`, `cl`, `map`, `tc`, `imp`, `ust`, `uef`, `rfc`…), global API dot-access (`console.`, `Math.`, `JSON.`, `Object.`, `Array.`, `Promise.`, `document.`), and heuristic type inference for string/array/promise instance methods
- **TypeScript Language Service** — real type-aware IntelliSense powered by `ts.createLanguageService()` with `getCompletionsAtPosition()` for semantic completions
- **Hover type info** — hover over any identifier to see its type signature and documentation via `getQuickInfoAtPosition()`
- **TypeScript type checking** — official ES2024 and DOM declarations replace hand-written built-ins; semantic diagnostics run in a lazy-loaded local worker so compiler work stays off the editor thread
- **Package types** — automatic type acquisition retrieves available npm declarations and feeds both completions and hover information; package downloads are bounded, and unavailable declarations remain visible as diagnostics
- **npm import suggestions** — type `import ... from "` to get suggestions from 50+ popular packages (lodash, zod, dayjs, axios…)
- **React/JSX completions** — hooks (`useState`, `useEffect`…), JSX attributes (`className`, `onClick`…), and component scaffolding snippets

### Snippet Gallery

- **Ready-to-run examples** — organized by category: JS Fundamentals, Async Patterns, TypeScript Essentials
- **Gallery page** — browse all snippets at `/snippets` with category filtering
- **Detail pages** — individual snippet pages at `/snippets/:slug` with code, explanation, and related snippets
- **Load into playground** — one-click to load any snippet directly into the editor

### Share & Export

- **Share as URL** — JS, TS, Web, and React links preserve code and CSS, including empty tabs; existing share links remain compatible
- **Export JSON** — download the complete current playground for a portable backup
- **Embed code** — generate a sandboxed iframe for any mode; the dedicated `/embed` route hides site chrome and keeps editor/output visible on small screens

### My Playgrounds

- **Named local saves** — save, update, reopen, duplicate, and remove playgrounds from one compact dialog
- **JSON backups** — export the current playground or the full library; imports add copies and never overwrite matching saved IDs
- **Draft recovery** — opening a saved/shared playground keeps the previous non-empty draft available through **Previous draft**
- **Storage safeguards** — failed saves report an error; removal has Undo while the dialog stays open; blocked draft storage falls back to memory and prompts for a JSON export
- Saved playgrounds stay in this browser. Clearing site data removes local saves, so export a separate backup for safekeeping. The library supports up to 50 playgrounds, up to 500,000 source characters each, within a 2 MB JSON budget.

### General

- **Resizable split pane** — drag the divider between editor and console; position persisted across sessions
- **Code persistence** — saved to localStorage per language and mode
- **Mobile support** — responsive layout with editor/console tabs on small screens
- **SEO** — dynamic meta tags, canonical URLs, JSON-LD structured data (schema.org) with breadcrumbs for all pages
- **Analytics** — privacy-friendly event tracking via Vercel Analytics

## Tech Stack

| Layer         | Choice                          |
| ------------- | ------------------------------- |
| UI            | Preact + Preact Signals         |
| Editor        | CodeMirror 6                    |
| TS Transpiler | Sucrase                         |
| TS Compiler   | TypeScript 5, lazy local worker, official library declarations |
| Package Types | Microsoft Automatic Type Acquisition + virtual filesystem |
| Build         | Vite                            |
| Hosting       | Vercel                          |

## Development

Requires Node.js 22.18+ in the Node 22 line (`.nvmrc`).

```bash
# Install the locked dependencies
npm ci

# Start dev server
npm run dev

# Regression tests, type-check & production build
npm run check

# Preview production build
npm run preview
```

GitHub Actions runs the checks and dependency audit on pushes and pull requests. The Vercel build command also runs `npm run check`, so a failing regression test stops the deployment build.

## Keyboard Shortcuts

| Shortcut    | Action               |
| ----------- | -------------------- |
| `Cmd/Ctrl+Enter` | Run JS/TS code             |
| `Cmd/Ctrl+S` | Save the current draft |
| `Cmd/Ctrl+L` | Clear the active console        |
| `Tab`       | Accept completion    |

## Project Structure

```
src/
  app.tsx                # App root, routing, keyboard bindings
  components/
    Editor/              # CodeMirror editor, themes, extensions
      completions.ts     # Snippet, API, JSX, npm completion sources
      hover.ts           # Hover-to-see-type tooltip extension
      extensions.ts      # Editor extensions & autocompletion wiring
      themes.ts          # Syntax themes & completion icon styling
    Console/             # Console output display
    WebEditor/           # Tabbed HTML/CSS/JS editor for web mode
    WebPreview/          # Live iframe preview with console drawer
    ReactEditor/         # JSX + CSS tabbed editor for React mode
    ReactPreview/        # Live React component preview
    Toolbar/             # Language toggle, web/react mode switch, links
    StatusBar/           # Help, snippets, shortcuts, theme/font selects
    SplitPane/           # Draggable editor/console split
    Gallery/             # Snippet gallery modal
    Playgrounds/         # Named local saves, sharing, JSON backups, embed links
    Snippets/            # Snippet gallery & detail pages
    Screenshot/          # Export-as-image modal
    Toast/               # Toast notifications
    Features/            # /features landing page
  data/
    snippets.ts          # Snippet definitions with categories
  hooks/                 # useDebounce, useKeyboard
  sandbox/
    executor.ts          # Sandboxed code execution orchestrator
    transpiler.ts        # TypeScript/JSX transpilation via Sucrase
    type-checker.ts      # Lazy worker client for diagnostics
    typescript-worker.ts # Official TS libraries, package types, language service
    type-project.ts      # Virtual TypeScript filesystem and bounded type acquisition
    ts-completions.ts    # TS Language Service for completions & hover
  state/                 # Preact signals (editor, console, settings, UI)
  utils/                 # Share encoding, screenshot renderer, SEO, constants
```

## Further possibilities

Multi-file imports and public Gist loading remain candidates to validate against user requests and usage. Current development focuses on reliable execution, reusable local playgrounds, and sharing without adding account or project-management complexity.

Have an idea? [Open an issue](https://github.com/berkinduz/try-js/issues) — we'd love to hear it.

## License

MIT
