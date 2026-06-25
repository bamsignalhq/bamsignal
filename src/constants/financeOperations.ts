/** Finance Operations Center™ — institutional finance governance (not a payment gateway). */

export const FINANCE_OPERATIONS_BRAND = "Finance Operations Center™";

export const FINANCE_IMMUTABLE_RULES = [
  "Financial records immutable.",
  "Audit linked.",
  "Refunds require approval.",
  "No self-approval on refunds."
] as const;

export const FINANCE_INTEGRATIONS = [
  { id: "paystack", label: "Paystack", description: "Payment processing and settlement references — not duplicated here." },
  { id: "executive-dashboard", label: "Executive Dashboard", description: "Revenue and health metrics feed executive oversight." },
  { id: "operations-center", label: "Operations Center", description: "Consultation revenue ties to concierge operations." },
  { id: "governance-center", label: "Governance Center", description: "Refund approvals derive from institutional authority." },
  { id: "audit-center", label: "Audit Center", description: "Every financial action emits an audit event." }
] as const;

export type FinanceAreaId =
  | "revenue"
  | "consultation-fees"
  | "refunds"
  | "chargebacks"
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
  | "settled"
  | "approved"
  | "rejected";

export type RefundRequestStatusId = "pending" | "approved" | "rejected" | "processed";

export type ReconciliationTypeId = "daily" | "monthly" | "quarterly" | "annual";

export type ReportPeriodId = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime";

export type FinanceMetricId =
  | "revenue-today"
  | "revenue-month"
  | "consultations-paid"
  | "refund-rate"
  | "failed-payments"
  | "outstanding-payouts"
  | "chargebacks"
  | "expenses-month";

export const FINANCE_AREAS: { id: FinanceAreaId; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "consultation-fees", label: "Consultation fees" },
  { id: "refunds", label: "Refunds" },
  { id: "chargebacks", label: "Chargebacks" },
  { id: "failed-payments", label: "Failed payments" },
  { id: "pending-settlements", label: "Pending settlements" },
  { id: "operational-costs", label: "Operational costs" },
  { id: "consultant-payouts", label: "Consultant payouts" }
];

export const FINANCE_AREA_LABELS: Record<FinanceAreaId, string> = Object.fromEntries(
  FINANCE_AREAS.map((item) => [item.id, item.label])
) as Record<FinanceAreaId, string>;

export const FINANCE_STATUSES: { id: FinanceStatusId; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
  { id: "cancelled", label: "Cancelled" },
  { id: "settled", label: "Settled" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" }
];

export const FINANCE_STATUS_LABELS: Record<FinanceStatusId, string> = Object.fromEntries(
  FINANCE_STATUSES.map((item) => [item.id, item.label])
) as Record<FinanceStatusId, string>;

export const REFUND_REQUEST_STATUS_LABELS: Record<RefundRequestStatusId, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  processed: "Processed"
};

export const REPORT_PERIOD_LABELS: Record<ReportPeriodId, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  lifetime: "Lifetime"
};

export const REPORT_EXPORT_FORMATS = ["csv", "pdf"] as const;
export type ReportExportFormatId = (typeof REPORT_EXPORT_FORMATS)[number];

export const FINANCE_METRICS: { id: FinanceMetricId; label: string }[] = [
  { id: "revenue-today", label: "Revenue today" },
  { id: "revenue-month", label: "Revenue month" },
  { id: "consultations-paid", label: "Consultations paid" },
  { id: "refund-rate", label: "Refund rate" },
  { id: "failed-payments", label: "Failed payments" },
  { id: "outstanding-payouts", label: "Outstanding payouts" },
  { id: "chargebacks", label: "Chargebacks" },
  { id: "expenses-month", label: "Expenses month" }
];

export const FINANCE_OPERATIONS_DB_TABLES = [
  "financial_transactions",
  "refund_requests",
  "refund_approvals",
  "consultant_payouts",
  "operating_expenses",
  "financial_reports",
  "reconciliation_logs"
] as const;

export const FINANCE_AUDIT_ACTIONS = [
  "transaction-recorded",
  "refund-requested",
  "refund-approved",
  "refund-rejected",
  "payout-scheduled",
  "expense-recorded",
  "reconciliation-completed",
  "report-exported"
] as const;

export type FinanceAuditActionId = (typeof FINANCE_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const FINANCE_OPERATIONS_FUTURE_KINDS = [
  { id: "multi-currency", label: "Multi-currency" },
  { id: "payroll", label: "Payroll" },
  { id: "tax-reporting", label: "Tax reporting" },
  { id: "accounting-integrations", label: "Accounting integrations" }
] as const;
