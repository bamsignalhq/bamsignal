import { STORAGE_KEYS } from "../constants/limits";
import { boostDisplayName } from "../constants/boosts";
import type { ActiveBoostEntry } from "./activeBoosts";
import { getActiveBoosts, getSoonestActiveBoost } from "./activeBoosts";
import { formatEntitlementUntil } from "./memberEntitlements";
import { readJson } from "./storage";
import type { UserProfile } from "../types";

type AnalyticsRow = {
  event: string;
  at: string;
};

export type BoostPerformanceSnapshot = {
  active: boolean;
  productId: string | null;
  productLabel: string;
  expiresAt: string | null;
  activatedAt: string | null;
  remainingLabel: string;
  impressionsDuringBoost: number;
  signalsReceivedDuringBoost: number;
  profileViewsDuringBoost: number;
};

function countEventsBetween(eventName: string, startIso: string | null, endIso: string | null): number {
  if (!startIso) return 0;
  const start = Date.parse(startIso);
  const end = endIso ? Date.parse(endIso) : Date.now();
  if (!Number.isFinite(start)) return 0;
  const rows = readJson<AnalyticsRow[]>(STORAGE_KEYS.analytics, []);
  return rows.filter((row) => {
    if (row.event !== eventName) return false;
    const at = Date.parse(row.at);
    return Number.isFinite(at) && at >= start && at <= end;
  }).length;
}

export function getBoostPerformanceSnapshot(
  member: Pick<UserProfile, "email" | "phone" | "username"> | null = null
): BoostPerformanceSnapshot {
  const soonest = member ? getSoonestActiveBoost(member) : null;
  const activeList = getActiveBoosts().filter((row) => row.status === "active");
  const boost: ActiveBoostEntry | null = soonest || activeList[0] || null;
  if (!boost) {
    return {
      active: false,
      productId: null,
      productLabel: "Profile Boost",
      expiresAt: null,
      activatedAt: null,
      remainingLabel: "No active boost",
      impressionsDuringBoost: 0,
      signalsReceivedDuringBoost: 0,
      profileViewsDuringBoost: 0
    };
  }

  const end = boost.expiresAt || new Date().toISOString();
  return {
    active: true,
    productId: boost.productId,
    productLabel: boostDisplayName(boost.productId),
    expiresAt: boost.expiresAt,
    activatedAt: boost.activatedAt,
    remainingLabel: boost.expiresAt
      ? `Active until ${formatEntitlementUntil(boost.expiresAt)}`
      : "Active",
    impressionsDuringBoost: countEventsBetween("discover_impression", boost.activatedAt, end),
    signalsReceivedDuringBoost: countEventsBetween("signal_received", boost.activatedAt, end),
    profileViewsDuringBoost: countEventsBetween("profile_viewed", boost.activatedAt, end)
  };
}
