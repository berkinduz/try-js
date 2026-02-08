# TryJS

A lightweight JavaScript & TypeScript playground. Write code, see output instantly.

**Live:** [TryJS](https://tryjs.app)

## Features

- **Instant feedback** — code runs automatically on change (500ms debounce); `Cmd+Enter` runs immediately
- **JavaScript & TypeScript** — switch between JS and TS with one click. TypeScript is transpiled in-browser via Sucrase
- **REPL-style evaluation** — bare expressions (like `x` or `1 + 2`) display their result in the console, just like Chrome DevTools
- **Console output** — supports `console.log`, `warn`, `error`, `info`, `table`, `time`/`timeEnd`, and `clear`
- **Sandboxed execution** — code runs in a sandboxed iframe with a 5s timeout to catch infinite loops
- **Syntax themes** — choose from One Dark, Dracula, GitHub Light, Monokai, and more (status bar); light/dark follows theme
- **Resizable panels** — drag the split between editor and console
- **Code persistence** — your code is saved to localStorage per language

## Tech Stack

| Layer | Choice | Size |
|-------|--------|------|
| UI Framework | Preact + Preact Signals | ~6 KB gzip |
| Editor | CodeMirror 6 | ~166 KB gzip |
| TS Transpiler | Sucrase | ~48 KB gzip |
| Build | Vite | — |
| Hosting | Vercel | — |

Total bundle: **~130 KB gzipped**

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check & build
npm run build

# Preview production build
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Run code now |
| `Cmd+L` | Clear console |

## License

MIT
