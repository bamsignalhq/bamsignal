/** Safe localStorage helpers — corrupt JSON is removed and fallback returned. */

export type LastApiError = {
  endpoint: string;
  message: string;
  at: string;
};

let lastApiError: LastApiError | null = null;

export function recordApiError(endpoint: string, message: string): void {
  lastApiError = {
    endpoint: String(endpoint || "unknown").slice(0, 120),
    message: String(message || "Request failed").slice(0, 240),
    at: new Date().toISOString()
  };
}

export function getLastApiError(): LastApiError | null {
  return lastApiError;
}

export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[safe-storage] removed corrupt key", key, error);
    }
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
}

export function safeSetJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[safe-storage] write failed", key, error);
    }
    return false;
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function safeGetString(key: string, fallback = ""): string {
  try {
    const raw = localStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSetString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
