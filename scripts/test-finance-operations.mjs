#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendFinanceTimelineEntry,
  assertFinanceRecordImmutable
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
assert(constantsSource.includes("consultation-fees"), "consultation fees area");
assert(constantsSource.includes("consultant-payouts"), "consultant payouts area");
assert(constantsSource.includes("FINANCE_IMMUTABLE_RULES"), "immutable rules documented");
assert(constantsSource.includes("Audit linked"), "audit linked rule");
assert(constantsSource.includes("FINANCE_OPERATIONS_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Accounting integrations"), "accounting integrations future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("finance"), "hard routes include finance tab");

const engineSource = readFileSync(join(rootPath, "src/utils/financeOperationsEngine.ts"), "utf8");
assert(engineSource.includes("buildFinanceOperationsBundle"), "finance engine exists");
assert(!engineSource.includes("deleteFinance"), "no delete API");

const logicSource = readFileSync(join(rootPath, "src/utils/financeOperationsLogic.ts"), "utf8");
assert(logicSource.includes("assertFinanceRecordImmutable"), "immutable integrity check");
assert(logicSource.includes("revenue-today"), "revenue today metric");
assert(logicSource.includes("outstanding-payouts"), "outstanding payouts metric");

const seedSource = readFileSync(join(rootPath, "src/data/financeOperationsSeed.ts"), "utf8");
assert(seedSource.includes("paystackReference"), "seed includes Paystack references");
assert(seedSource.includes("auditRef"), "seed includes audit links");
assert(seedSource.includes("timeline"), "seed includes timeline");

const adminComponents = [
  "FinanceOverviewCard.tsx",
  "RevenueCard.tsx",
  "PaymentStatusCard.tsx",
  "RefundCard.tsx",
  "ConsultantPayoutCard.tsx",
  "FinancialTimelineCard.tsx",
  "FinanceOperationsPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/finance", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("FinanceOperationsPage"), "admin hub mounts finance operations");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"finance"'), "admin nav includes finance tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:finance-operations"), "package.json defines test:finance-operations");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("finance-operations.css"), "finance styles imported");

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
assert(updated.status === "paid", "status updated via append");

let threw = false;
try {
  assertFinanceRecordImmutable(record, { ...record, amountNgn: 1 });
} catch {
  threw = true;
}
assert(threw, "immutable field modification rejected");

threw = false;
try {
  assertFinanceRecordImmutable(updated, { ...updated, timeline: [updated.timeline[0]] });
} catch {
  threw = true;
}
assert(threw, "timeline delete rejected");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Finance Operations Center checks passed.");
