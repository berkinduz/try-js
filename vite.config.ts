import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { SYNTAX_THEMES } from "./src/data/themes";
import { getPageSeo } from "./src/data/seo";
import { renderSeoHead } from "./src/utils/seo";

export default defineConfig({
  plugins: [
    preact(),
    {
      name: "tryjs-seo",
      transformIndexHtml(html) {
        const lightThemes = JSON.stringify(
          SYNTAX_THEMES.filter((theme) => theme.mode === "light").map(
            (theme) => theme.id,
          ),
        );
        return html
          .replace(
            "<!-- theme:bootstrap -->",
            () =>
              `<script>try { document.documentElement.setAttribute("data-theme", ${lightThemes}.includes(localStorage.getItem("jspark:syntaxTheme")) ? "light" : "dark"); } catch {}</script>`,
          )
          .replace(
            /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,
            () =>
              `<!-- seo:start -->\n${renderSeoHead(getPageSeo("/"))}\n<!-- seo:end -->`,
          );
      },
    },
  ],
  build: {
    manifest: true,
    target: "es2020",
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: [
            "@codemirror/state",
            "@codemirror/view",
            "@codemirror/language",
            "@codemirror/lang-javascript",
            "@codemirror/autocomplete",
            "@codemirror/commands",
            "@codemirror/search",
            "@codemirror/lint",
            "@codemirror/theme-one-dark",
          ],
          sucrase: ["sucrase"],
        },
      },
    },
  },
});
