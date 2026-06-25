import { FINANCE_METRICS } from "../constants/financeOperations";
import { FINANCE_OPERATIONS_SEED } from "../data/financeOperationsSeed";
import type { FinanceFilterState, FinanceRecord, FinanceTimelineEntry } from "../types/financeOperations";
import type { FinanceAreaId, FinanceStatusId } from "../constants/financeOperations";

function isSameDay(left: string, right: string): boolean {
  return left.slice(0, 10) === right.slice(0, 10);
}

function isSameMonth(left: string, right: string): boolean {
  return left.slice(0, 7) === right.slice(0, 7);
}

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function listFinanceRecords(): FinanceRecord[] {
  return [...FINANCE_OPERATIONS_SEED];
}

export function sortRecordsByDate(records: FinanceRecord[]): FinanceRecord[] {
  return [...records].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function findRecordById(records: FinanceRecord[], recordId: string | null): FinanceRecord | null {
  if (!recordId) return null;
  return records.find((record) => record.id === recordId) ?? null;
}

export function filterFinanceRecords(records: FinanceRecord[], filters: FinanceFilterState): FinanceRecord[] {
  const query = filters.query.trim().toLowerCase();

  return records.filter((record) => {
    if (filters.areaId !== "all" && record.areaId !== filters.areaId) return false;
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (!query) return true;

    const haystack = [
      record.transactionRef,
      record.description,
      record.memberRef ?? "",
      record.consultantRef ?? "",
      record.journeyRef ?? "",
      record.paystackReference ?? "",
      record.auditRef ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function sumRevenueToday(records: FinanceRecord[], now = new Date()): number {
  const today = now.toISOString().slice(0, 10);
  return records
    .filter(
      (record) =>
        (record.areaId === "revenue" || record.areaId === "consultation-fees") &&
        (record.status === "paid" || record.status === "settled") &&
        isSameDay(record.createdAt, today)
    )
    .reduce((sum, record) => sum + record.amountNgn, 0);
}

export function sumRevenueMonth(records: FinanceRecord[], now = new Date()): number {
  const month = now.toISOString().slice(0, 7);
  return records
    .filter(
      (record) =>
        (record.areaId === "revenue" || record.areaId === "consultation-fees") &&
        (record.status === "paid" || record.status === "settled") &&
        isSameMonth(record.createdAt, month)
    )
    .reduce((sum, record) => sum + record.amountNgn, 0);
}

export function countConsultationsPaid(records: FinanceRecord[]): number {
  return records.filter(
    (record) => record.areaId === "consultation-fees" && record.status === "paid"
  ).length;
}

export function computeRefundRate(records: FinanceRecord[]): string {
  const paidConsultations = records.filter(
    (record) => record.areaId === "consultation-fees" && record.status === "paid"
  ).length;
  const refunds = records.filter((record) => record.areaId === "refunds").length;
  if (!paidConsultations) return "0%";
  return `${Math.round((refunds / paidConsultations) * 100)}%`;
}

export function countFailedPayments(records: FinanceRecord[]): number {
  return records.filter(
    (record) => record.areaId === "failed-payments" || record.status === "failed"
  ).length;
}

export function sumOutstandingPayouts(records: FinanceRecord[]): number {
  return records
    .filter((record) => record.areaId === "consultant-payouts" && record.status === "pending")
    .reduce((sum, record) => sum + record.amountNgn, 0);
}

export function countChargebacks(records: FinanceRecord[]): number {
  return records.filter(
    (record) => record.areaId === "chargebacks" || record.chargebackFlag
  ).length;
}

export function sumExpensesMonth(records: FinanceRecord[], now = new Date()): number {
  const month = now.toISOString().slice(0, 7);
  return records
    .filter(
      (record) =>
        record.areaId === "operational-costs" &&
        record.status === "paid" &&
        isSameMonth(record.createdAt, month)
    )
    .reduce((sum, record) => sum + record.amountNgn, 0);
}

export function assertNotSelfRefundApproval(requestedByEmail: string, approverEmail: string): void {
  const requester = requestedByEmail.trim().toLowerCase();
  const approver = approverEmail.trim().toLowerCase();
  if (!requester || !approver) {
    throw new Error("Finance approval violation: requester and approver required");
  }
  if (requester === approver) {
    throw new Error("Finance approval violation: cannot approve own refund request");
  }
}

export function processRefundApproval(
  request: import("../types/financeOperations").RefundRequestRecord,
  approval: { approverEmail: string; decision: "approved" | "rejected"; note?: string; decidedAt?: string }
) {
  assertNotSelfRefundApproval(request.requestedByEmail, approval.approverEmail);
  if (!["approved", "rejected"].includes(approval.decision)) {
    throw new Error("Finance approval violation: invalid decision");
  }
  if (request.status !== "pending") {
    throw new Error("Finance approval violation: refund not pending");
  }
  return {
    request: {
      ...request,
      status: approval.decision === "approved" ? ("approved" as const) : ("rejected" as const),
      updatedAt: new Date().toISOString()
    },
    approval: {
      ...approval,
      refundRequestId: request.id,
      decidedAt: approval.decidedAt ?? new Date().toISOString()
    }
  };
}

export function mapRecordsToTransactions(
  records: FinanceRecord[]
): import("../types/financeOperations").FinancialTransactionRecord[] {
  return records.map((record) => ({
    id: record.id,
    transactionRef: record.transactionRef,
    category: record.areaId,
    status: record.status,
    amountNgn: record.amountNgn,
    currency: "NGN",
    memberRef: record.memberRef ?? undefined,
    consultantRef: record.consultantRef ?? undefined,
    journeyRef: record.journeyRef ?? undefined,
    paystackReference: record.paystackReference ?? undefined,
    chargebackFlag: Boolean(record.chargebackFlag),
    auditRef: record.auditRef ?? undefined,
    description: record.description,
    recordedAt: record.createdAt,
    createdAt: record.createdAt
  }));
}

export function buildFinancialHealthMetrics(
  records: FinanceRecord[],
  pendingRefunds: number,
  varianceReconciliations: number
): import("../types/financeOperations").FinancialHealthMetric[] {
  const failed = countFailedPayments(records);
  const chargebacks = countChargebacks(records);
  const outstanding = sumOutstandingPayouts(records);

  return [
    {
      id: "ledger-integrity",
      label: "Ledger integrity",
      value: "Immutable",
      tone: "healthy",
      hint: "Append-only financial records"
    },
    {
      id: "payment-failures",
      label: "Payment failures",
      value: String(failed),
      tone: failed > 2 ? "warning" : "healthy"
    },
    {
      id: "chargebacks",
      label: "Open chargebacks",
      value: String(chargebacks),
      tone: chargebacks > 0 ? "warning" : "healthy"
    },
    {
      id: "refund-queue",
      label: "Pending refunds",
      value: String(pendingRefunds),
      tone: pendingRefunds > 0 ? "warning" : "healthy"
    },
    {
      id: "reconciliation",
      label: "Reconciliation variances",
      value: String(varianceReconciliations),
      tone: varianceReconciliations > 0 ? "warning" : "healthy"
    },
    {
      id: "outstanding-payouts",
      label: "Outstanding payouts",
      value: formatNgn(outstanding),
      tone: outstanding > 200000 ? "warning" : "healthy"
    }
  ];
}

export function buildFinanceForecast(
  records: FinanceRecord[],
  now = new Date()
): import("../types/financeOperations").FinanceForecastItem[] {
  const monthRevenue = sumRevenueMonth(records, now);
  const monthExpenses = sumExpensesMonth(records, now);

  return [
    {
      id: "revenue-next-month",
      label: "Projected revenue (next month)",
      projectedNgn: Math.round(monthRevenue * 1.08),
      confidence: "medium",
      horizon: "30 days"
    },
    {
      id: "expenses-next-month",
      label: "Projected expenses (next month)",
      projectedNgn: Math.round(monthExpenses * 1.05),
      confidence: "high",
      horizon: "30 days"
    },
    {
      id: "net-quarter",
      label: "Projected net (quarter)",
      projectedNgn: Math.round((monthRevenue - monthExpenses) * 3 * 1.06),
      confidence: "low",
      horizon: "90 days"
    }
  ];
}

export function buildReportCsvContent(
  report: import("../types/financeOperations").FinancialReportRecord
): string {
  const header = "reportRef,periodType,periodStart,periodEnd,revenue,expenses,refunds,net";
  const row = [
    report.reportRef,
    report.periodType,
    report.periodStart,
    report.periodEnd,
    report.totalRevenueNgn,
    report.totalExpensesNgn,
    report.totalRefundsNgn,
    report.netPositionNgn
  ].join(",");
  return `${header}\n${row}`;
}

export function buildFinanceMetrics(records: FinanceRecord[], now = new Date()) {
  const values: Record<string, string> = {
    "revenue-today": formatNgn(sumRevenueToday(records, now)),
    "revenue-month": formatNgn(sumRevenueMonth(records, now)),
    "consultations-paid": String(countConsultationsPaid(records)),
    "refund-rate": computeRefundRate(records),
    "failed-payments": String(countFailedPayments(records)),
    "outstanding-payouts": formatNgn(sumOutstandingPayouts(records)),
    chargebacks: String(countChargebacks(records)),
    "expenses-month": formatNgn(sumExpensesMonth(records, now))
  };

  return FINANCE_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]?.replace(/[^\d]/g, "")) || undefined
  }));
}

export function emptyFinanceFilters(): FinanceFilterState {
  return {
    query: "",
    areaId: "all",
    status: "all"
  };
}

export function recordsByArea(records: FinanceRecord[], areaId: FinanceAreaId): FinanceRecord[] {
  return records.filter((record) => record.areaId === areaId);
}

/**
 * Immutable financial integrity — records cannot be rewritten; timeline append only.
 */
export function assertFinanceTimelineAppendOnly(
  previous: FinanceTimelineEntry[],
  next: FinanceTimelineEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Finance integrity violation: timeline entries cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.actor !== current.actor ||
      prior.action !== current.action
    ) {
      throw new Error("Finance integrity violation: timeline cannot be modified");
    }
  }
}

export function assertFinanceRecordImmutable(previous: FinanceRecord, next: FinanceRecord): void {
  if (previous.id !== next.id) {
    throw new Error("Finance integrity violation: record identity cannot change");
  }

  const immutableFields: (keyof FinanceRecord)[] = [
    "transactionRef",
    "areaId",
    "amountNgn",
    "memberRef",
    "consultantRef",
    "journeyRef",
    "paystackReference",
    "auditRef",
    "description",
    "createdAt"
  ];

  for (const field of immutableFields) {
    if (previous[field] !== next[field]) {
      throw new Error(`Finance integrity violation: ${field} is immutable`);
    }
  }

  assertFinanceTimelineAppendOnly(previous.timeline, next.timeline);
}

export function appendFinanceTimelineEntry(
  record: FinanceRecord,
  input: Omit<FinanceTimelineEntry, "id" | "timestamp"> & { status?: FinanceStatusId }
): FinanceRecord {
  const entry: FinanceTimelineEntry = {
    ...input,
    id: `finance_tl_${String(record.timeline.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextTimeline = [...record.timeline, entry];
  assertFinanceTimelineAppendOnly(record.timeline, nextTimeline);
  return {
    ...record,
    timeline: nextTimeline,
    status: input.status ?? record.status
  };
}
