# Social Media Post Templates for TryJS

---

## Paylaşım Stratejisi — Öncelik Sırası

Reddit'in spam filtreleri yeni hesapları ve tanınmayan domainleri agresif şekilde engelliyor.
Önce filtresiz/kolay platformlardan başla, traction kazan, sonra Reddit'e dön.

### Adım 1 — Hemen paylaş (filtre yok)
1. **Hacker News** — Show HN, filtre yok, moderatörler manuel bakıyor
2. **Twitter/X** — Hiçbir filtre yok, hashtag ile reach kazan
3. **Dev.to / Hashnode** — Blog yaz, spam filtresi yok, SEO'su güçlü
4. **LinkedIn** — Filtre yok, profesyonel ağda paylaş
5. **Product Hunt** — Launch yap, developer kitlesi büyük

### Adım 2 — Reddit'e hazırlan (1-2 hafta)
1. Hedef subreddit'lerde (r/webdev, r/javascript, r/reactjs) **yorum yap**, başkalarına yardım et
2. Karma kas (en az 100+ comment karma)
3. Post'larda **tryjs.app linki kullanma** — sadece **github.com** linki kullan (Reddit yeni domainleri filtreler)
4. Post attıktan sonra silinirse → o subreddit'in **modmail'ine** yaz: "My post was caught by the spam filter, could you approve it?"

### Adım 3 — Reddit'te paylaş
- Aşağıdaki şablonları kullan
- **tryjs.app yerine GitHub linkini** kullan
- Text post at, link post değil
- Post oluştururken **"Markdown Mode"** seçeneğine geç

---

## 1. Hacker News — Show HN (EN KOLAY, ÖNCE BUNU AT)

**Title:** Show HN: TryJS — 4-in-1 browser playground: JS/TS, HTML/CSS/JS, React, and Regex

**URL:** https://tryjs.app

**İlk yorum olarak at:**

```
Hi HN, I built TryJS as a single tool for the things I do most often: test a JS snippet, prototype an HTML page, try a React component, or debug a regex.

It's 4 playgrounds in one:

1. JS/TS — TypeScript Language Service for real IntelliSense, npm imports via esm.sh rewriting, REPL-style output

2. Web (HTML/CSS/JS) — tabbed editor with live iframe preview and console drawer

3. React — JSX + hooks + CSS, rendered with React 19 from CDN, npm imports included

4. Regex — real-time matching, flag toggles, capture group inspection, and an explain mode that breaks patterns into readable steps

Key technical decisions:

- Preact + Signals instead of React to keep the shell fast (~30KB)

- CodeMirror 6 with custom completion sources (60+ snippets, API completions, npm suggestions)

- TypeScript 5 lazy-loaded from CDN — only fetched when you switch to TS mode

- Code executes in a sandboxed iframe with a 5s timeout (15s for module imports)

- Share links use lz-string to compress full editor state into the URL hash

Everything is client-side, no backend, no accounts. Open source under MIT.

Feedback welcome — especially on the editor UX and what modes/features would be most useful.
```

---

## 2. Twitter/X

```
I built TryJS — a free 4-in-1 web playground that runs entirely in your browser:

→ JS/TS with real TypeScript IntelliSense
→ HTML/CSS/JS with live preview
→ React with JSX, hooks, and npm imports
→ Regex with explain mode and pattern library

No signup. No backend. Open source.

tryjs.app
```

---

## 3. Dev.to / Hashnode (Blog Post)

**Title:** I Built a 4-in-1 Web Playground — JS/TS, HTML/CSS/JS, React, and Regex — That Runs Entirely in the Browser

**Intro:**

```
As a frontend developer, my workflow is scattered across tools. I test JS in the console, prototype HTML in CodePen, try React components in StackBlitz, and debug regex in regex101. None of them talk to each other, most require accounts, and switching between them breaks my flow.

So I built TryJS (tryjs.app) — a single, free, open-source playground with 4 modes:

1. JS/TS Playground — real TypeScript IntelliSense and npm imports
2. Web Playground — tabbed HTML/CSS/JS and live preview
3. React Playground — JSX, hooks, and component rendering
4. Regex Playground — real-time matching and a pattern explainer

Everything runs client-side. No backend, no signup, no telemetry beyond privacy-friendly Vercel Analytics.

In this post, I'll walk through why I built each mode, the technical decisions behind them, and what I learned along the way...
```

*(Devamında her mod için teknik deep-dive yaz: problem → çözüm → nasıl çalışıyor → screenshot)*

---

## 4. LinkedIn

```
I'm excited to share TryJS — a project I've been building as a free, open-source web development playground.

It combines 4 tools into one:

→ JS/TS Playground — Real TypeScript IntelliSense, npm imports, instant execution
→ Web Playground — HTML/CSS/JS editor with live preview
→ React Playground — JSX with hooks, CSS tab, React 19 rendering
→ Regex Playground — Real-time matching, explain mode, pattern library

Everything runs in the browser — no backend, no signup required. Share your work as a URL, embed it in docs, or export code as styled screenshots.

Built with Preact, CodeMirror 6, Sucrase, and Vite.

Try it: tryjs.app
Source: github.com/berkinduz/try-js

I'd love to hear your thoughts and feedback.

#javascript #typescript #react #regex #opensource #webdev #frontend #sideproject
```

---

## 5. Product Hunt

**Tagline:** A free 4-in-1 web playground — JS/TS, HTML/CSS/JS, React, and Regex — in your browser

**Description:**

```
TryJS is a browser-based playground for web developers. No signup, no backend — everything runs client-side.

4 playground modes:

JS/TS Playground — Write JavaScript or TypeScript with real IntelliSense (powered by TypeScript Language Service), npm imports via esm.sh, and REPL-style evaluation.

Web Playground — Tabbed HTML/CSS/JS editor with a live iframe preview and built-in console.

React Playground — Write JSX with hooks, style with CSS, import npm packages. Rendered with React 19 from CDN.

Regex Playground — Test patterns with real-time match highlighting, toggle flags, inspect capture groups, and use Explain mode for human-readable breakdowns.

Plus: share as URL, embed in docs, export as styled code screenshots. 6 themes, 3 fonts, fully configurable.

Open source under MIT.
```

---

## 6. Reddit — r/webdev, r/SideProject (GITHUB LİNKİ KULLAN!)

**Title:** I built a free web playground with 4 modes — JS/TS, HTML/CSS/JS, React, and Regex — runs entirely in your browser

**Body (Markdown Mode'da yapıştır):**

```
Hey everyone,

I've been working on TryJS — a browser-based playground for web development. I built it because I was tired of opening heavy IDEs or slow online editors just to test a quick idea.

**It's actually 4 playgrounds in one:**

**JS/TS Playground**

- Write JavaScript or TypeScript, see output instantly
- Real TypeScript IntelliSense — not just syntax highlighting, actual type-aware completions, hover types, and diagnostics
- NPM imports just work — bare specifiers resolve via esm.sh, no config
- REPL-style eval — bare expressions show their result, like Chrome DevTools

**Web Playground (HTML/CSS/JS)**

- Tabbed HTML, CSS, and JS editor with a live iframe preview
- Built-in console drawer that captures logs, warnings, and errors
- Perfect for prototyping layouts, testing CSS, or building vanilla components

**React Playground**

- Write JSX with hooks (useState, useEffect, etc.) and see it render live
- CSS tab for styling your components
- NPM imports work here too — pull in any library from esm.sh
- Powered by React 19, loaded from CDN

**Regex Playground**

- Real-time match highlighting as you type
- Toggle flags (g, i, m, s, u, d) with one click
- Explain mode — breaks down any regex pattern into human-readable steps, token by token
- Match details view with capture groups and named groups
- Library of 15+ curated patterns (email, URL, phone, date, IP address) with dedicated pages

**Plus:** share code as a URL, embed in docs, export as styled screenshots, 6 themes, 3 fonts, snippet gallery.

**Tech stack:** Preact + Signals, CodeMirror 6, Sucrase, TypeScript 5 (lazy-loaded from CDN), Vite, Vercel.

It's fully open source: github.com/berkinduz/try-js

Would love to hear your feedback — what would make this more useful for you?
```

---

## 7. Reddit — r/javascript

**Title:** Show r/javascript: TryJS — 4-in-1 web playground (JS/TS, HTML/CSS/JS, React, Regex) with real IntelliSense

**Body (Markdown Mode'da yapıştır):**

```
I built TryJS — a lightweight playground that covers the full frontend workflow in one tool.

**4 playground modes:**

1. **JS/TS Playground** — Real TypeScript IntelliSense via TypeScript Language Service, npm imports via esm.sh, REPL-style eval like Chrome DevTools
2. **Web Playground** — Tabbed HTML/CSS/JS editor with live iframe preview and built-in console
3. **React Playground** — JSX + hooks + CSS tab, rendered with React 19 from CDN, npm imports included
4. **Regex Playground** — Real-time matching, flag toggles, capture group inspection, and an explain mode that breaks down patterns token by token

**What sets it apart:**

- Everything runs client-side in a sandboxed iframe — zero backend
- NPM imports work across JS/TS and React modes without config
- Share as URL, embed in docs, or export as styled code screenshots
- 60+ snippet templates, 6 themes, 3 fonts

Open source: github.com/berkinduz/try-js
```

---

## 8. Reddit — r/reactjs

**Title:** I built a free React playground with live JSX rendering, hooks, npm imports, and a built-in console — no signup, runs in your browser

**Body (Markdown Mode'da yapıştır):**

```
I've been working on TryJS and wanted to share the React Playground mode specifically.

**What it does:**

- Write JSX with useState, useEffect, and other hooks — see your component render live
- CSS tab for styling alongside your JSX
- NPM imports just work — bare specifiers resolve via esm.sh
- Built-in console captures logs, warnings, errors, and React error boundaries
- Powered by React 19 loaded from CDN
- One-click to share your component as a URL or embed it in docs

It's part of a larger playground that also has JS/TS, vanilla HTML/CSS/JS, and Regex modes. But the React mode is the one I use most — quick way to prototype a component without spinning up a whole project.

Fully open source, no backend, no signup: github.com/berkinduz/try-js
```

---

## 9. Reddit — r/regex

**Title:** I built a free regex playground with real-time matching, flag toggles, and an explain mode that breaks down patterns into readable steps

**Body (Markdown Mode'da yapıştır):**

```
Hey r/regex,

I added a Regex Playground to my open-source web dev tool TryJS. Wanted to share it here since this community knows regex best.

**Features:**

- Real-time match highlighting as you type your pattern and test string
- Flag toggles for g, i, m, s, u, d — one click each
- **Explain mode** — breaks any regex into human-readable steps, token by token
- **Match details** — inspect match indices, captured groups, and named groups in a table
- **Pattern library** — 15+ curated common patterns (email, URL, phone, date, IPv4/IPv6) each with explanations, use cases, and FAQ
- Each pattern has its own page for bookmarking

Source: github.com/berkinduz/try-js

Would love feedback from actual regex power users — what patterns or features should I add?
```

---

## 10. Reddit — r/opensource, r/coolgithubprojects (Link Post)

**Title:** TryJS — Free, open-source 4-in-1 web playground: JS/TS with IntelliSense, HTML/CSS/JS with live preview, React with JSX/hooks, and Regex with pattern explainer

**URL:** https://github.com/berkinduz/try-js

---

## Reddit Spam Filtresi Atlatma Rehberi

1. **tryjs.app linkini Reddit postlarında KULLANMA** — Reddit yeni/tanınmayan domainleri otomatik filtreler. Sadece `github.com/berkinduz/try-js` linkini kullan.
2. **Post silinirse modmail'e yaz** — her subreddit'in modmail'i var, kibarca approval iste.
3. **Önce yorum yap** — hedef subreddit'lerde 1-2 hafta aktif ol, başkalarına yardım et, karma kas.
4. **Backtick kullanma** — Reddit'in bazı filtrelerinde inline code (`böyle`) sorun çıkarabiliyor. Yukarıdaki Reddit şablonlarında backtick'leri minimumda tuttum.
5. **Birden fazla link koyma** — tek bir GitHub linki yeterli. Çok link = spam skoru yükselir.
6. **Aynı gün birden fazla subreddit'e atma** — günde 1 subreddit, araya 1-2 gün koy.
