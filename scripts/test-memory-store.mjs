/**
 * Bounded in-memory store regression — caps, eviction, and TTL cleanup.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  MEMORY_STORE_MAX_ENTRIES,
  createBoundedMemoryStore,
  isOtpMemoryEntryExpired,
  isThrottleMemoryEntryExpired,
  resetBoundedMemoryStoresForTests,
  runMemoryStoreCleanup
} from "../server/services/boundedMemoryStore.js";
import {
  checkMemoryMemberThrottle,
  recordMemoryMemberThrottleFailure,
  resetMemoryMemberThrottleStore
} from "../server/services/memoryThrottle.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const boundedStoreSource = readFileSync(
  join(rootPath, "server/services/boundedMemoryStore.js"),
  "utf8"
);
const memoryThrottleSource = readFileSync(
  join(rootPath, "server/services/memoryThrottle.js"),
  "utf8"
);
const signupOtpSource = readFileSync(join(rootPath, "server/services/signupOtp.js"), "utf8");
const pinResetSource = readFileSync(join(rootPath, "server/services/pinReset.js"), "utf8");

assert(
  boundedStoreSource.includes("MEMORY_STORE_MAX_ENTRIES") &&
    boundedStoreSource.includes("runMemoryStoreCleanup") &&
    boundedStoreSource.includes("memory_store_cleanup") &&
    boundedStoreSource.includes("memory_store_eviction"),
  "bounded memory store must expose caps, cleanup, and observability hooks"
);
assert(
  memoryThrottleSource.includes("createBoundedMemoryStore") &&
    !memoryThrottleSource.includes("const memberStore = new Map()"),
  "member auth throttle fallback must use bounded memory store"
);
assert(
  signupOtpSource.includes("createBoundedMemoryStore") &&
    pinResetSource.includes("createBoundedMemoryStore"),
  "OTP fallback stores must use bounded memory store"
);
assert(
  MEMORY_STORE_MAX_ENTRIES === 5000,
  "default memory store cap must remain 5000 entries"
);

resetBoundedMemoryStoresForTests();

const capStore = createBoundedMemoryStore("test_cap", { maxEntries: 3 });
capStore.set("a", { n: 1 });
capStore.set("b", { n: 2 });
capStore.set("c", { n: 3 });
assert(capStore.size === 3, "cap store should hold max entries before overflow");
capStore.set("d", { n: 4 });
assert(capStore.size === 3, "cap store must enforce max size");
assert(!capStore.get("a"), "oldest entry must be evicted when cap exceeded");
assert(capStore.get("d")?.n === 4, "newest entry must remain after eviction");

capStore.set("b", { n: 22 });
assert(capStore.get("b")?.n === 22, "set on existing key must refresh value");
const keysAfterRefresh = [...capStore.keys()];
assert(keysAfterRefresh.at(-1) === "b", "set on existing key must move entry to newest");

const ttlStore = createBoundedMemoryStore("test_ttl", {
  maxEntries: 10,
  isExpired: isOtpMemoryEntryExpired
});
const now = Date.now();
ttlStore.set("fresh", { hash: "x", expires: now + 60_000, attempts: 0, lastSent: now });
ttlStore.set("stale", { hash: "y", expires: now - 1, attempts: 0, lastSent: now - 120_000 });
assert(isOtpMemoryEntryExpired({ expires: now - 1 }), "OTP expiry helper must detect expired entries");
assert(!isOtpMemoryEntryExpired({ expires: now + 60_000 }), "OTP expiry helper must keep valid entries");

const removed = runMemoryStoreCleanup(now);
assert(removed >= 1, "cleanup sweep must remove expired OTP entries");
assert(!ttlStore.get("stale"), "expired OTP entry must be deleted by cleanup");
assert(ttlStore.get("fresh"), "valid OTP entry must survive cleanup");

const staleThrottle = {
  attempts: 3,
  firstAttemptAt: now - 25 * 60 * 60 * 1000,
  lockedUntil: null
};
const activeLock = {
  attempts: 5,
  firstAttemptAt: now - 25 * 60 * 60 * 1000,
  lockedUntil: now + 60_000
};
assert(isThrottleMemoryEntryExpired(staleThrottle, now), "stale throttle rows must expire");
assert(!isThrottleMemoryEntryExpired(activeLock, now), "active throttle locks must not expire early");

resetMemoryMemberThrottleStore();
const throttleConfig = {
  action: "memory_store_test",
  identifier: "user1",
  ip: "198.51.100.4",
  userAgentHash: "ua-hash",
  windowMs: 60_000,
  lockMs: 120_000,
  maxAttempts: 3
};
let lastRecord = null;
for (let attempt = 0; attempt < 3; attempt += 1) {
  lastRecord = recordMemoryMemberThrottleFailure(throttleConfig);
}
assert(lastRecord?.locked === true, "bounded throttle store must still lock after max attempts");
const locked = checkMemoryMemberThrottle(throttleConfig);
assert(locked.locked === true && locked.ok === false, "bounded throttle store must honor active lock");

resetBoundedMemoryStoresForTests();

console.log("memory store tests ok");
