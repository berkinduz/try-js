import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import { foldedRanges, unfoldEffect } from "@codemirror/language";
import type { SourcePosition } from "../../sandbox/source-location.ts";
import { sourceOffset } from "../../sandbox/source-location.ts";

export const highlightSource = StateEffect.define<number | null>();
export const sourceHighlight = StateField.define({
  create: () => Decoration.none,
  update(value, transaction) {
    if (transaction.docChanged) value = Decoration.none;
    for (const effect of transaction.effects) {
      if (effect.is(highlightSource)) {
        value = effect.value === null ? Decoration.none : Decoration.set([
          Decoration.line({ class: "cm-error-target" }).range(effect.value),
        ]);
      }
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function revealSource(view: EditorView, position: SourcePosition): boolean {
  const offset = sourceOffset(view.state.doc.toString(), position);
  if (offset === null) return false;
  const effects: StateEffect<unknown>[] = [];
  foldedRanges(view.state).between(0, view.state.doc.length, (from, to) => {
    if (from < offset && to >= offset) effects.push(unfoldEffect.of({ from, to }));
  });
  effects.push(
    highlightSource.of(view.state.doc.line(position.line).from),
    EditorView.scrollIntoView(offset, { y: "center", x: "nearest" }),
    EditorView.announce.of(`Line ${position.line}, column ${position.column}`),
  );
  view.dispatch({ selection: { anchor: offset }, effects });
  view.focus();
  return true;
}
