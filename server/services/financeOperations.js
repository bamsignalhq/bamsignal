/**
 * Financial Operations Center™ — institutional finance governance (server-side).
 */

import { query, isDatabaseReady } from "../db.js";

const IMMUTABLE_FINANCE_FIELDS = [
  "id",
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

export const FINANCE_OPERATIONS_DB_TABLES = [
  "financial_transactions",
  "refund_requests",
  "refund_approvals",
  "consultant_payouts",
  "operating_expenses",
  "financial_reports",
  "reconciliation_logs"
];

export function getFinanceOperationsDatabaseTableManifest() {
  return FINANCE_OPERATIONS_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "finance"
  }));
}

export function canAccessFinanceOperationsConsole(permissions = []) {
  return permissions.includes("ViewFinance") || permissions.includes("ManageFinance");
}

export function assertNotSelfRefundApproval(requestedByEmail, approverEmail) {
  const requester = String(requestedByEmail ?? "").trim().toLowerCase();
  const approver = String(approverEmail ?? "").trim().toLowerCase();
  if (!requester || !approver) {
    throw new Error("Finance approval violation: requester and approver required");
  }
  if (requester === approver) {
    throw new Error("Finance approval violation: cannot approve own refund request");
  }
}

export function processRefundApproval(request, approval) {
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
      status: approval.decision === "approved" ? "approved" : "rejected",
      updatedAt: new Date().toISOString()
    },
    approval: {
      ...approval,
      refundRequestId: request.id,
      decidedAt: approval.decidedAt ?? new Date().toISOString()
    }
  };
}

export function buildReportCsvRow(report) {
  return [
    report.reportRef,
    report.periodType,
    report.periodStart,
    report.periodEnd,
    report.totalRevenueNgn,
    report.totalExpensesNgn,
    report.totalRefundsNgn,
    report.netPositionNgn
  ].join(",");
}

export function buildReportExportPayload(report, format = "csv") {
  if (format === "pdf") {
    return {
      format: "pdf",
      filename: `${report.reportRef}.pdf`,
      note: "PDF export documented — institutional report snapshot for finance review."
    };
  }
  const header = "reportRef,periodType,periodStart,periodEnd,revenue,expenses,refunds,net";
  return {
    format: "csv",
    filename: `${report.reportRef}.csv`,
    content: `${header}\n${buildReportCsvRow(report)}`
  };
}

export function computeReconciliationVariance(paystackTotal, internalTotal) {
  const paystack = Number(paystackTotal) || 0;
  const internal = Number(internalTotal) || 0;
  const variance = paystack - internal;
  let status = "balanced";
  if (Math.abs(variance) > 0) status = "variance";
  return { paystackTotal: paystack, internalTotal: internal, varianceNgn: variance, status };
}

export function assertFinanceTimelineAppendOnly(previous, next) {
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

export function assertFinanceRecordImmutable(previous, next) {
  if (previous.id !== next.id) {
    throw new Error("Finance integrity violation: record identity cannot change");
  }

  for (const field of IMMUTABLE_FINANCE_FIELDS) {
    if (previous[field] !== next[field]) {
      throw new Error(`Finance integrity violation: ${field} is immutable`);
    }
  }

  assertFinanceTimelineAppendOnly(previous.timeline ?? [], next.timeline ?? []);
}

export function appendFinanceTimelineEntry(record, input) {
  const entry = {
    ...input,
    id: `finance_tl_${String((record.timeline?.length ?? 0) + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextTimeline = [...(record.timeline ?? []), entry];
  assertFinanceTimelineAppendOnly(record.timeline ?? [], nextTimeline);
  return {
    ...record,
    timeline: nextTimeline,
    status: input.status ?? record.status
  };
}

export async function listFinancialTransactions(limit = 100) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from financial_transactions order by recorded_at desc limit $1`,
    [limit]
  );
  return result.rows ?? [];
}

export async function listRefundRequests(limit = 50) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from refund_requests order by created_at desc limit $1`,
    [limit]
  );
  return result.rows ?? [];
}

export async function listReconciliationLogs(limit = 20) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from reconciliation_logs order by reconciled_at desc nulls last limit $1`,
    [limit]
  );
  return result.rows ?? [];
}
