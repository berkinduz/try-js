# IntelliSense & Code Completion Enhancement Plan

## Current State Analysis

### What exists today:
1. **`autocompletion()`** from `@codemirror/autocomplete` — called with **zero configuration** (line 83 of extensions.ts)
2. **`@codemirror/lang-javascript`** — provides basic keyword/syntax completions only
3. **TypeScript compiler loaded from CDN** — but used ONLY for post-execution diagnostics, NOT for completions
4. **No custom completion sources** registered anywhere
5. **No hover tooltips**, no signature help, no parameter hints
6. **No React/JSX-aware completions** (no hooks, no component props)
7. **No npm package name completions** for imports

### What competitors (CodeSandbox, StackBlitz, TS Playground) have:
- Full TypeScript Language Service powering completions (type-aware)
- Dot-access member completions (`arr.` → shows `map`, `filter`, `push`...)
- Signature help with parameter info
- Hover-to-see-type tooltips
- Import path completions
- JSX prop completions
- Snippet completions (for, if, class, function templates)

---

## Implementation Plan

### Phase 1: Rich JS/TS Completion Source (HIGH IMPACT)
**File: `src/components/Editor/completions.ts` (new)**

Create a custom `CompletionSource` that provides:

1. **JavaScript Global API completions** — `console.`, `Math.`, `Array.`, `Object.`, `JSON.`, `Promise.`, `document.`, `window.` with proper types and descriptions
2. **Dot-access completions** — When user types `.` after a known object, show its methods/properties
3. **Keyword completions** — `async`, `await`, `const`, `let`, `function`, `class`, `import`, `export`, `return`, `if`, `else`, `for`, `while`, `switch`, `try`, `catch`, `throw`, `new`, `typeof`, `instanceof`
4. **Snippet completions** — Multi-line templates triggered by short prefixes:
   - `fn` → function declaration
   - `afn` → async function
   - `arr` → arrow function
   - `fore` → forEach loop
   - `map` → .map() template
   - `fil` → .filter() template
   - `red` → .reduce() template
   - `imp` → import statement
   - `tc` → try/catch
   - `cl` → console.log
   - `prom` → new Promise
   - `fet` → fetch with await
   - `iife` → immediately invoked function
   - `class` → class template
   - `ife` → if/else
   - `sw` → switch/case

### Phase 2: TypeScript-Powered Completions (HIGHEST IMPACT)
**File: `src/sandbox/ts-completions.ts` (new)**

Leverage the already-loaded TypeScript compiler to provide type-aware completions:

1. Use `ts.createLanguageService()` with a `LanguageServiceHost`
2. Call `languageService.getCompletionsAtPosition()` for real TS completions
3. Call `languageService.getCompletionEntryDetails()` for detail/documentation
4. Wire this as a CodeMirror `CompletionSource` via async completion
5. Reuse the existing `MINIMAL_LIB` declarations for type context
6. Cache the language service instance, update source on each keystroke

### Phase 3: React/JSX Completions
**Extend the completion source for JSX mode:**

1. React hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`
2. Common JSX attributes: `className`, `onClick`, `onChange`, `style`, `key`, `ref`, `children`
3. HTML tag completions inside JSX
4. Self-closing tag completion

### Phase 4: Hover Tooltips (Type Info on Hover)
**File: `src/components/Editor/hover.ts` (new)**

1. Use `languageService.getQuickInfoAtPosition()` to get type info
2. Register as CodeMirror `hoverTooltip` extension
3. Show type signature + JSDoc on hover

### Phase 5: Autocompletion UX Improvements
**File: `src/components/Editor/extensions.ts` (modify)**

1. Configure `autocompletion()` with proper options:
   - `activateOnTyping: true`
   - `maxRenderedOptions: 30`
   - `icons: true` (show completion kind icons)
   - Custom `optionClass` for styling different completion kinds
2. Add completion kind icons (function, variable, keyword, snippet, property, etc.)
3. Better autocomplete tooltip styling with detail/type info display

### Phase 6: npm Package Import Suggestions
1. When typing `import ... from "`, suggest popular npm packages
2. Use a static list of top ~200 packages (no network needed)
3. Show package description in completion detail

---

## Implementation Order:
1. Phase 1 (JS completions + snippets) — immediate value, no deps
2. Phase 5 (UX config) — quick win alongside Phase 1
3. Phase 2 (TS Language Service) — biggest impact, needs careful async handling
4. Phase 4 (Hover tooltips) — builds on Phase 2
5. Phase 3 (React/JSX) — extends Phase 1+2
6. Phase 6 (npm imports) — nice to have
