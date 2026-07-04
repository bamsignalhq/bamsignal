import type { BoostProductId } from "../constants/boosts";
import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { readJson, writeJson } from "./storage";

export type ActiveBoostEntry = {
  productId: BoostProductId;
  activatedAt: string;
  expiresAt: string | null;
  status: "active" | "expired" | "consumed";
  consumed?: boolean;
  memberDiscoverId: string;
  city: string;
};

const DURATION_MS: Record<Exclude<BoostProductId, "priority-signal-once">, number> = {
  "signal-boost": 24 * 60 * 60 * 1000,
  "profile-boost": 48 * 60 * 60 * 1000,
  "city-boost": 48 * 60 * 60 * 1000,
  "city-spotlight": 24 * 60 * 60 * 1000
};

const DISCOVER_BONUS: Record<BoostProductId, number> = {
  "signal-boost": 55,
  "profile-boost": 85,
  "priority-signal-once": 0,
  "city-boost": 70,
  "city-spotlight": 95
};

export function getMemberDiscoverId(user: Pick<UserProfile, "email" | "phone" | "username">): string {
  const key = (user.email || user.phone || user.username || "member").toLowerCase();
  return `member-${key.replace(/[^a-z0-9]/g, "")}`;
}

function loadBoosts(): ActiveBoostEntry[] {
  return readJson<Array<ActiveBoostEntry & { status?: ActiveBoostEntry["status"] }>>(
    STORAGE_KEYS.activeBoosts,
    []
  ).map((entry) => ({
    ...entry,
    status: entry.status || (entry.consumed ? "consumed" : "active")
  }));
}

function saveBoosts(entries: ActiveBoostEntry[]): ActiveBoostEntry[] {
  const pruned = pruneExpired(entries);
  writeJson(STORAGE_KEYS.activeBoosts, pruned);
  return pruned;
}

function pruneExpired(entries: ActiveBoostEntry[]): ActiveBoostEntry[] {
  const now = Date.now();
  const kept: ActiveBoostEntry[] = [];
  for (const entry of entries) {
    if (entry.productId === "priority-signal-once") {
      if (entry.consumed) continue;
      kept.push({ ...entry, status: "active" });
      continue;
    }
    if (!entry.expiresAt) continue;
    if (new Date(entry.expiresAt).getTime() <= now) continue;
    kept.push({ ...entry, status: "active" });
  }
  return kept;
}

export function pruneExpiredBoosts(): ActiveBoostEntry[] {
  return saveBoosts(loadBoosts());
}

export function getActiveBoosts(): ActiveBoostEntry[] {
  return saveBoosts(loadBoosts());
}

export function hasActiveBoost(productId: BoostProductId, memberDiscoverId?: string): boolean {
  const id = memberDiscoverId ?? getMemberDiscoverId(readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }));
  return getActiveBoosts().some((b) => b.productId === productId && b.memberDiscoverId === id);
}

/** Apply server-granted boosts (payment fortress). Replaces local active list for this member. */
export function hydrateBoostsFromServer(
  boosts: Array<{
    productId?: string;
    activatedAt?: string | null;
    expiresAt?: string | null;
    consumed?: boolean;
    city?: string;
    memberDiscoverId?: string;
  }>,
  user: Pick<UserProfile, "email" | "phone" | "username">
): ActiveBoostEntry[] {
  const memberDiscoverId = getMemberDiscoverId(user);
  const others = loadBoosts().filter((b) => b.memberDiscoverId !== memberDiscoverId);
  const serverEntries: ActiveBoostEntry[] = (boosts || [])
    .filter((b) => b.productId)
    .map((b) => ({
      productId: b.productId as BoostProductId,
      activatedAt: b.activatedAt || new Date().toISOString(),
      expiresAt: b.expiresAt ?? null,
      status: b.consumed ? "consumed" : "active",
      consumed: Boolean(b.consumed),
      memberDiscoverId: b.memberDiscoverId || memberDiscoverId,
      city: b.city || ""
    }));
  return saveBoosts([...others, ...serverEntries]);
}

export function activateBoost(
  productId: BoostProductId,
  user: Pick<UserProfile, "email" | "phone" | "username">,
  datingProfile?: Pick<DatingProfile, "city">,
  options?: { expiresAt?: string | null }
): ActiveBoostEntry {
  const memberDiscoverId = getMemberDiscoverId(user);
  const city =
    datingProfile?.city ||
    readJson<DatingProfile | null>(STORAGE_KEYS.datingProfile, null)?.city ||
    "";
  const activatedAt = new Date().toISOString();
  const expiresAt =
    productId === "priority-signal-once"
      ? null
      : options?.expiresAt ||
        new Date(Date.now() + DURATION_MS[productId]).toISOString();

  const entry: ActiveBoostEntry = {
    productId,
    activatedAt,
    expiresAt,
    status: productId === "priority-signal-once" ? "active" : "active",
    consumed: productId === "priority-signal-once" ? false : undefined,
    memberDiscoverId,
    city
  };

  const withoutSame = loadBoosts().filter(
    (b) => !(b.memberDiscoverId === memberDiscoverId && b.productId === productId && !b.consumed)
  );
  saveBoosts([...withoutSame, entry]);
  return entry;
}

export function consumePrioritySignal(memberDiscoverId?: string): boolean {
  const id =
    memberDiscoverId ??
    getMemberDiscoverId(readJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" }));
  const boosts = loadBoosts();
  const idx = boosts.findIndex(
    (b) => b.productId === "priority-signal-once" && b.memberDiscoverId === id && !b.consumed
  );
  if (idx < 0) return false;
  boosts[idx] = { ...boosts[idx], consumed: true, status: "consumed" };
  saveBoosts(boosts);
  return true;
}

export function getDiscoverScoreBonusForProfile(profileId: string): number {
  const now = Date.now();
  let bonus = 0;
  for (const entry of getActiveBoosts()) {
    if (entry.memberDiscoverId !== profileId) continue;
    if (entry.productId === "priority-signal-once") continue;
    if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= now) continue;
    bonus += DISCOVER_BONUS[entry.productId];
  }
  return bonus;
}

export function getViewerBoostSummary(
  user: Pick<UserProfile, "email" | "phone" | "username">
): { signalBoost: boolean; profileBoost: boolean; priorityPending: boolean } {
  const id = getMemberDiscoverId(user);
  const active = getActiveBoosts().filter((b) => b.memberDiscoverId === id);
  return {
    signalBoost: active.some((b) => b.productId === "signal-boost"),
    profileBoost: active.some((b) => b.productId === "profile-boost"),
    priorityPending: active.some((b) => b.productId === "priority-signal-once" && !b.consumed)
  };
}

export function getSoonestActiveBoost(
  user: Pick<UserProfile, "email" | "phone" | "username">
): ActiveBoostEntry | null {
  const id = getMemberDiscoverId(user);
  const timed = getActiveBoosts()
    .filter((entry) => entry.memberDiscoverId === id && entry.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());
  return timed[0] || null;
}

export function boostedProfileIds(): Set<string> {
  return new Set(getActiveBoosts().map((b) => b.memberDiscoverId));
}
