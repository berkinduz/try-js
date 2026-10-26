export type FeatureDetail = {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export type FeatureSection = {
  id: string;
  title: string;
  summary: string;
  details: FeatureDetail[];
};

/** Visible narrative and structured data share the same content and order. */
export const FEATURES: FeatureSection[] = [
  {
    id: "use-cases",
    title: "Try it. Tweak it.",
    summary:
      "Three tiny experiments. One real playground.",
    details: [
      {
        title: "Check a snippet",
        description:
          "Change an input. Check what comes back.",
        href: "/",
        linkLabel: "Check a JS / TS snippet",
      },
      {
        title: "Play with React",
        description:
          "Click a button. Make it work your way.",
        href: "/react",
        linkLabel: "Open the React playground",
      },
      {
        title: "Share a bug",
        description:
          "Small example. Same error. One shareable link.",
        href: "/",
        linkLabel: "Share a small repro",
      },
    ],
  },
  {
    id: "try-code",
    title: "Pick your playground",
    summary:
      "JavaScript, TypeScript, Web or React. No project setup.",
    details: [
      {
        title: "JavaScript & TypeScript",
        description:
          "Try functions and async snippets. Switch to TypeScript for type checks, completions and hover information.",
        href: "/",
        linkLabel: "Open JS / TS",
      },
      {
        title: "Browser-ready npm imports",
        description:
          "Import browser-ready npm packages, including specific versions. No local installation.",
      },
      {
        title: "HTML, CSS & JavaScript",
        description:
          "Three tabs for HTML, CSS and JavaScript. One live preview.",
        href: "/web",
        linkLabel: "Open Web",
      },
      {
        title: "React components & hooks",
        description:
          "JSX, hooks, CSS and npm imports, with a live React 19 preview.",
        href: "/react",
        linkLabel: "Open React",
      },
    ],
  },
  {
    id: "understand-results",
    title: "See what's happening",
    summary:
      "Inspect values, follow errors, copy what matters.",
    details: [
      {
        title: "Look inside the output",
        description:
          "Expand objects, Maps and Sets. Compare rows with console.table.",
      },
      {
        title: "Go back to the source",
        description:
          "Click a JS/TS error's source location to jump back to the code.",
      },
      {
        title: "Copy what you need",
        description:
          "Copy any console row as plain text, across all playgrounds.",
      },
    ],
  },
  {
    id: "share-or-save",
    title: "Share now. Save for later.",
    summary:
      "A quick link, a local save, or a JSON backup.",
    details: [
      {
        title: "Send a runnable example",
        description:
          "Copy a runnable snapshot or an iframe embed. JS / TS also supports sharing a selection.",
      },
      {
        title: "Keep an idea in this browser",
        description:
          "Named playgrounds stay in this browser. Save changes when you're ready.",
      },
      {
        title: "Take a copy with you",
        description:
          "Download a JSON backup to keep your work or open it in another browser.",
      },
    ],
  },
  {
    id: "editor-comforts",
    title: "A few useful comforts",
    summary: "Small editor tools, there when you want them.",
    details: [
      {
        title: "Format on your terms",
        description:
          "Format the active tab with Format or Shift+Alt+F. One Undo restores it.",
      },
      {
        title: "Your way to edit",
        description:
          "Optional Vim keys, syntax themes, fonts and wrapping. Set up your space.",
      },
      {
        title: "A picture of the code",
        description:
          "Export JS / TS as a PNG. Choose the frame, padding and background.",
      },
    ],
  },
];

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const FEATURE_IMAGES: Record<
  "playground" | "console" | "saves",
  ProductImage
> = {
  playground: {
    src: "/images/features/playground-desktop.webp",
    width: 2320,
    height: 1140,
    alt: "TryJS JavaScript playground with the editor, Format, sharing and console tools.",
  },
  console: {
    src: "/images/features/console-desktop.webp",
    width: 1106,
    height: 548,
    alt: "TryJS console with a table of prices, an inspectable object and an error linked to its source line.",
  },
  saves: {
    src: "/images/features/local-saves-desktop.webp",
    width: 840,
    height: 642,
    alt: "My playgrounds showing a named example saved in this browser and a JSON import action.",
  },
};
