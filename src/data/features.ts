export type FeatureItem = {
  id: string;
  tab: string;
  title: string;
  summary: string;
  points: string[];
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export const FEATURES: FeatureItem[] = [
  {
    id: "javascript-typescript",
    tab: "JS / TS",
    title: "Run JavaScript and TypeScript instantly",
    summary:
      "Write code, switch between JavaScript and TypeScript, and see console output directly in your browser.",
    points: [
      "No signup or installation needed",
      "TypeScript completions, hover information and diagnostics",
      "Live console for logs, warnings, errors, tables, and timings",
      "JavaScript and TypeScript errors can link back to the source",
    ],
    image: "/images/javascript-playground.jpg",
    imageWidth: 1280,
    imageHeight: 720,
    imageAlt: "TryJS JavaScript and TypeScript playground demo",
  },
  {
    id: "web-playground",
    tab: "Web",
    title: "Build HTML, CSS, and JavaScript with live preview",
    summary:
      "The Web Playground gives you a tabbed HTML/CSS/JS editor with instant browser preview and console feedback.",
    points: [
      "Separate HTML, CSS, and JS tabs",
      "Live preview updates as you type",
      "No local server or bundler required",
      "Good for prototypes, demos, and quick UI experiments",
    ],
    image: "/tryjs_html_gif.gif",
    imageWidth: 1280,
    imageHeight: 610,
    imageAlt: "TryJS Web Playground with HTML/CSS/JS live preview",
  },
  {
    id: "react-playground",
    tab: "React",
    title: "Write JSX components with live rendering",
    summary:
      "React mode gives you a JSX editor with a CSS tab, live-rendered using React 19 from esm.sh. Use hooks, import npm packages, and see your component update as you type.",
    points: [
      "JSX editor with useState, useEffect, and full hook support",
      "Live component preview powered by React 19 via esm.sh",
      "Error and warning badges surface issues inline",
      "Starter template to go from zero to running in one click",
    ],
    image: "/tryjs_react_gif.gif",
    imageWidth: 1216,
    imageHeight: 720,
    imageAlt: "TryJS React playground demo",
  },
  {
    id: "npm-imports",
    tab: "NPM Imports",
    title: "Run package-based examples without setup churn",
    summary:
      "Try browser-compatible npm packages through esm.sh, including versioned and scoped imports. Packages that require a Node.js server are outside this browser playground.",
    points: [
      "Use imports directly in editor code",
      "No local install, no node_modules",
      "Good for trying APIs before committing",
    ],
    image: "/tryjs_import.png",
    imageWidth: 912,
    imageHeight: 756,
    imageAlt: "TryJS NPM imports code example",
  },
  {
    id: "themes",
    tab: "Themes",
    title: "Six syntax themes, three editor fonts",
    summary:
      "Swap between One Dark, One Light, Dracula, GitHub Light, Monokai, and Solarized Dark — and pair them with Geist Mono, Fira Code, or JetBrains Mono. Your choice persists across sessions.",
    points: [
      "6 syntax themes with instant preview",
      "3 curated monospace fonts",
      "Configurable font size, tab size, word wrap, auto-run delay",
      "All preferences saved to localStorage",
    ],
    image: "/tryJS_theme_change_gif.gif",
    imageWidth: 1280,
    imageHeight: 650,
    imageAlt: "TryJS theme change demo",
  },
  {
    id: "share-embed",
    tab: "Share / Embed",
    title: "Send runnable context instead of static code blocks",
    summary:
      "Share links preserve editor state, and embeds let docs include live examples with minimal overhead.",
    points: [
      "URL sharing with code state",
      "Iframe embed for docs and blog posts",
      "Selection-level sharing for focused examples",
    ],
    image: "/embed_code.png",
    imageWidth: 2254,
    imageHeight: 864,
    imageAlt: "TryJS share and embed capabilities",
  },
  {
    id: "export-png",
    tab: "Export PNG",
    title: "Produce consistent code visuals in one pass",
    summary:
      "Export with frame, padding, syntax theme, and background presets for release notes and social content.",
    points: [
      "Uniform output dimensions",
      "Gradient and transparent backgrounds",
      "Download or copy-to-clipboard flow",
    ],
    image: "/tryjs_export_image_gif.gif",
    imageWidth: 1080,
    imageHeight: 720,
    imageAlt: "TryJS export code to image demo",
  },
  {
    id: "examples",
    tab: "Examples",
    title: "Start from runnable examples when useful",
    summary:
      "The examples library is a supporting entry point for loading working JavaScript, async, and TypeScript patterns into the playground.",
    points: [
      "One click to load and run",
      "Good defaults for learning and demos",
      "Quick path from working code to your own variation",
    ],
    image: "/images/javascript-playground.jpg",
    imageWidth: 1280,
    imageHeight: 720,
    imageAlt: "TryJS runnable examples loading into the playground",
  },
  {
    id: "editing",
    tab: "Editing",
    title: "Format code when you choose",
    summary:
      "Use Format above any editor, or Shift+Alt+F, to tidy the active JavaScript, TypeScript, HTML, CSS or JSX tab. Formatting runs locally and can be reversed with one Undo.",
    points: [
      "Prettier and parsers load on the first format request",
      "Only the active tab is formatted",
      "Optional Vim keybindings in editor settings",
    ],
    image: "/images/javascript-playground.jpg",
    imageWidth: 1280,
    imageHeight: 720,
    imageAlt: "TryJS editor with a visible Format action and console output",
  },
  {
    id: "console-tools",
    tab: "Console tools",
    title: "Follow errors and keep useful output",
    summary:
      "Inspect objects in the console, copy a row as plain text, or follow a JavaScript or TypeScript error back to the matching line of code.",
    points: [
      "Copy captured output in JS, TS, Web and React consoles",
      "Source links appear when a JS or TS error has a reliable location",
      "TypeScript checks run in a local worker with available npm package types",
    ],
    image: "/images/javascript-playground.jpg",
    imageWidth: 1280,
    imageHeight: 720,
    imageAlt:
      "TryJS JavaScript console showing a table, an expanded Set and a result",
  },
  {
    id: "local-saves",
    tab: "Local saves",
    title: "Keep an idea without creating an account",
    summary:
      "Normal drafts are restored in this browser when storage is available. For a named save, open My playgrounds and choose Save current code. Saving is optional.",
    points: [
      "Open a named save, edit it and explicitly save changes",
      "Close playground returns to the code you were working on before",
      "Download or import a TryJS JSON file to move work between browsers",
      "Local saves belong to this browser; they do not sync to an account",
    ],
    image: "/images/my-playgrounds.jpg",
    imageWidth: 435,
    imageHeight: 515,
    imageAlt:
      "My playgrounds with named local saves and JSON download and import actions",
  },
];
