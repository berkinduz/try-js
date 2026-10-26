# Search and link previews

TryJS opens directly into an editor. Descriptive content belongs on the visible Features and Examples pages; the editor does not need a hidden article or an extra landing screen.

## Route policy

| Routes | HTTP status | Search policy |
| --- | --- | --- |
| `/`, `/web`, `/react` | 200 | Index, canonical to the same path |
| `/features`, `/snippets`, known `/snippets/:slug` | 200 | Index, canonical to the same path |
| `/embed` | 200 | `noindex, follow` in HTML and an HTTP header; no canonical |
| Missing pages, snippets and assets | 404 | Useful custom error page with `noindex`; no homepage fallback |
| `www`, trailing slashes and explicit `index.html` paths | Permanent redirect | One public URL per page |
| Retired `/for-teachers` and `/regex` routes | Permanent redirect to `/` | Keep existing inbound links working |

Shared code lives in a URL fragment, which is not part of a canonical URL or sitemap. Browser-local saves and user code never become generated public pages. Embeds remain crawlable so a crawler can read their `noindex` instruction; they are not blocked in `robots.txt`.

## Where to make changes

- `src/data/seo.ts` owns public routes, titles, descriptions, canonical URLs and structured data.
- `src/data/features.ts` owns the visible Features narrative, section anchors and responsive screenshot dimensions. The Features ItemList uses those same headings and descriptions, in reading order, with links to the visible sections. `src/data/snippets.ts` retains the existing example routes; `src/data/example-definitions.ts` adds runnable JS/TS, React and Web examples. `src/data/examples.ts` supplies the shared search, tags, tasks, related examples and legacy guidance.
- `src/utils/seo.ts` serializes the same metadata for HTML and updates it during editor navigation. Each page has one JSON-LD graph. Strings are escaped separately for HTML and JSON-LD.
- `scripts/render-pages.tsx` renders the actual informational components at build time. Their content and internal links are available without JavaScript. The editor starts with a lightweight skeleton matching its pane layout, then its interactive UI. Its accessible heading is present from the initial HTML. A descriptive fallback is available inside noscript when JavaScript is disabled; it is not a temporary landing screen.
- `scripts/prerender-meta.mjs` writes the route documents, custom `404.html`, page styles, editor-only module preloads and sitemap. The build-only Preact renderer is not a client dependency.
- `vercel.json` serves the generated files with the filesystem router. Do not add a catch-all rewrite to the homepage: it turns missing addresses into soft 404s.

The sitemap is generated from the indexable route list. It omits `lastmod` rather than presenting every deployment as a content update. Do not add ratings, reviews or FAQ rich-result markup without a supported, visible source. The current schema describes the site, free browser application, example collection, articles and breadcrumbs.

The social card is a real 1200 × 630 PNG with matching dimensions and alt text. Package support means browser-compatible npm modules through esm.sh, not a Node.js server. Keep copy consistent with that boundary and the browser-local nature of saves.

## Verification

```sh
npm ci
npm run check
npm audit --audit-level=high

# After deployment: read raw responses from every public route,
# then check real 404 responses, social image and permanent redirects.
npm run verify:seo -- https://tryjs.app
```

`npm run build` includes verification of all generated documents, unique metadata, canonical URLs, JSON-LD, page styles, image/script files, internal links, sitemap coverage and social-card dimensions. The unit tests cover route eligibility, collection completeness and safe serialization.

Also check the rendered browser: JS → Web → React → Back, embeds, a missing route, a snippet detail, the Features reading order and keyboard-operated FAQ, and mobile layout at 320/375 px, tablet and desktop. The initial HTML and the rendered document must agree about their canonical URL and indexing policy. The collection and informational page documents must not import or preload an editor, sandbox or TypeScript worker. After JavaScript loads, an example detail mounts one same-origin `/embed?example=<known-slug>` editor. This isolated frame runs the existing sandbox and never saves over the main drafts. The parent document keeps its readable, prerendered source and explanation without JavaScript.

Features uses desktop WebP captures of the actual playground and My playgrounds panel. There are no separate mobile or tablet promotional captures. The screenshot fallback loads eagerly; supporting images load lazily. Image sizes are checked against their WebP headers during build verification. The page remains readable with JavaScript disabled, including the native FAQ disclosures.

The use-case section keeps its guidance in `FEATURES`, so all three workflows are prerendered and included in structured data. One shared live editor replaces the separate hero screenshot when the section enters view. It mounts the real `/embed?demo=<known-id>` runtime and changes only that frame when the user chooses another workflow or resets. Without JavaScript, the real product screenshot and a link to the initial runnable example remain available. The README uses one short recording of these real interactions instead of illustrations.

The demo frame never writes normal drafts or saved playgrounds. It suppresses its own analytics and sends only a bounded ready/open message to the owning page. The parent checks the message origin, source window and selected demo. The visible frame's Open in TryJS link carries the current edited snapshot, while the loading fallback opens the original example.

Indexing, query performance and field Core Web Vitals should be monitored in Search Console when access is available. These cannot be established by a local build or an automated SEO score.

## References

- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: sitemap best practices and accurate lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: hidden text and legitimate expandable content](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse)
- [Vercel: static project routing](https://vercel.com/docs/project-configuration/vercel-json)
