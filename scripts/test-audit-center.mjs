#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendAuditEventRecord,
  assertAuditLogAppendOnly
} from "../server/services/auditComplianceCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/auditCenterAdmin.ts"), "utf8");
assert(adminSource.includes('AUDIT_CENTER_ADMIN_PATH = "/hard/audit"'), "admin audit route");

const constantsSource = readFileSync(join(rootPath, "src/constants/auditCenter.ts"), "utf8");
assert(constantsSource.includes("Audit & Compliance Center™"), "audit center brand");
assert(constantsSource.includes("consultant-assignment"), "assignment action tracked");
assert(constantsSource.includes("AUDIT_APPEND_ONLY_RULES"), "append-only rules documented");
assert(constantsSource.includes("Never delete"), "never delete rule");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("audit"), "hard routes include audit tab");

const engineSource = readFileSync(join(rootPath, "src/utils/auditCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildAuditComplianceBundle"), "audit compliance engine exists");
assert(engineSource.includes("appendAuditCenterEvent"), "append-only event API");
assert(!engineSource.includes("deleteAudit"), "no delete API");

const logicSource = readFileSync(join(rootPath, "src/utils/auditCenterLogic.ts"), "utf8");
assert(logicSource.includes("assertAuditLogAppendOnly"), "append-only integrity check");
assert(logicSource.includes("events-today"), "events today metric");

const adminComponents = [
  "AuditEventCard.tsx",
  "ComplianceOverviewCard.tsx",
  "ActivityTimelineCard.tsx",
  "AuditFilterCard.tsx",
  "AuditSummaryCard.tsx",
  "AuditComplianceCenterPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/audit", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("AuditComplianceCenterPage"), "admin hub mounts audit center");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:audit-center"), "package.json defines test:audit-center");

const seed = [
  {
    id: "audit_test_001",
    actor: "test@bamsignal.com",
    role: "Admin",
    action: "login",
    entity: "session",
    entityRef: "session_test",
    timestamp: "2026-06-22T00:00:00.000Z",
    result: "success",
    ipPlaceholder: "127.0.0.1",
    detail: "Test login"
  }
];

const appended = appendAuditEventRecord(seed, {
  actor: "test@bamsignal.com",
  role: "Admin",
  action: "logout",
  entity: "session",
  entityRef: "session_test",
  result: "success",
  ipPlaceholder: "127.0.0.1",
  detail: "Test logout"
});
assert(appended.length === 2, "append adds event");

let threw = false;
try {
  assertAuditLogAppendOnly(appended, [appended[0]]);
} catch {
  threw = true;
}
assert(threw, "delete rejected");

threw = false;
try {
  assertAuditLogAppendOnly(appended, [{ ...appended[0], actor: "hacker@evil.com" }, appended[1]]);
} catch {
  threw = true;
}
assert(threw, "history modification rejected");

if (failed) process.exit(1);
console.log("audit center tests ok");
