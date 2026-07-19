import { readJson, writeJson } from "./storage";
import { formatEntitlementUntil } from "./memberEntitlements";

export type DiscreetStatusSnapshot = {
  active: boolean;
  discreetUntil: string | null;
  privacyMode: "discover" | "discreet";
};

export type DiscreetHistoryRecord = {
  id: string;
  eventType: string;
  label: string;
  at: string;
  endsAt?: string | null;
  status: "Active" | "Expired" | "Refunded" | "Revoked" | "Event";
};

const DISCREET_UNTIL_KEY = "bamsignal-discreet-until";
const DISCREET_HISTORY_KEY = "bamsignal-discreet-history";

export function getDiscreetStatusSnapshot(): DiscreetStatusSnapshot {
  const discreetUntil = localStorage.getItem(DISCREET_UNTIL_KEY)?.trim() || null;
  const active = Boolean(discreetUntil && new Date(discreetUntil).getTime() > Date.now());
  return {
    active,
    discreetUntil: active ? discreetUntil : discreetUntil,
    privacyMode: active ? "discreet" : "discover"
  };
}

export function setDiscreetStatusSnapshot(input: {
  active?: boolean;
  discreetUntil?: string | null;
}): DiscreetStatusSnapshot {
  const until = input.discreetUntil?.trim() || null;
  const active =
    typeof input.active === "boolean"
      ? input.active
      : Boolean(until && new Date(until).getTime() > Date.now());
  if (until) {
    localStorage.setItem(DISCREET_UNTIL_KEY, until);
  } else {
    localStorage.removeItem(DISCREET_UNTIL_KEY);
  }
  return {
    active,
    discreetUntil: until,
    privacyMode: active ? "discreet" : "discover"
  };
}

export function remainingDiscreetTimeLabel(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "No active Discreet Membership";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Expired";
  const days = Math.ceil(ms / 86400000);
  if (days >= 2) return `${days} days remaining`;
  const hours = Math.max(1, Math.ceil(ms / 3600000));
  return `${hours} hour${hours === 1 ? "" : "s"} remaining`;
}

export function listLocalDiscreetHistory(limit = 20): DiscreetHistoryRecord[] {
  return readJson<DiscreetHistoryRecord[]>(DISCREET_HISTORY_KEY, []).slice(0, limit);
}

export function rememberDiscreetPurchase(entry: {
  endsAt?: string | null;
  purchasedAt?: string;
  renewed?: boolean;
  reference?: string | null;
}): void {
  const at = entry.purchasedAt || new Date().toISOString();
  const existing = listLocalDiscreetHistory(50);
  const next: DiscreetHistoryRecord = {
    id: `${entry.reference || at}-purchase`,
    eventType: entry.renewed ? "MEMBERSHIP_RENEWED" : "MEMBERSHIP_GRANTED",
    label: entry.renewed ? "Discreet renewed" : "Discreet activated",
    at,
    endsAt: entry.endsAt || null,
    status:
      entry.endsAt && new Date(entry.endsAt).getTime() > Date.now() ? "Active" : "Expired"
  };
  writeJson(DISCREET_HISTORY_KEY, [next, ...existing.filter((row) => row.id !== next.id)].slice(0, 50));
  if (entry.endsAt) {
    setDiscreetStatusSnapshot({ discreetUntil: entry.endsAt, active: true });
  }
}

export function hydrateDiscreetHistoryFromServer(
  rows: Array<{
    id?: string;
    event_type?: string;
    created_at?: string;
    metadata?: { endsAt?: string; renewed?: boolean };
  }> = []
): DiscreetHistoryRecord[] {
  const mapped = rows.map((row, index) => {
    const eventType = String(row.event_type || "EVENT");
    const endsAt = row.metadata?.endsAt || null;
    let status: DiscreetHistoryRecord["status"] = "Event";
    let label = eventType.replace(/_/g, " ");
    if (eventType === "MEMBERSHIP_GRANTED") {
      label = "Discreet activated";
      status = endsAt && new Date(endsAt).getTime() > Date.now() ? "Active" : "Expired";
    } else if (eventType === "MEMBERSHIP_RENEWED") {
      label = "Discreet renewed";
      status = endsAt && new Date(endsAt).getTime() > Date.now() ? "Active" : "Expired";
    } else if (eventType === "MEMBERSHIP_EXPIRED") {
      label = "Discreet expired";
      status = "Expired";
    } else if (eventType === "REFUND_APPLIED") {
      label = "Refund applied";
      status = "Refunded";
    } else if (eventType === "MEMBERSHIP_REVOKED" || eventType === "ADMIN_REVOKED") {
      label = "Discreet revoked";
      status = "Revoked";
    }
    return {
      id: String(row.id || `${eventType}-${index}`),
      eventType,
      label,
      at: row.created_at || new Date().toISOString(),
      endsAt,
      status
    } satisfies DiscreetHistoryRecord;
  });
  writeJson(DISCREET_HISTORY_KEY, mapped.slice(0, 50));
  return mapped;
}

export function formatDiscreetWhen(iso: string): string {
  return formatEntitlementUntil(iso);
}
