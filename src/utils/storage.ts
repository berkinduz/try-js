const sessionFallback = new Map<string, string>();
const tabFallback = new Map<string, string>();

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

/** The active saved document belongs to this tab; another tab must not replace its identity. */
export function readSession(key: string): string | null {
  if (tabFallback.has(key)) return tabFallback.get(key)!;
  try { return sessionStorage.getItem(key); }
  catch { return tabFallback.get(key) ?? null; }
}

export function writeSession(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    tabFallback.delete(key);
    return true;
  } catch {
    tabFallback.set(key, value);
    return false;
  }
}
