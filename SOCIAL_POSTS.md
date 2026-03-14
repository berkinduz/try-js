# Social Media Post Templates for TryJS

---

## 1. Reddit — r/webdev, r/SideProject (Text Post)

**Title:** I built a free web playground with 4 modes — JS/TS, HTML/CSS/JS, React, and Regex — runs entirely in your browser

**Body:**

Hey everyone,

I've been working on [TryJS](https://tryjs.app) — a browser-based playground for web development. I built it because I was tired of opening heavy IDEs or slow online editors just to test a quick idea.

**It's actually 4 playgrounds in one:**

**JS/TS Playground**
- Write JavaScript or TypeScript, see output instantly
- Real TypeScript IntelliSense — not just syntax highlighting, actual `ts.createLanguageService()` powering completions, hover types, and diagnostics
- NPM imports just work — `import confetti from "canvas-confetti"` resolves via esm.sh, no config
- REPL-style eval — bare expressions show their result, like Chrome DevTools

**Web Playground (HTML/CSS/JS)**
- Tabbed HTML, CSS, and JS editor with a live iframe preview
- Built-in console drawer that captures logs, warnings, and errors
- Perfect for prototyping layouts, testing CSS, or building vanilla components

**React Playground**
- Write JSX with hooks (`useState`, `useEffect`, etc.) and see it render live
- CSS tab for styling your components
- NPM imports work here too — pull in any library from esm.sh
- Powered by React 19, loaded from CDN

**Regex Playground**
- Real-time match highlighting as you type
- Toggle flags (`g`, `i`, `m`, `s`, `u`, `d`) with one click
- **Explain mode** — breaks down any regex pattern into human-readable steps, token by token
- Match details view with capture groups and named groups
- Library of 15+ curated patterns (email, URL, phone, date, IP address…) with dedicated pages

**Plus:**
- Share code as a URL (state compressed via lz-string)
- Embed in docs/blogs with `?embed=1`
- Export code as styled screenshots (6 themes, gradient backgrounds, Safari/minimal frames)
- 6 syntax themes, 3 editor fonts, configurable settings
- Snippet gallery with ready-to-run examples

**Tech stack:** Preact + Signals, CodeMirror 6, Sucrase, TypeScript 5 (lazy-loaded from CDN), Vite, hosted on Vercel.

**Why I built it:** Every existing tool does one of these well, but none combines them in a fast, free, no-signup package. I wanted one place to go from idea to running code in seconds — whether it's a JS snippet, a full HTML page, a React component, or a regex pattern.

It's fully open source: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Would love to hear your feedback — what would make this more useful for you?

---

## 2. Reddit — r/javascript (Text Post)

**Title:** Show r/javascript: TryJS — 4-in-1 web playground (JS/TS, HTML/CSS/JS, React, Regex) with real IntelliSense

**Body:**

I built [TryJS](https://tryjs.app) — a lightweight playground that covers the full frontend workflow in one tool.

**4 playground modes:**

1. **JS/TS Playground** — Real TypeScript IntelliSense via `ts.createLanguageService()`, npm imports via esm.sh, REPL-style eval like Chrome DevTools
2. **Web Playground** — Tabbed HTML/CSS/JS editor with live iframe preview and built-in console
3. **React Playground** — JSX + hooks + CSS tab, rendered with React 19 from CDN, npm imports included
4. **Regex Playground** — Real-time matching, flag toggles, capture group inspection, and an explain mode that breaks down patterns token by token

**What sets it apart:**
- Everything runs client-side in a sandboxed iframe — zero backend
- NPM imports work across JS/TS and React modes without config
- Share as URL, embed with `?embed=1`, or export as styled code screenshots
- 60+ snippet templates, 6 themes, 3 fonts

Open source: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Try it: [tryjs.app](https://tryjs.app)

---

## 3. Reddit — r/reactjs (Text Post)

**Title:** I built a free React playground with live JSX rendering, hooks, npm imports, and a built-in console — no signup, runs in your browser

**Body:**

I've been working on [TryJS](https://tryjs.app) and wanted to share the React Playground mode specifically.

**What it does:**
- Write JSX with `useState`, `useEffect`, and other hooks — see your component render live
- CSS tab for styling alongside your JSX
- NPM imports just work — `import { motion } from "framer-motion"` resolves via esm.sh
- Built-in console captures logs, warnings, errors, and React error boundaries
- Powered by React 19 loaded from CDN
- One-click to share your component as a URL or embed it in docs

It's part of a larger playground that also has JS/TS, vanilla HTML/CSS/JS, and Regex modes. But the React mode is the one I use most — quick way to prototype a component without spinning up a whole project.

Fully open source, no backend, no signup: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Try it: [tryjs.app](https://tryjs.app) (click "React" in the toolbar)

---

## 4. Reddit — r/opensource, r/coolgithubprojects (Link Post)

**Title:** TryJS — Free, open-source 4-in-1 web playground: JS/TS with IntelliSense, HTML/CSS/JS with live preview, React with JSX/hooks, and Regex with pattern explainer. No backend, no signup.

**URL:** https://github.com/berkinduz/try-js

---

## 5. Reddit — r/regex (Text Post)

**Title:** I built a free regex playground with real-time matching, flag toggles, and an explain mode that breaks down patterns into readable steps

**Body:**

Hey r/regex,

I added a Regex Playground to my open-source web dev tool [TryJS](https://tryjs.app). Wanted to share it here since this community knows regex best.

**Features:**
- Real-time match highlighting as you type your pattern and test string
- Flag toggles for `g`, `i`, `m`, `s`, `u`, `d` — one click each
- **Explain mode** — breaks any regex into human-readable steps, token by token (e.g., `\d{2,4}` → "Match a digit, between 2 and 4 times")
- **Match details** — inspect match indices, captured groups, and named groups in a table
- **Pattern library** — 15+ curated common patterns (email, URL, phone, date, IPv4/IPv6…) each with explanations, use cases, and FAQ
- Each pattern has its own page at `/regex/:slug` for bookmarking

It's free, no signup, runs entirely in the browser: [tryjs.app](https://tryjs.app) (click "Regex" in the toolbar)

Source: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Would love feedback from actual regex power users — what patterns or features should I add?

---

## 6. Hacker News — Show HN

**Title:** Show HN: TryJS — 4-in-1 browser playground: JS/TS, HTML/CSS/JS, React, and Regex

**URL:** https://tryjs.app

**Comment (post as first comment):**

Hi HN, I built TryJS as a single tool for the things I do most often: test a JS snippet, prototype an HTML page, try a React component, or debug a regex.

It's 4 playgrounds in one:

1. **JS/TS** — TypeScript Language Service for real IntelliSense, npm imports via esm.sh rewriting, REPL-style output
2. **Web (HTML/CSS/JS)** — tabbed editor with live iframe preview and console drawer
3. **React** — JSX + hooks + CSS, rendered with React 19 from CDN, npm imports included
4. **Regex** — real-time matching, flag toggles, capture group inspection, and an explain mode that breaks patterns into readable steps

Key technical decisions:

- Preact + Signals instead of React to keep the shell fast (~30KB)
- CodeMirror 6 with custom completion sources (60+ snippets, API completions, npm suggestions)
- TypeScript 5 lazy-loaded from CDN — only fetched when you switch to TS mode
- Code executes in a sandboxed iframe with a 5s timeout (15s for module imports)
- Share links use lz-string to compress full editor state into the URL hash

Everything is client-side, no backend, no accounts. Open source under MIT.

Feedback welcome — especially on the editor UX and what modes/features would be most useful.

---

## 7. Twitter/X

**Post:**

I built TryJS — a free 4-in-1 web playground that runs entirely in your browser:

- JS/TS with real TypeScript IntelliSense
- HTML/CSS/JS with live preview
- React with JSX, hooks, and npm imports
- Regex with explain mode and pattern library

No signup. No backend. Open source.

tryjs.app

---

## 8. Dev.to / Hashnode (Blog Post Title + Intro)

**Title:** I Built a 4-in-1 Web Playground — JS/TS, HTML/CSS/JS, React, and Regex — That Runs Entirely in the Browser

**Intro:**

As a frontend developer, my workflow is scattered across tools. I test JS in the console, prototype HTML in CodePen, try React components in StackBlitz, and debug regex in regex101. None of them talk to each other, most require accounts, and switching between them breaks my flow.

So I built [TryJS](https://tryjs.app) — a single, free, open-source playground with 4 modes:

1. **JS/TS Playground** with real TypeScript IntelliSense and npm imports
2. **Web Playground** with tabbed HTML/CSS/JS and live preview
3. **React Playground** with JSX, hooks, and component rendering
4. **Regex Playground** with real-time matching and a pattern explainer

Everything runs client-side. No backend, no signup, no telemetry beyond privacy-friendly Vercel Analytics.

In this post, I'll walk through why I built each mode, the technical decisions behind them, and what I learned along the way...

*[Continue with sections for each playground mode: the problem it solves, how it works technically, screenshots]*

---

## 9. LinkedIn

I'm excited to share TryJS — a project I've been building as a free, open-source web development playground.

It combines 4 tools into one:

- **JS/TS Playground** — Real TypeScript IntelliSense, npm imports, instant execution
- **Web Playground** — HTML/CSS/JS editor with live preview
- **React Playground** — JSX with hooks, CSS tab, React 19 rendering
- **Regex Playground** — Real-time matching, explain mode, pattern library

Everything runs in the browser — no backend, no signup required. Share your work as a URL, embed it in docs, or export code as styled screenshots.

Built with Preact, CodeMirror 6, Sucrase, and Vite.

Try it: tryjs.app
Source: github.com/berkinduz/try-js

I'd love to hear your thoughts and feedback.

#javascript #typescript #react #regex #opensource #webdev #frontend #sideproject

---

## Tips

- **Reddit:** Always post as text, not link. Tell a story. Engage with every comment.
- **r/reactjs:** Focus on React mode specifically — that community cares about React, not your whole tool.
- **r/regex:** Focus on Regex mode — show you respect the community's expertise.
- **Hacker News:** Keep the title factual, no hype words. Post a detailed first comment.
- **Twitter/X:** Add a GIF or short video showing mode switching between the 4 playgrounds.
- **Dev.to:** Write a technical deep-dive with sections for each mode. People want to learn, not just see features.
- **LinkedIn:** Keep it professional, mention the tech decisions.
- **Post timing:** Reddit/HN: weekday mornings (US time, ~9-11 AM EST). Twitter: varies.
- **Key subreddits:** r/webdev, r/javascript, r/reactjs, r/regex, r/SideProject, r/opensource, r/coolgithubprojects
