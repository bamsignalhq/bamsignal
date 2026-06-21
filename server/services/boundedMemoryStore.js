import { logObservabilityEvent } from "./observability.js";

export const MEMORY_STORE_MAX_ENTRIES = 5000;
export const MEMORY_STORE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
export const MEMORY_STORE_STALE_THROTTLE_MS = 24 * 60 * 60 * 1000;

const LOG_DEBOUNCE_MS = 60 * 1000;
const registeredStores = new Set();
let cleanupTimer = null;
let lastEvictionLogAt = 0;
let lastCleanupLogAt = 0;

function logMemoryStoreEviction(name, evicted, size, reason) {
  const now = Date.now();
  if (evicted <= 0 || now - lastEvictionLogAt < LOG_DEBOUNCE_MS) return;
  lastEvictionLogAt = now;
  logObservabilityEvent(
    "memory_store_eviction",
    { store: name, evicted, size, reason },
    "info"
  );
}

function logMemoryStoreCleanup(removed) {
  const now = Date.now();
  if (removed <= 0 || now - lastCleanupLogAt < LOG_DEBOUNCE_MS) return;
  lastCleanupLogAt = now;
  logObservabilityEvent(
    "memory_store_cleanup",
    { removed, stores: registeredStores.size },
    "info"
  );
}

function enforceCapacity(meta) {
  const { store, maxEntries, name } = meta;
  if (store.size <= maxEntries) return;

  let evicted = 0;
  while (store.size > maxEntries) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
    evicted += 1;
  }

  logMemoryStoreEviction(name, evicted, store.size, "cap");
}

/**
 * @param {string} name
 * @param {{
 *   maxEntries?: number,
 *   isExpired?: (value: unknown, now: number, key: string) => boolean
 * }} [options]
 */
export function createBoundedMemoryStore(name, options = {}) {
  const maxEntries = Number(options.maxEntries || MEMORY_STORE_MAX_ENTRIES);
  const isExpired = options.isExpired || (() => false);
  const store = new Map();
  const meta = { name, maxEntries, store, isExpired };

  registeredStores.add(meta);
  ensureMemoryStoreCleanupScheduled();

  return {
    get(key) {
      return store.get(key);
    },
    set(key, value) {
      if (store.has(key)) {
        store.delete(key);
      }
      store.set(key, value);
      enforceCapacity(meta);
      return store;
    },
    delete(key) {
      return store.delete(key);
    },
    clear() {
      store.clear();
    },
    keys() {
      return store.keys();
    },
    get size() {
      return store.size;
    }
  };
}

export function isOtpMemoryEntryExpired(value, now = Date.now()) {
  const expires = Number(value?.expires || 0);
  return expires > 0 && expires <= now;
}

export function isThrottleMemoryEntryExpired(value, now = Date.now()) {
  if (!value || typeof value !== "object") return true;
  const firstAttemptAt = Number(value.firstAttemptAt || 0);
  const lockedUntil = value.lockedUntil ? Number(value.lockedUntil) : null;
  if (lockedUntil && lockedUntil > now) return false;
  if (!firstAttemptAt) return true;
  return now - firstAttemptAt >= MEMORY_STORE_STALE_THROTTLE_MS;
}

export function runMemoryStoreCleanup(now = Date.now()) {
  let removed = 0;

  for (const meta of registeredStores) {
    try {
      for (const [key, value] of meta.store) {
        if (meta.isExpired(value, now, key)) {
          meta.store.delete(key);
          removed += 1;
        }
      }
    } catch {
      // Fail safe — never crash the process during background cleanup.
    }
  }

  logMemoryStoreCleanup(removed);
  return removed;
}

export function ensureMemoryStoreCleanupScheduled() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    try {
      runMemoryStoreCleanup();
    } catch {
      // Fail safe — cleanup must not take down request handling.
    }
  }, MEMORY_STORE_CLEANUP_INTERVAL_MS);

  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

/** Test-only reset — not used in production paths. */
export function resetBoundedMemoryStoresForTests() {
  for (const meta of registeredStores) {
    meta.store.clear();
  }
  registeredStores.clear();
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  lastEvictionLogAt = 0;
  lastCleanupLogAt = 0;
}
