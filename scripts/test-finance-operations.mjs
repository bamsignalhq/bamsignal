#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendFinanceTimelineEntry,
  assertFinanceRecordImmutable,
  assertNotSelfRefundApproval,
  buildReportExportPayload,
  canAccessFinanceOperationsConsole,
  computeReconciliationVariance,
  getFinanceOperationsDatabaseTableManifest,
  processRefundApproval,
  FINANCE_OPERATIONS_DB_TABLES
} from "../server/services/financeOperations.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/financeOperationsAdmin.ts"), "utf8");
assert(adminSource.includes('FINANCE_OPERATIONS_ADMIN_PATH = "/hard/finance"'), "admin finance route");

const constantsSource = readFileSync(join(rootPath, "src/constants/financeOperations.ts"), "utf8");
assert(constantsSource.includes("Finance Operations Center™"), "finance brand");
assert(constantsSource.includes("chargebacks"), "chargebacks area");
assert(constantsSource.includes("FINANCE_IMMUTABLE_RULES"), "immutable rules documented");
assert(constantsSource.includes("No self-approval on refunds"), "self-approval rule");
assert(constantsSource.includes("FINANCE_INTEGRATIONS"), "integrations documented");
assert(constantsSource.includes("Paystack"), "paystack integration");
assert(constantsSource.includes("Governance Center"), "governance integration");
assert(constantsSource.includes("Audit Center"), "audit center integration");
assert(constantsSource.includes("FINANCE_OPERATIONS_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Multi-currency"), "multi-currency future item");
assert(constantsSource.includes("financial_transactions"), "financial_transactions table");
assert(constantsSource.includes("lifetime"), "lifetime report period");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606251800_finance_operations.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("financial_transactions"), "financial_transactions migration");
assert(migrationSource.includes("refund_requests"), "refund_requests migration");
assert(migrationSource.includes("refund_approvals"), "refund_approvals migration");
assert(migrationSource.includes("consultant_payouts"), "consultant_payouts migration");
assert(migrationSource.includes("operating_expenses"), "operating_expenses migration");
assert(migrationSource.includes("financial_reports"), "financial_reports migration");
assert(migrationSource.includes("reconciliation_logs"), "reconciliation_logs migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/finance"), "finance route permission mapped");

const engineSource = readFileSync(join(rootPath, "src/utils/financeOperationsEngine.ts"), "utf8");
assert(engineSource.includes("buildFinanceOperationsBundle"), "finance engine exists");
assert(engineSource.includes("financialHealth"), "financial health in bundle");
assert(engineSource.includes("refundQueue"), "refund queue in bundle");

const storeSource = readFileSync(join(rootPath, "src/utils/financeOperationsStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "finance audit logging");
assert(storeSource.includes("approveRefundRequest"), "refund approval workflow");

const logicSource = readFileSync(join(rootPath, "src/utils/financeOperationsLogic.ts"), "utf8");
assert(logicSource.includes("assertNotSelfRefundApproval"), "self-approval guard in logic");
assert(logicSource.includes("processRefundApproval"), "refund approval in logic");
assert(logicSource.includes("buildReportCsvContent"), "csv export helper");
assert(logicSource.includes("chargebacks"), "chargeback metric");

const seedSource = readFileSync(join(rootPath, "src/data/financeOperationsSeed.ts"), "utf8");
assert(seedSource.includes("REFUND_REQUEST_SEED"), "refund request seed");
assert(seedSource.includes("RECONCILIATION_LOG_SEED"), "reconciliation seed");
assert(seedSource.includes("chargebackFlag"), "chargeback seed");

const adminComponents = [
  "RevenueCard.tsx",
  "ExpenseCard.tsx",
  "RefundQueueCard.tsx",
  "ReconciliationCard.tsx",
  "FinancialHealthCard.tsx",
  "PayoutCard.tsx",
  "ForecastCard.tsx",
  "FinanceOperationsPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/finance", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const pageSource = readFileSync(
  join(rootPath, "src/components/admin/finance/FinanceOperationsPage.tsx"),
  "utf8"
);
assert(pageSource.includes("FinancialHealthCard"), "page mounts FinancialHealthCard");
assert(pageSource.includes("RefundQueueCard"), "page mounts RefundQueueCard");
assert(
  pageSource.includes("Paystack handles payment processing"),
  "page clarifies Paystack is processor"
);

assert(FINANCE_OPERATIONS_DB_TABLES.length === 7, "seven finance tables");
assert(getFinanceOperationsDatabaseTableManifest().length === 7, "database manifest");

assert(canAccessFinanceOperationsConsole(["ViewFinance"]), "view finance can access");
assert(!canAccessFinanceOperationsConsole(["ManageConsultants"]), "consultants cannot access");

let threw = false;
try {
  assertNotSelfRefundApproval("ops@bamsignal.com", "ops@bamsignal.com");
} catch {
  threw = true;
}
assert(threw, "self-approval rejected");

const pendingRefund = {
  id: "ref_test",
  refundRef: "REF-TEST",
  requestedByEmail: "ops@bamsignal.com",
  amountNgn: 50000,
  reason: "Test",
  status: "pending",
  createdAt: "2026-06-24T00:00:00.000Z",
  updatedAt: "2026-06-24T00:00:00.000Z"
};

const approved = processRefundApproval(pendingRefund, {
  approverEmail: "finance@bamsignal.com",
  decision: "approved",
  note: "Approved"
});
assert(approved.request.status === "approved", "refund approved by different user");

threw = false;
try {
  processRefundApproval(pendingRefund, {
    approverEmail: "ops@bamsignal.com",
    decision: "approved"
  });
} catch {
  threw = true;
}
assert(threw, "self-approval blocked in processRefundApproval");

const reconciliation = computeReconciliationVariance(100000, 100000);
assert(reconciliation.status === "balanced", "balanced reconciliation");

const variance = computeReconciliationVariance(100000, 95000);
assert(variance.status === "variance", "variance detected");

const csvExport = buildReportExportPayload(
  {
    reportRef: "RPT-TEST",
    periodType: "daily",
    periodStart: "2026-06-24",
    periodEnd: "2026-06-24",
    totalRevenueNgn: 100,
    totalExpensesNgn: 20,
    totalRefundsNgn: 5,
    netPositionNgn: 75
  },
  "csv"
);
assert(csvExport.format === "csv", "csv export format");
assert(csvExport.content.includes("RPT-TEST"), "csv export content");

const pdfExport = buildReportExportPayload(
  {
    reportRef: "RPT-TEST",
    periodType: "monthly",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-30",
    totalRevenueNgn: 100,
    totalExpensesNgn: 20,
    totalRefundsNgn: 5,
    netPositionNgn: 75
  },
  "pdf"
);
assert(pdfExport.format === "pdf", "pdf export documented");

const record = {
  id: "finance_test_001",
  transactionRef: "FIN-TEST-001",
  areaId: "consultation-fees",
  status: "pending",
  amountNgn: 75000,
  memberRef: "member_test",
  consultantRef: "consultant_test",
  journeyRef: "BS-JR-TEST",
  paystackReference: "pay_test",
  auditRef: null,
  description: "Test payment",
  createdAt: "2026-06-22T00:00:00.000Z",
  timeline: [
    {
      id: "finance_tl_0001",
      actor: "test@bamsignal.com",
      timestamp: "2026-06-22T00:00:00.000Z",
      action: "payment-initiated",
      note: "Test initiated",
      auditRef: null
    }
  ]
};

const updated = appendFinanceTimelineEntry(record, {
  actor: "system@paystack",
  action: "payment-verified",
  note: "Verified",
  auditRef: "audit_test",
  status: "paid"
});
assert(updated.timeline.length === 2, "append adds timeline entry");

threw = false;
try {
  assertFinanceRecordImmutable(record, { ...record, amountNgn: 1 });
} catch {
  threw = true;
}
assert(threw, "immutable field modification rejected");

if (failed) {
  console.error(`\n${failed} finance operations test(s) failed.`);
  process.exit(1);
}

console.log("Finance Operations Center checks passed.");
