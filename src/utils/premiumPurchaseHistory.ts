import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "./storage";
import { formatEntitlementUntil } from "./memberEntitlements";
import type { PlanId } from "../constants/plans";

export type PremiumPurchaseRecord = {
  id: string;
  planId: PlanId | "unknown";
  planLabel: string;
  purchasedAt: string;
  expiresAt: string | null;
  status: "Active" | "Expired";
};

type AnalyticsRow = {
  event: string;
  at: string;
  meta?: Record<string, string>;
};

const PLAN_LABELS: Record<string, string> = {
  weekly: "Weekly Signal Pass",
  monthly: "Monthly Signal Pass",
  quarterly: "3 Months Signal Pass",
};

export function listPremiumPurchaseHistory(limit = 12): PremiumPurchaseRecord[] {
  const rows = readJson<AnalyticsRow[]>(STORAGE_KEYS.analytics, []);
  const premiumUntil = readJson<string | null>(STORAGE_KEYS.premiumUntil, null);
  const purchases = rows
    .filter((row) => row.event === "payment_successful")
    .slice(-limit)
    .reverse();

  const history: PremiumPurchaseRecord[] = purchases.map((row, index) => {
    const planId = (row.meta?.plan as PlanId) || "unknown";
    const isLatest = index === 0;
    const expiresAt = isLatest ? premiumUntil : null;
    const active = expiresAt ? new Date(expiresAt).getTime() > Date.now() : false;

    return {
      id: `${row.at}-${index}`,
      planId: planId in PLAN_LABELS ? (planId as PlanId) : "unknown",
      planLabel: PLAN_LABELS[planId] ?? "Signal Pass",
      purchasedAt: row.at,
      expiresAt,
      status: active ? "Active" : "Expired",
    };
  });

  if (!history.length && premiumUntil) {
    history.push({
      id: "current",
      planId: "unknown",
      planLabel: "Signal Pass",
      purchasedAt: premiumUntil,
      expiresAt: premiumUntil,
      status: new Date(premiumUntil).getTime() > Date.now() ? "Active" : "Expired",
    });
  }

  return history;
}

export function formatPremiumPurchaseWhen(iso: string): string {
  return formatEntitlementUntil(iso);
}
