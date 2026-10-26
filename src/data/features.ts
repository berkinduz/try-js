export type FeatureIllustration = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type FeatureDetail = {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  image?: FeatureIllustration;
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
    title: "Start with a real question",
    summary:
      "Check an AI-generated snippet, explore a React behavior, or share a small reproducible bug. Give the code something specific to answer.",
    details: [
      {
        title: "Check AI-generated code",
        description:
          "Paste JavaScript or TypeScript from an AI assistant. Change the inputs, inspect the output and follow errors back to the code. Use TypeScript diagnostics to help check the types behind the suggestion.",
        href: "/",
        linkLabel: "Check a JS / TS snippet",
        image: {
          src: "/images/use-cases/check-ai-code.webp",
          width: 1536,
          height: 1024,
          alt: "Illustration of an assistant's code snippet moving into a browser editor and console for inspection.",
        },
      },
      {
        title: "Explore a React behavior",
        description:
          "Change a component's state, props or hooks and watch the live React 19 preview. Isolate one interaction, try a different approach and bring what you learn back to your app.",
        href: "/react",
        linkLabel: "Open the React playground",
        image: {
          src: "/images/use-cases/react-behavior.webp",
          width: 1536,
          height: 1024,
          alt: "Illustration of a React code change updating a toggle in a live preview, with a loop connecting code and state.",
        },
      },
      {
        title: "Share a reproducible bug",
        description:
          "Reduce a browser issue to the smallest example that still fails. Copy a share link so someone else can run the same code and inspect what happens. Include the expected result in your bug report.",
        href: "/web",
        linkLabel: "Build a Web repro",
        image: {
          src: "/images/use-cases/share-repro.webp",
          width: 1536,
          height: 1024,
          alt: "Illustration of two browser editors connected by a share link, each showing the same small example and error.",
        },
      },
    ],
  },
  {
    id: "try-code",
    title: "Try a small piece of code",
    summary:
      "Check a function, explore a package, or try an interface. Choose the playground that fits the question.",
    details: [
      {
        title: "JavaScript & TypeScript",
        description:
          "Try a function or work through an async example. Switch to TypeScript for type checking, completions and hover information.",
        href: "/",
        linkLabel: "Open JS / TS",
      },
      {
        title: "Browser-ready npm imports",
        description:
          "Import browser-compatible packages, including specific versions, through esm.sh. No local install needed; packages that require a Node.js server won't run here.",
      },
      {
        title: "HTML, CSS & JavaScript",
        description:
          "See how markup, styles and browser code work together. Each has its own tab, with a live Web preview beside the editor.",
        href: "/web",
        linkLabel: "Open Web",
      },
      {
        title: "React components & hooks",
        description:
          "Work out a component with JSX, hooks and a CSS tab. React 19 renders the preview as you type, with npm imports when you need them.",
        href: "/react",
        linkLabel: "Open React",
      },
    ],
  },
  {
    id: "understand-results",
    title: "Make sense of the result",
    summary:
      "Keep the output close to the code. Inspect what happened, follow an error, and take the useful parts with you.",
    details: [
      {
        title: "Look inside the output",
        description:
          "Expand objects and collections, compare rows with console.table, and see logs, warnings and errors together.",
      },
      {
        title: "Go back to the source",
        description:
          "Follow a JavaScript or TypeScript error to its line in the editor when a reliable source location is available.",
      },
      {
        title: "Copy what you need",
        description:
          "Copy a console row as plain text in JavaScript, TypeScript, Web or React. Keep a result for a note, a bug report or your next experiment.",
      },
    ],
  },
  {
    id: "share-or-save",
    title: "Share it. Or pick it up later.",
    summary:
      "An experiment can stay a quick experiment. Share or save only when you need to.",
    details: [
      {
        title: "Send a runnable example",
        description:
          "Copy a link with a snapshot of your code, or copy an iframe embed for a doc or blog post. In JS / TS, you can also share just the selected code.",
      },
      {
        title: "Keep an idea in this browser",
        description:
          "Named saves are optional. Use My playgrounds to save and reopen an example locally, then explicitly save changes when you're ready. There is no account sync.",
      },
      {
        title: "Take a copy with you",
        description:
          "Download a playground as a TryJS JSON file and import it in another browser. Browser storage can be cleared, so keep a file for work you want to keep.",
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
          "Use Format or Shift+Alt+F for the active JS, TS, HTML, CSS or JSX tab. Formatting runs locally and one Undo puts things back.",
      },
      {
        title: "Your way to edit",
        description:
          "Turn on optional Vim keybindings, choose a syntax theme and editor font, or adjust wrapping and font size in settings.",
      },
      {
        title: "A picture of the code",
        description:
          "Export JavaScript or TypeScript code as a PNG with a frame, padding and background of your choice.",
      },
    ],
  },
];

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  mobile: { src: string; width: number; height: number };
  tablet?: { src: string; width: number; height: number };
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
    tablet: {
      src: "/images/features/playground-tablet.webp",
      width: 1536,
      height: 1000,
    },
    mobile: {
      src: "/images/features/playground-mobile.webp",
      width: 640,
      height: 1160,
    },
  },
  console: {
    src: "/images/features/console-desktop.webp",
    width: 1106,
    height: 548,
    alt: "TryJS console with a table of prices, an inspectable object and an error linked to its source line.",
    mobile: {
      src: "/images/features/console-mobile.webp",
      width: 640,
      height: 582,
    },
  },
  saves: {
    src: "/images/features/local-saves-desktop.webp",
    width: 840,
    height: 642,
    alt: "My playgrounds showing a named example saved in this browser and a JSON import action.",
    mobile: {
      src: "/images/features/local-saves-mobile.webp",
      width: 572,
      height: 642,
    },
  },
};
