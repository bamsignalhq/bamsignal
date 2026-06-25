import type { FinanceAuditActionId } from "../constants/financeOperations";
import {
  CONSULTANT_PAYOUT_SEED,
  FINANCE_OPERATIONS_SEED,
  FINANCIAL_REPORT_SEED,
  OPERATING_EXPENSE_SEED,
  RECONCILIATION_LOG_SEED,
  REFUND_APPROVAL_SEED,
  REFUND_REQUEST_SEED
} from "../data/financeOperationsSeed";
import type {
  ConsultantPayoutRecord,
  FinancialReportRecord,
  FinanceRecord,
  OperatingExpenseRecord,
  ReconciliationLogRecord,
  RefundApprovalRecord,
  RefundRequestRecord
} from "../types/financeOperations";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { processRefundApproval } from "./financeOperationsLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.financeOperations.v1";

type FinanceOperationsStoreState = {
  records: FinanceRecord[];
  refundRequests: RefundRequestRecord[];
  refundApprovals: RefundApprovalRecord[];
  payouts: ConsultantPayoutRecord[];
  expenses: OperatingExpenseRecord[];
  reports: FinancialReportRecord[];
  reconciliations: ReconciliationLogRecord[];
  updatedAt: string;
};

function defaultState(): FinanceOperationsStoreState {
  return {
    records: [...FINANCE_OPERATIONS_SEED],
    refundRequests: [...REFUND_REQUEST_SEED],
    refundApprovals: [...REFUND_APPROVAL_SEED],
    payouts: [...CONSULTANT_PAYOUT_SEED],
    expenses: [...OPERATING_EXPENSE_SEED],
    reports: [...FINANCIAL_REPORT_SEED],
    reconciliations: [...RECONCILIATION_LOG_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): FinanceOperationsStoreState {
  const stored = readJson<FinanceOperationsStoreState>(STORAGE_KEY, defaultState());
  if (!stored?.records?.length) return defaultState();
  return {
    ...defaultState(),
    ...stored,
    refundRequests: stored.refundRequests?.length ? stored.refundRequests : REFUND_REQUEST_SEED,
    refundApprovals: stored.refundApprovals?.length ? stored.refundApprovals : REFUND_APPROVAL_SEED,
    payouts: stored.payouts?.length ? stored.payouts : CONSULTANT_PAYOUT_SEED,
    expenses: stored.expenses?.length ? stored.expenses : OPERATING_EXPENSE_SEED,
    reports: stored.reports?.length ? stored.reports : FINANCIAL_REPORT_SEED,
    reconciliations: stored.reconciliations?.length ? stored.reconciliations : RECONCILIATION_LOG_SEED
  };
}

function saveState(state: FinanceOperationsStoreState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logFinanceAudit(action: FinanceAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "finance-system",
    role: "Finance",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listFinanceOperationsRecords() {
  return loadState().records;
}

export function listRefundRequests() {
  return loadState().refundRequests;
}

export function listRefundApprovals() {
  return loadState().refundApprovals;
}

export function listConsultantPayouts() {
  return loadState().payouts;
}

export function listOperatingExpenses() {
  return loadState().expenses;
}

export function listFinancialReports() {
  return loadState().reports;
}

export function listReconciliationLogs() {
  return loadState().reconciliations;
}

export function approveRefundRequest(
  refundRef: string,
  approverEmail: string,
  decision: RefundApprovalRecord["decision"],
  note?: string
): RefundRequestRecord | null {
  const state = loadState();
  const index = state.refundRequests.findIndex((item) => item.refundRef === refundRef);
  if (index < 0) return null;

  const result = processRefundApproval(state.refundRequests[index], {
    approverEmail,
    decision,
    note
  });

  state.refundRequests[index] = result.request;
  state.refundApprovals.push({
    id: `fa_generated_${Date.now()}`,
    refundRequestId: result.request.id,
    approverEmail,
    decision,
    note,
    decidedAt: result.approval.decidedAt
  });
  saveState(state);
  logFinanceAudit(
    decision === "approved" ? "refund-approved" : "refund-rejected",
    `${refundRef} — ${note ?? decision}`,
    refundRef
  );
  return result.request;
}

export function exportFinancialReport(reportRef: string, format: "csv" | "pdf" = "csv") {
  const report = listFinancialReports().find((item) => item.reportRef === reportRef);
  if (!report) return null;
  logFinanceAudit("report-exported", `${reportRef} as ${format}`, reportRef);
  return buildReportExportFromRecord(report, format);
}

function buildReportExportFromRecord(report: FinancialReportRecord, format: "csv" | "pdf") {
  if (format === "pdf") {
    return {
      format: "pdf" as const,
      filename: `${report.reportRef}.pdf`,
      note: "PDF export documented — institutional report snapshot for finance review."
    };
  }
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
  return { format: "csv" as const, filename: `${report.reportRef}.csv`, content: `${header}\n${row}` };
}
