import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
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
