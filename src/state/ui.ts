import { signal } from "@preact/signals";

function isEmbedMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  const embed = params.get("embed");
  return embed === "1" || embed === "true";
}

export const embedMode = signal(isEmbedMode());
