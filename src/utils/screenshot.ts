import { parser } from "@lezer/javascript";
import { highlightCode, tagHighlighter, tags } from "@lezer/highlight";
import type { SyntaxThemeId } from "../components/Editor/themes";
import { SCREENSHOT_THEMES, type ThemeColors } from "./screenshotThemes";

// Maps Lezer tags to our ThemeColors keys
const screenshotHighlighter = tagHighlighter([
  { tag: tags.keyword, class: "keyword" },
  { tag: tags.comment, class: "comment" },
  { tag: tags.string, class: "string" },
  { tag: tags.number, class: "number" },
  { tag: tags.bool, class: "bool" },
  { tag: tags.null, class: "number" },
  { tag: tags.function(tags.variableName), class: "function" },
  { tag: tags.definition(tags.variableName), class: "definition" },
  { tag: tags.typeName, class: "typeName" },
  { tag: tags.propertyName, class: "propertyName" },
  { tag: tags.operator, class: "operator" },
  { tag: tags.punctuation, class: "punctuation" },
  { tag: tags.className, class: "className" },
  { tag: tags.regexp, class: "regexp" },
  { tag: tags.variableName, class: "variableName" },
]);

interface ColoredSpan {
  text: string;
  color: string;
}

function tokenize(code: string, colors: ThemeColors): ColoredSpan[][] {
  const tree = parser.parse(code);
  const lines: ColoredSpan[][] = [[]];

  highlightCode(
    code,
    tree,
    screenshotHighlighter,
    (text: string, classes: string) => {
      const color = classes
        ? (colors[classes as keyof ThemeColors] ?? colors.fg)
        : colors.fg;
      const parts = text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) lines.push([]);
        if (parts[i]) lines[lines.length - 1].push({ text: parts[i], color });
      }
    },
    () => {
      lines.push([]);
    }
  );

  return lines;
}

export type ScreenshotPadding = "compact" | "normal" | "wide";
export type ScreenshotFrame = "none" | "safari" | "minimal";
export type ScreenshotBackground =
  | "transparent"
  | "sunset"
  | "ocean"
  | "aurora"
  | "mono"
  | "berry";

export const SCREENSHOT_BACKGROUND_OPTIONS: {
  id: ScreenshotBackground;
  label: string;
}[] = [
  { id: "transparent", label: "Transparent" },
  { id: "sunset", label: "Sunset" },
  { id: "ocean", label: "Ocean" },
  { id: "aurora", label: "Aurora" },
  { id: "mono", label: "Mono" },
  { id: "berry", label: "Berry" },
];

export interface ScreenshotOptions {
  themeId: SyntaxThemeId;
  padding: ScreenshotPadding;
  frame: ScreenshotFrame;
  background: ScreenshotBackground;
  fontFamily: string;
  fontSize: number;
}

const PADDING_MAP: Record<ScreenshotPadding, number> = {
  compact: 20,
  normal: 36,
  wide: 56,
};

function isLightBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function adjustBrightness(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Modern Safari-style frame (macOS Sonoma+).
 * Single unified bar: traffic lights on left, centered URL pill.
 */
function drawSafariFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  colors: ThemeColors
): number {
  const light = isLightBg(colors.bg);
  const barH = 52;

  // Unified bar bg
  ctx.fillStyle = light ? "#f0f0f0" : "#323234";
  ctx.beginPath();
  ctx.roundRect(0, 0, width, barH, [10, 10, 0, 0]);
  ctx.fill();

  // Bottom separator
  ctx.fillStyle = light ? "#d4d4d8" : "#3f3f46";
  ctx.fillRect(0, barH - 0.5, width, 0.5);

  // Traffic lights — smaller, modern
  const dotY = barH / 2;
  const dotStartX = 18;
  const dotR = 5.5;
  const dotGap = 19;
  const dots = ["#ff5f57", "#febc2e", "#28c840"];
  for (let i = 0; i < dots.length; i++) {
    const cx = dotStartX + i * dotGap;
    ctx.beginPath();
    ctx.arc(cx, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dots[i];
    ctx.fill();
  }

  // URL pill — centered, wide
  const pillH = 30;
  const pillW = Math.min(width * 0.6, 340);
  const pillX = (width - pillW) / 2;
  const pillY = (barH - pillH) / 2;

  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 8);
  ctx.fillStyle = light ? "#e4e4e7" : "#27272a";
  ctx.fill();

  // URL text — just domain, centered, no lock
  const sysFont = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`;
  ctx.font = `500 13px ${sysFont}`;
  ctx.fillStyle = light ? "#71717a" : "#a1a1aa";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("tryjs.app", width / 2, barH / 2 + 0.5);

  // Reset
  ctx.textAlign = "start";
  ctx.textBaseline = "top";

  return barH;
}

/** Minimal frame: just traffic lights, no URL bar */
function drawMinimalFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  colors: ThemeColors
): number {
  const light = isLightBg(colors.bg);
  const frameH = 32;

  ctx.fillStyle = light
    ? adjustBrightness(colors.bg, -8)
    : adjustBrightness(colors.bg, 12);
  ctx.beginPath();
  ctx.roundRect(0, 0, width, frameH, [10, 10, 0, 0]);
  ctx.fill();

  const dotY = frameH / 2;
  const dotStartX = 16;
  const dotR = 5;
  const dotGap = 18;
  const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
  for (let i = 0; i < dotColors.length; i++) {
    ctx.beginPath();
    ctx.arc(dotStartX + i * dotGap, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dotColors[i];
    ctx.fill();
  }

  return frameH;
}

function paintExportBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: ScreenshotBackground
) {
  if (background === "transparent") return;

  if (background === "mono") {
    const solid = "#111827";
    ctx.fillStyle = solid;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (background === "sunset") {
    grad.addColorStop(0, "#f97316");
    grad.addColorStop(0.5, "#ec4899");
    grad.addColorStop(1, "#7c3aed");
  } else if (background === "ocean") {
    grad.addColorStop(0, "#0ea5e9");
    grad.addColorStop(0.5, "#2563eb");
    grad.addColorStop(1, "#1d4ed8");
  } else if (background === "aurora") {
    grad.addColorStop(0, "#22c55e");
    grad.addColorStop(0.5, "#06b6d4");
    grad.addColorStop(1, "#3b82f6");
  } else {
    grad.addColorStop(0, "#a855f7");
    grad.addColorStop(0.5, "#ec4899");
    grad.addColorStop(1, "#ef4444");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

export function renderScreenshot(
  code: string,
  options: ScreenshotOptions
): HTMLCanvasElement {
  const normalized = code.replace(/\t/g, "  ");
  const colors = SCREENSHOT_THEMES[options.themeId];
  const lines = tokenize(normalized, colors);

  const pad = PADDING_MAP[options.padding];
  const lineHeight = Math.round(options.fontSize * 1.6);

  // Measure max line width
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = `${options.fontSize}px ${options.fontFamily}`;

  let maxLineWidth = 0;
  for (const line of lines) {
    let w = 0;
    for (const span of line) {
      w += measureCtx.measureText(span.text).width;
    }
    maxLineWidth = Math.max(maxLineWidth, w);
  }

  const minWidth = 300;
  const cardWidth = Math.max(Math.ceil(maxLineWidth + pad * 2), minWidth);

  let frameHeight = 0;
  if (options.frame === "safari") frameHeight = 52;
  else if (options.frame === "minimal") frameHeight = 32;

  const cardHeight = Math.ceil(frameHeight + pad + lines.length * lineHeight + pad);
  const outerPad = 28;
  const canvasWidth = cardWidth + outerPad * 2;
  const canvasHeight = cardHeight + outerPad * 2;

  // High-DPI canvas
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 2;
  canvas.width = Math.round(canvasWidth * dpr);
  canvas.height = Math.round(canvasHeight * dpr);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  paintExportBackground(ctx, canvasWidth, canvasHeight, options.background);
  ctx.save();
  ctx.translate(outerPad, outerPad);

  // Code card with rounded corners
  ctx.beginPath();
  ctx.roundRect(0, 0, cardWidth, cardHeight, 10);
  ctx.fillStyle = colors.bg;
  ctx.fill();

  // Draw frame
  let actualFrameH = 0;
  if (options.frame === "safari") {
    actualFrameH = drawSafariFrame(ctx, cardWidth, colors);
  } else if (options.frame === "minimal") {
    actualFrameH = drawMinimalFrame(ctx, cardWidth, colors);
  }

  // Render syntax-highlighted code
  ctx.font = `${options.fontSize}px ${options.fontFamily}`;
  ctx.textBaseline = "top";

  const textStartY = actualFrameH + pad;
  for (let i = 0; i < lines.length; i++) {
    let x = pad;
    const y = textStartY + i * lineHeight + (lineHeight - options.fontSize) / 2;
    for (const span of lines[i]) {
      ctx.fillStyle = span.color;
      ctx.fillText(span.text, x, y);
      x += ctx.measureText(span.text).width;
    }
  }

  // Watermark — only when no frame (frame already shows tryjs.app in URL bar)
  if (options.frame === "none") {
    ctx.font = `500 10px ${options.fontFamily}`;
    ctx.fillStyle = colors.fg + "30";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillText("tryjs.app", cardWidth - pad * 0.6, cardHeight - pad * 0.4);
  }
  ctx.restore();

  return canvas;
}
