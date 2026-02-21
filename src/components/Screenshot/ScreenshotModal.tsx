import { useEffect, useRef, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { syntaxTheme } from "../../state/editor";
import { editorFont, EDITOR_FONTS } from "../../state/settings";
import { SYNTAX_THEMES } from "../Editor/themes";
import type { SyntaxThemeId } from "../Editor/themes";
import { renderScreenshot, SCREENSHOT_BACKGROUND_OPTIONS } from "../../utils/screenshot";
import type { ScreenshotPadding, ScreenshotFrame, ScreenshotBackground } from "../../utils/screenshot";
import { showToast } from "../Toast/Toast";
import "./ScreenshotModal.css";

export const screenshotModalOpen = signal(false);
export const screenshotCode = signal<string>("");

export function openScreenshotModal(code: string) {
  screenshotCode.value = code;
  screenshotModalOpen.value = true;
}

function closeScreenshotModal() {
  screenshotModalOpen.value = false;
}

export function ScreenshotModal() {
  const isOpen = screenshotModalOpen.value;
  const codeToRender = screenshotCode.value;

  const [previewTheme, setPreviewTheme] = useState<SyntaxThemeId>(syntaxTheme.value);
  const [padding, setPadding] = useState<ScreenshotPadding>("normal");
  const [frame, setFrame] = useState<ScreenshotFrame>("safari");
  const [background, setBackground] = useState<ScreenshotBackground>("sunset");
  const previewRef = useRef<HTMLDivElement>(null);

  // Sync theme when modal opens
  useEffect(() => {
    if (isOpen) setPreviewTheme(syntaxTheme.value);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeScreenshotModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Render live preview
  useEffect(() => {
    if (!isOpen || !previewRef.current || !codeToRender) return;

    const fontDef = EDITOR_FONTS.find((f) => f.id === editorFont.value);
    const fontFamily = fontDef?.fontFamily ?? '"Geist Mono", monospace';

    // Wait for fonts to be ready before rendering
    document.fonts.ready.then(() => {
      if (!previewRef.current) return;
      const canvas = renderScreenshot(codeToRender, {
        themeId: previewTheme,
        padding,
        frame,
        background,
        fontFamily,
        fontSize: 14,
      });
      canvas.style.maxWidth = "100%";
      canvas.style.height = "auto";
      canvas.style.borderRadius = "6px";
      previewRef.current.innerHTML = "";
      previewRef.current.appendChild(canvas);
    });
  }, [isOpen, codeToRender, previewTheme, padding, frame, background]);

  const getOptions = () => {
    const fontDef = EDITOR_FONTS.find((f) => f.id === editorFont.value);
    return {
      themeId: previewTheme,
      padding,
      frame,
      background,
      fontFamily: fontDef?.fontFamily ?? '"Geist Mono", monospace',
      fontSize: 14,
    };
  };

  const handleDownload = () => {
    const canvas = renderScreenshot(codeToRender, getOptions());
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tryjs-snippet.png";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Image downloaded!");
    }, "image/png");
  };

  const handleCopy = async () => {
    const canvas = renderScreenshot(codeToRender, getOptions());
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Image copied to clipboard!");
      } catch {
        showToast("Failed to copy image", "error");
      }
    }, "image/png");
  };

  if (!isOpen) return null;

  return (
    <div class="screenshot-backdrop" onClick={closeScreenshotModal}>
      <div class="screenshot-modal" onClick={(e) => e.stopPropagation()}>
        <div class="screenshot-header">
          <h2 class="screenshot-title">Export as Image</h2>
          <button
            type="button"
            class="screenshot-close"
            onClick={closeScreenshotModal}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="screenshot-body">
          <div
            class={`screenshot-preview ${background === "transparent" ? "screenshot-preview--transparent" : ""}`}
            ref={previewRef}
          />

          <div class="screenshot-controls">
            <label class="screenshot-control">
              <span class="screenshot-label">Theme</span>
              <select
                class="screenshot-select"
                value={previewTheme}
                onChange={(e) => setPreviewTheme((e.target as HTMLSelectElement).value as SyntaxThemeId)}
              >
                {SYNTAX_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label class="screenshot-control">
              <span class="screenshot-label">Padding</span>
              <select
                class="screenshot-select"
                value={padding}
                onChange={(e) => setPadding((e.target as HTMLSelectElement).value as ScreenshotPadding)}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </label>

            <label class="screenshot-control">
              <span class="screenshot-label">Frame</span>
              <select
                class="screenshot-select"
                value={frame}
                onChange={(e) => setFrame((e.target as HTMLSelectElement).value as ScreenshotFrame)}
              >
                <option value="safari">Safari</option>
                <option value="minimal">Minimal</option>
                <option value="none">None</option>
              </select>
            </label>

            <label class="screenshot-control">
              <span class="screenshot-label">Background</span>
              <select
                class="screenshot-select"
                value={background}
                onChange={(e) => setBackground((e.target as HTMLSelectElement).value as ScreenshotBackground)}
              >
                {SCREENSHOT_BACKGROUND_OPTIONS.map((bg) => (
                  <option key={bg.id} value={bg.id}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div class="screenshot-actions">
            <button
              type="button"
              class="screenshot-btn screenshot-btn--primary"
              onClick={handleDownload}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PNG
            </button>
            <button
              type="button"
              class="screenshot-btn"
              onClick={handleCopy}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
