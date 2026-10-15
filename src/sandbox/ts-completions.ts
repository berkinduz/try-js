import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { requestTypes } from "./type-checker";
import type { HoverInfo, TypeCompletion } from "./type-protocol";
export type { HoverInfo } from "./type-protocol";

/** Compiler work runs in a worker; the editor's existing snippets stay immediately available. */
export async function tsCompletionSource(ctx: CompletionContext, jsx = false): Promise<CompletionResult | null> {
  if (!ctx.explicit && !ctx.matchBefore(/\w+|\.$/)) return null;
  try {
    const options = await requestTypes<TypeCompletion[]>("completion", ctx.state.doc.toString(), ctx.pos, jsx);
    if (ctx.aborted || !options.length) return null;
    return { from: ctx.matchBefore(/\w*/)?.from ?? ctx.pos, options, validFor: /^\w*$/ };
  } catch {
    return null;
  }
}

export async function getHoverInfo(source: string, pos: number, jsx = false): Promise<HoverInfo | null> {
  try { return await requestTypes<HoverInfo | null>("hover", source, pos, jsx); }
  catch { return null; }
}
