import { boostDisplayName } from "../constants/boosts";
import { COMMERCIAL_PRODUCT_LABELS } from "../constants/commercialExperience";
import { listLocalConversationUnlocks } from "../constants/conversationUnlock";
import { SIGNAL_CONCIERGE_ROUTES } from "../constants/signalConciergeRoutes";
import { getActiveBoosts } from "./activeBoosts";
import { listLocalDiscreetHistory } from "./discreetMembership";
import { formatEntitlementUntil } from "./memberEntitlements";
import {
  listPremiumPurchaseHistory,
  type PremiumPurchaseRecord
} from "./premiumPurchaseHistory";
import type { ConciergeMemberInvoice } from "./conciergeMemberApi";

export type CommercialTransactionKind =
  | "discover"
  | "discreet"
  | "boost"
  | "conversation_unlock"
  | "concierge_invoice";

export type CommercialTransactionStatus = "Active" | "Expired" | "Paid" | "Open" | "Event";

export type CommercialTransaction = {
  id: string;
  kind: CommercialTransactionKind;
  label: string;
  detail: string;
  at: string;
  status: CommercialTransactionStatus;
  amountLabel?: string;
  expiresAt?: string | null;
  href?: string;
};

export type CommercialExpiryItem = {
  id: string;
  label: string;
  expiresAt: string;
  kind: CommercialTransactionKind;
};

function sortByAtDesc(a: CommercialTransaction, b: CommercialTransaction): number {
  return Date.parse(b.at) - Date.parse(a.at);
}

export function discoverPlanHistoryLabel(planLabel: string): string {
  return planLabel
    .replace(/Signal Pass/gi, COMMERCIAL_PRODUCT_LABELS.discover)
    .replace(/^Weekly\b/i, "Weekly Discover Membership")
    .replace(/^Monthly\b/i, "Monthly Discover Membership");
}

export function mapPremiumHistory(
  purchases: PremiumPurchaseRecord[] = listPremiumPurchaseHistory()
): CommercialTransaction[] {
  return purchases.map((entry) => ({
    id: `discover-${entry.id}`,
    kind: "discover" as const,
    label: discoverPlanHistoryLabel(entry.planLabel),
    detail: entry.expiresAt
      ? `Until ${formatEntitlementUntil(entry.expiresAt)}`
      : formatEntitlementUntil(entry.purchasedAt),
    at: entry.purchasedAt,
    status: entry.status,
    expiresAt: entry.expiresAt
  }));
}

export function buildCommercialTransactionLedger(input?: {
  invoices?: ConciergeMemberInvoice[];
}): CommercialTransaction[] {
  const rows: CommercialTransaction[] = [];

  rows.push(...mapPremiumHistory());

  for (const entry of listLocalDiscreetHistory(20)) {
    rows.push({
      id: `discreet-${entry.id}`,
      kind: "discreet",
      label: entry.label.includes("Discreet")
        ? entry.label
        : `${COMMERCIAL_PRODUCT_LABELS.discreet} · ${entry.label}`,
      detail: entry.endsAt
        ? `Until ${formatEntitlementUntil(entry.endsAt)}`
        : formatEntitlementUntil(entry.at),
      at: entry.at,
      status:
        entry.status === "Active" || entry.status === "Expired"
          ? entry.status
          : entry.status === "Refunded" || entry.status === "Revoked"
            ? "Expired"
            : "Event",
      expiresAt: entry.endsAt
    });
  }

  for (const unlock of listLocalConversationUnlocks()) {
    rows.push({
      id: `unlock-${unlock.targetProfileId}`,
      kind: "conversation_unlock",
      label: unlock.targetName
        ? `${COMMERCIAL_PRODUCT_LABELS.conversation_unlock} · ${unlock.targetName}`
        : COMMERCIAL_PRODUCT_LABELS.conversation_unlock,
      detail: `Permanent · ${formatEntitlementUntil(unlock.purchasedAt)}`,
      at: unlock.purchasedAt,
      status: "Active",
      amountLabel: "₦500"
    });
  }

  for (const boost of getActiveBoosts().filter((row) => row.status === "active")) {
    rows.push({
      id: `boost-${boost.productId}-${boost.expiresAt || boost.activatedAt || ""}`,
      kind: "boost",
      label: boostDisplayName(boost.productId),
      detail: boost.expiresAt
        ? `Active until ${formatEntitlementUntil(boost.expiresAt)}`
        : "Active",
      at: boost.activatedAt || boost.expiresAt || new Date().toISOString(),
      status: "Active",
      expiresAt: boost.expiresAt,
      amountLabel: "₦999"
    });
  }

  for (const invoice of input?.invoices || []) {
    const outstanding = Math.max(
      0,
      Number(invoice.total_kobo || 0) - Number(invoice.amount_paid_kobo || 0)
    );
    const paid = String(invoice.status || "") === "paid";
    rows.push({
      id: `invoice-${invoice.id}`,
      kind: "concierge_invoice",
      label: invoice.invoice_number
        ? `${COMMERCIAL_PRODUCT_LABELS.concierge_invoice} ${invoice.invoice_number}`
        : COMMERCIAL_PRODUCT_LABELS.concierge_invoice,
      detail: paid
        ? `Receipt ${invoice.payment_ref || invoice.id}`
        : `Outstanding ₦${Math.round(outstanding / 100).toLocaleString("en-NG")}`,
      at: invoice.paid_at || invoice.created_at || new Date().toISOString(),
      status: paid ? "Paid" : "Open",
      amountLabel: `₦${Math.round(Number(invoice.total_kobo || 0) / 100).toLocaleString("en-NG")}`,
      href: SIGNAL_CONCIERGE_ROUTES.invoices
    });
  }

  return rows.sort(sortByAtDesc);
}

export function listUpcomingCommercialExpiries(limit = 6): CommercialExpiryItem[] {
  const now = Date.now();
  const items: CommercialExpiryItem[] = [];

  for (const row of buildCommercialTransactionLedger()) {
    if (!row.expiresAt) continue;
    const ts = Date.parse(row.expiresAt);
    if (!Number.isFinite(ts) || ts <= now) continue;
    if (row.status !== "Active" && row.kind !== "discover" && row.kind !== "discreet") continue;
    items.push({
      id: row.id,
      label: row.label,
      expiresAt: row.expiresAt,
      kind: row.kind
    });
  }

  return items
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt))
    .slice(0, limit);
}
