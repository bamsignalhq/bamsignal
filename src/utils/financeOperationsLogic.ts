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

export function buildFinanceMetrics(records: FinanceRecord[], now = new Date()) {
  const values: Record<string, string> = {
    "revenue-today": formatNgn(sumRevenueToday(records, now)),
    "revenue-month": formatNgn(sumRevenueMonth(records, now)),
    "consultations-paid": String(countConsultationsPaid(records)),
    "refund-rate": computeRefundRate(records),
    "failed-payments": String(countFailedPayments(records)),
    "outstanding-payouts": formatNgn(sumOutstandingPayouts(records))
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
