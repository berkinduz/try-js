import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: EventProps) => void;
    };
  }
}

/**
 * Tracks an event in both Vercel Analytics and Umami.
 * Safe to call before Umami script has loaded — calls are no-ops in that case.
 */
export function trackEvent(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // Vercel Analytics not available (dev mode, blocked, etc.)
  }
  try {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(name, props);
    }
  } catch {
    // Umami not loaded yet or blocked
  }
}
