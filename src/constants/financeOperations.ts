/** Finance Operations Center™ — Paystack-linked financial operations layer. */

export const FINANCE_OPERATIONS_BRAND = "Finance Operations Center™";

export const FINANCE_IMMUTABLE_RULES = [
  "Financial records immutable.",
  "Audit linked."
] as const;

export type FinanceAreaId =
  | "revenue"
  | "consultation-fees"
  | "refunds"
  | "failed-payments"
  | "pending-settlements"
  | "operational-costs"
  | "consultant-payouts";

export type FinanceStatusId =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled"
  | "settled";

export type FinanceMetricId =
  | "revenue-today"
  | "revenue-month"
  | "consultations-paid"
  | "refund-rate"
  | "failed-payments"
  | "outstanding-payouts";

export const FINANCE_AREAS: {
  id: FinanceAreaId;
  label: string;
}[] = [
  { id: "revenue", label: "Revenue" },
  { id: "consultation-fees", label: "Consultation fees" },
  { id: "refunds", label: "Refunds" },
  { id: "failed-payments", label: "Failed payments" },
  { id: "pending-settlements", label: "Pending settlements" },
  { id: "operational-costs", label: "Operational costs" },
  { id: "consultant-payouts", label: "Consultant payouts" }
];

export const FINANCE_AREA_LABELS: Record<FinanceAreaId, string> = Object.fromEntries(
  FINANCE_AREAS.map((item) => [item.id, item.label])
) as Record<FinanceAreaId, string>;

export const FINANCE_STATUSES: {
  id: FinanceStatusId;
  label: string;
}[] = [
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
  { id: "cancelled", label: "Cancelled" },
  { id: "settled", label: "Settled" }
];

export const FINANCE_STATUS_LABELS: Record<FinanceStatusId, string> = Object.fromEntries(
  FINANCE_STATUSES.map((item) => [item.id, item.label])
) as Record<FinanceStatusId, string>;

export const FINANCE_METRICS: {
  id: FinanceMetricId;
  label: string;
}[] = [
  { id: "revenue-today", label: "Revenue today" },
  { id: "revenue-month", label: "Revenue month" },
  { id: "consultations-paid", label: "Consultations paid" },
  { id: "refund-rate", label: "Refund rate" },
  { id: "failed-payments", label: "Failed payments" },
  { id: "outstanding-payouts", label: "Outstanding payouts" }
];

/**
 * Future-ready finance capabilities — documented only, not implemented.
 */
export const FINANCE_OPERATIONS_FUTURE_KINDS = [
  { id: "accounting-integrations", label: "Accounting integrations" },
  { id: "payroll", label: "Payroll" },
  { id: "tax-reporting", label: "Tax reporting" }
] as const;
