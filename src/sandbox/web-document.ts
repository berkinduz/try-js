import { hasImports, rewriteImports } from "./transpiler.ts";

export function buildWebDocument(html: string, css: string, code: string, generation: number, consoleBootstrap: string): string {
  const bootstrap = consoleBootstrap.replace(/__TRYJS_GENERATION__/g, String(generation)).replace(/<\/script/gi, "<\\/script");
  const isModule = hasImports(code);
  const js = (isModule ? rewriteImports(code) : code).replace(/<\/script/gi, "<\\/script");
  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${safeCss}</style><script>${bootstrap}</script></head><body>${html}<script${isModule ? ' type="module"' : ""}>${js}</script></body></html>`;
}
