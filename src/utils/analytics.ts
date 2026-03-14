import { track } from "@vercel/analytics";

export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  track(name, props);
}
