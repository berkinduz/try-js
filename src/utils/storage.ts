const sessionFallback = new Map<string, string>();

/** Drafts and editor preferences must not stop the app when browser storage is blocked. */
export function readLocal(key: string): string | null {
  if (sessionFallback.has(key)) return sessionFallback.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    return sessionFallback.get(key) ?? null;
  }
}

export function writeLocal(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    sessionFallback.delete(key);
    return true;
  } catch {
    sessionFallback.set(key, value);
    return false;
  }
}
