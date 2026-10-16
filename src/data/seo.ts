import { FEATURES } from "./features.ts";
import { findSnippetBySlug, getAllSnippets } from "./snippets.ts";

export const SITE_URL = "https://tryjs.app";
export const SEO_SCHEMA_ID = "tryjs-schema";
export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/og-tryjs.png`,
  alt: "JavaScript code for running parallel promises in TryJS",
  width: 1200,
  height: 630,
};

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  heading: string;
  canonical?: string;
  robots: string;
  type: "website" | "article";
  status: 200 | 404;
  schema: Record<string, unknown>[];
}

const PAGES = {
  "/": {
    title: "JavaScript & TypeScript Playground Online | TryJS",
    description:
      "Run JavaScript and TypeScript instantly in your browser. Try npm imports, format code, inspect console output and share runnable examples. No signup.",
    heading: "JavaScript and TypeScript playground",
  },
  "/web": {
    title: "HTML, CSS & JavaScript Playground | TryJS",
    description:
      "Try HTML, CSS and JavaScript together with a live browser preview and console. Format each tab, import npm packages and share your example. No setup.",
    heading: "HTML, CSS and JavaScript playground",
  },
  "/react": {
    title: "React Playground — JSX, Hooks & Live Preview | TryJS",
    description:
      "Try React 19 components, JSX, hooks and CSS with a live preview. Import npm packages, format code and share a runnable example from your browser. No signup.",
    heading: "React playground with JSX and live preview",
  },
  "/features": {
    title: "TryJS Features — JavaScript, TypeScript, Web & React",
    description:
      "Try JavaScript, TypeScript, Web and React in your browser. Inspect console output, follow errors, share runnable links and optionally save examples locally.",
    heading: "Try code. See what happens.",
  },
  "/snippets": {
    title: "JavaScript & TypeScript Examples You Can Run | TryJS",
    description:
      "Explore runnable JavaScript and TypeScript examples with explanations: arrays, async patterns, types and more. Open any example in TryJS to edit and run it.",
    heading: "Runnable JavaScript and TypeScript examples",
  },
} as const;

export function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function getIndexablePaths(): string[] {
  return [
    ...Object.keys(PAGES),
    ...getAllSnippets().map((snippet) => `/snippets/${snippet.slug}`),
  ];
}

function breadcrumbs(path: string, name: string): Record<string, unknown> {
  const items = [{ name: "TryJS", item: `${SITE_URL}/` }];
  if (path.startsWith("/snippets/"))
    items.push({ name: "Examples", item: `${SITE_URL}/snippets` });
  items.push({ name, item: `${SITE_URL}${path}` });
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${path}#breadcrumbs`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    })),
  };
}

/** The build and browser use the same route policy, copy and structured data. */
export function getPageSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname);
  const snippet = path.startsWith("/snippets/")
    ? findSnippetBySlug(path.slice("/snippets/".length))?.snippet
    : undefined;
  const page = Object.prototype.hasOwnProperty.call(PAGES, path)
    ? PAGES[path as keyof typeof PAGES]
    : undefined;
  if (!page && !snippet) {
    const embed = path === "/embed";
    return {
      path,
      title: embed
        ? "TryJS Embed — Runnable Code Example"
        : "Page Not Found | TryJS",
      description: embed
        ? "An interactive TryJS code example. Enable JavaScript to edit and run the code."
        : "This page could not be found. Open the TryJS playground or browse runnable JavaScript and TypeScript examples.",
      heading: embed ? "TryJS code example" : "Page not found",
      robots: "noindex, follow",
      type: "website",
      status: embed ? 200 : 404,
      schema: [],
    };
  }

  const canonical = `${SITE_URL}${path}`;
  const { title, description, heading } = snippet
    ? {
        title: `${snippet.seoTitle} | TryJS`,
        description: snippet.seoDescription,
        heading: snippet.seoTitle,
      }
    : page!; // A real page or snippet is guaranteed by the route guard above.
  const webPage: Record<string, unknown> = {
    "@type": path === "/snippets" ? "CollectionPage" : "WebPage",
    "@id": `${canonical}#webpage`,
    name: title,
    description,
    url: canonical,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
  const schema: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "TryJS",
      url: `${SITE_URL}/`,
      inLanguage: "en",
    },
    webPage,
  ];
  if (path !== "/") {
    schema.push(breadcrumbs(path, snippet?.title ?? heading));
    webPage.breadcrumb = { "@id": `${canonical}#breadcrumbs` };
  }
  if (path === "/" || path === "/web" || path === "/react") {
    const featureList =
      path === "/"
        ? [
            "JavaScript and TypeScript with automatic execution",
            "Type-aware TypeScript completions, hover information and diagnostics",
            "Browser-compatible npm imports via esm.sh",
            "Code formatting with Prettier",
            "Inspectable console output with copy actions",
            "Source navigation from JavaScript and TypeScript errors",
            "Optional browser-local saves and JSON import and export",
            "Shareable links, iframe embeds and code image export",
            "Optional Vim keybindings, syntax themes and editor fonts",
          ]
        : [
            path === "/react"
              ? "React 19, JSX, hooks and CSS with live preview"
              : "HTML, CSS and JavaScript tabs with live preview",
            "Browser-compatible npm imports via esm.sh",
            "Code formatting for the active editor tab",
            "Console output with copy actions",
            "Optional browser-local saves, shareable links and iframe embeds",
          ];
    schema.push({
      "@type": "WebApplication",
      "@id": `${canonical}#application`,
      name:
        path === "/"
          ? "TryJS"
          : path === "/web"
            ? "TryJS Web Playground"
            : "TryJS React Playground",
      url: canonical,
      description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://github.com/berkinduz/try-js/blob/main/LICENSE",
      featureList,
      sameAs: ["https://github.com/berkinduz/try-js"],
    });
    webPage.mainEntity = { "@id": `${canonical}#application` };
  } else if (path === "/features") {
    webPage.mainEntity = {
      "@type": "ItemList",
      numberOfItems: FEATURES.length,
      itemListElement: FEATURES.map((feature, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: feature.title,
        description: feature.summary,
        url: `${canonical}#${feature.id}`,
        item: {
          "@type": "WebPageElement",
          "@id": `${canonical}#${feature.id}`,
          name: feature.title,
          description: feature.details
            .map((detail) => `${detail.title}: ${detail.description}`)
            .join(" "),
        },
      })),
    };
  } else if (path === "/snippets") {
    webPage.mainEntity = {
      "@type": "ItemList",
      numberOfItems: getAllSnippets().length,
      itemListElement: getAllSnippets().map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.seoTitle,
        url: `${SITE_URL}/snippets/${item.slug}`,
      })),
    };
  } else if (snippet) {
    schema.push({
      "@type": "TechArticle",
      "@id": `${canonical}#article`,
      headline: snippet.seoTitle,
      description,
      url: canonical,
      inLanguage: "en",
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      author: {
        "@type": "Person",
        name: "berkinduz",
        url: "https://github.com/berkinduz",
      },
      publisher: {
        "@type": "Organization",
        name: "TryJS",
        url: `${SITE_URL}/`,
      },
    });
    webPage.mainEntity = { "@id": `${canonical}#article` };
  }
  return {
    path,
    title,
    description,
    heading,
    canonical,
    robots: "index, follow, max-image-preview:large",
    type: snippet ? "article" : "website",
    status: 200,
    schema,
  };
}
