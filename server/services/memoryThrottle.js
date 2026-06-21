/**
 * Process-lifetime member auth throttle fallback when database persistence is unavailable.
 * Not a primary store — used only during outages.
 */
import { logObservabilityEvent } from "./observability.js";
import {
  createBoundedMemoryStore,
  isThrottleMemoryEntryExpired
} from "./boundedMemoryStore.js";

const memberStore = createBoundedMemoryStore("member_auth_throttle", {
  isExpired: isThrottleMemoryEntryExpired
});

const loggedDbUnavailable = new Set();

function throttleKey(action, identifier, ip, userAgentHash) {
  return [action, identifier, ip || "", userAgentHash || ""].join("|");
}

function identifierPrefix(action, identifier) {
  return `${action}|${identifier}|`;
}

export function logThrottleDbUnavailable(action, scope = "member") {
  const key = `${scope}:${action}`;
  if (loggedDbUnavailable.has(key)) return;
  loggedDbUnavailable.add(key);
  logObservabilityEvent("throttle_db_unavailable", { action, scope }, "warn");
}

export function logMemberMemoryThrottleUsed(action) {
  logObservabilityEvent("member_memory_throttle_used", { action }, "info");
}

export function logAdminFailClosed(action, reason = "database_unavailable") {
  console.info("admin_fail_closed", { action, reason });
}

export function checkMemoryMemberThrottle({
  action,
  identifier,
  ip,
  userAgentHash,
  windowMs,
  lockMs,
  maxAttempts
}) {
  const key = throttleKey(action, identifier, ip, userAgentHash);
  const row = memberStore.get(key);
  const now = Date.now();

  if (row?.lockedUntil && row.lockedUntil > now) {
    return {
      ok: false,
      locked: true,
      lockedUntil: new Date(row.lockedUntil).toISOString(),
      attempts: row.attempts
    };
  }

  if (row && now - row.firstAttemptAt >= windowMs) {
    memberStore.delete(key);
  }

  return { ok: true, locked: false, lockedUntil: null, attempts: row?.attempts || 0 };
}

export function recordMemoryMemberThrottleFailure({
  action,
  identifier,
  ip,
  userAgentHash,
  windowMs,
  lockMs,
  maxAttempts
}) {
  const key = throttleKey(action, identifier, ip, userAgentHash);
  const now = Date.now();
  const existing = memberStore.get(key);

  if (existing?.lockedUntil && existing.lockedUntil > now) {
    return {
      ok: false,
      attempts: existing.attempts,
      locked: true,
      lockedUntil: new Date(existing.lockedUntil).toISOString()
    };
  }

  let attempts = existing?.attempts || 0;
  let firstAttemptAt = existing?.firstAttemptAt || now;

  if (!existing || now - firstAttemptAt >= windowMs) {
    attempts = 0;
    firstAttemptAt = now;
  }

  attempts += 1;
  const locked = attempts >= maxAttempts;
  const lockedUntil = locked ? now + lockMs : null;

  memberStore.set(key, { attempts, firstAttemptAt, lockedUntil });

  return {
    ok: !locked,
    attempts,
    locked,
    lockedUntil: lockedUntil ? new Date(lockedUntil).toISOString() : null
  };
}

export function clearMemoryMemberThrottleForIdentifier(action, identifier) {
  const prefix = identifierPrefix(action, identifier);
  for (const key of memberStore.keys()) {
    if (key.startsWith(prefix)) {
      memberStore.delete(key);
    }
  }
}

/** Test-only reset — not used in production paths. */
export function resetMemoryMemberThrottleStore() {
  memberStore.clear();
  loggedDbUnavailable.clear();
}
