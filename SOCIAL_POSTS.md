# Social Media Post Templates for TryJS

---

## 1. Reddit — r/webdev, r/SideProject (Text Post)

**Title:** I built a free JS/TS playground that runs entirely in your browser — no backend, no signup

**Body:**

Hey everyone,

I've been working on [TryJS](https://tryjs.app) — a browser-based JavaScript & TypeScript playground. I built it because I was tired of opening heavy IDEs or slow online editors just to test a quick idea.

**What it does:**

- Write JS or TypeScript and see output instantly — everything runs client-side, nothing hits a server
- NPM imports work out of the box (`import confetti from "canvas-confetti"` just works via esm.sh)
- Full TypeScript support with real type checking, hover info, and IntelliSense (powered by TS Language Service)
- Web Playground mode with tabbed HTML/CSS/JS editor and live preview
- React mode — write JSX with hooks and see it render live
- Regex Playground — test patterns, see matches highlighted, and get human-readable explanations
- Share code as a URL, embed in docs, or export as a styled image
- 6 syntax themes, 3 fonts, configurable settings

**Tech stack:** Preact + Signals, CodeMirror 6, Sucrase, TypeScript 5 (lazy-loaded from CDN), Vite, hosted on Vercel.

**Why I built it:** I wanted something that loads fast, doesn't require an account, and lets me go from idea to running code in seconds. Most alternatives are either bloated, require signup, or don't support TypeScript properly.

It's fully open source: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Would love to hear your feedback — what would make this more useful for you?

---

## 2. Reddit — r/javascript (Text Post)

**Title:** Show r/javascript: TryJS — a zero-setup JS/TS playground with npm imports and TypeScript IntelliSense

**Body:**

I built [TryJS](https://tryjs.app), a lightweight playground for JavaScript and TypeScript.

The main things that set it apart:

1. **Real TypeScript IntelliSense** — not just syntax highlighting, but actual `ts.createLanguageService()` powering completions and hover types
2. **NPM imports just work** — write `import _ from "lodash-es"` and it resolves via esm.sh, no config needed
3. **REPL-style eval** — bare expressions show their result, like Chrome DevTools
4. **Zero backend** — everything runs in a sandboxed iframe in your browser

Also has a Regex Playground with an explain mode that breaks down patterns token by token, and a snippet gallery with ready-to-run examples.

Open source: [github.com/berkinduz/try-js](https://github.com/berkinduz/try-js)

Try it: [tryjs.app](https://tryjs.app)

---

## 3. Reddit — r/opensource, r/coolgithubprojects (Link Post)

**Title:** TryJS — Free, open-source JS/TS playground with npm imports, TypeScript IntelliSense, regex tester, and code screenshots. No backend, no signup.

**URL:** https://github.com/berkinduz/try-js

---

## 4. Hacker News — Show HN

**Title:** Show HN: TryJS — Browser-based JS/TS playground with real IntelliSense and npm imports

**URL:** https://tryjs.app

**Comment (post as first comment):**

Hi HN, I built TryJS because I wanted a fast way to test JavaScript and TypeScript snippets without spinning up a project or using a heavy online IDE.

Key decisions:

- Used Preact + Signals instead of React to keep the bundle small and fast
- CodeMirror 6 for the editor — it's modular and lets me plug in custom completion sources
- TypeScript Language Service runs in a web worker for real type-aware completions and hover info
- NPM imports are rewritten to esm.sh at runtime, so you can use packages without a bundler
- Code runs in a sandboxed iframe with a 5s timeout to prevent infinite loops

It also has a Web Playground (HTML/CSS/JS with live preview), React mode (JSX + hooks), and a Regex Playground with pattern explanation.

Everything is client-side, no backend, no accounts. Open source under MIT.

Would appreciate any feedback on the editor experience or feature ideas.

---

## 5. Twitter/X

**Post:**

I built TryJS — a free JavaScript & TypeScript playground that runs entirely in your browser.

- Real TypeScript IntelliSense
- NPM imports just work
- Regex tester with explain mode
- Share as URL, embed, or export as image
- No signup, no backend, fully open source

Try it: tryjs.app

GitHub: github.com/berkinduz/try-js

---

## 6. Dev.to / Hashnode (Blog Post Title + Intro)

**Title:** I Built a Free JS/TS Playground That Runs Entirely in the Browser

**Intro:**

As a developer, I constantly need to test small JavaScript or TypeScript snippets. But the existing options always frustrated me — either they're slow to load, require an account, or don't properly support TypeScript.

So I built TryJS (tryjs.app) — a lightweight, browser-based playground with real TypeScript IntelliSense, npm import support, and instant execution. No backend, no signup, everything runs client-side.

In this post, I'll walk through the technical decisions behind TryJS and what I learned building it...

*[Continue with technical deep-dive: how CodeMirror 6 extensions work, how you wired up the TS Language Service in a worker, how esm.sh rewrites work, sandboxing approach, etc.]*

---

## 7. LinkedIn

I'm excited to share TryJS — a project I've been building as a free, open-source JavaScript and TypeScript playground.

It runs entirely in the browser with no backend, no signup required.

Some highlights:
- Real TypeScript IntelliSense powered by the TS Language Service
- NPM package imports that just work (via esm.sh)
- Web Playground with HTML/CSS/JS and React modes
- Regex Playground with pattern explanation
- Share code as URLs, embeds, or styled screenshots

Built with Preact, CodeMirror 6, Sucrase, and Vite.

Try it: tryjs.app
Source: github.com/berkinduz/try-js

I'd love to hear your thoughts and feedback.

#javascript #typescript #opensource #webdev #developer #sideproject

---

## Tips

- **Reddit:** Always post as text, not link. Tell a story. Engage with every comment.
- **Hacker News:** Keep the title factual, no hype words. Post a detailed first comment.
- **Twitter/X:** Add a GIF or short video showing the playground in action.
- **Dev.to:** Write a technical deep-dive, not just a feature list. People want to learn.
- **LinkedIn:** Keep it professional, mention the tech decisions.
- **Post timing:** Reddit/HN: weekday mornings (US time, ~9-11 AM EST). Twitter: varies.
