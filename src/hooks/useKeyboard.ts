import { useEffect } from "preact/hooks";

interface KeyBinding {
  key: string;
  mod?: boolean;    // Cmd (Mac) / Ctrl (Windows)
  shift?: boolean;
  handler: () => void;
}

export function useKeyboard(bindings: KeyBinding[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      for (const binding of bindings) {
        const keyMatch = e.key.toLowerCase() === binding.key.toLowerCase();
        const modMatch = binding.mod ? mod : !mod;
        const shiftMatch = binding.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && modMatch && shiftMatch) {
          e.preventDefault();
          binding.handler();
          return;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [bindings]);
}
