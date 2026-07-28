import { signal } from "@preact/signals";

function isEmbedMode(): boolean {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/embed";
}

export const embedMode = signal(isEmbedMode());
