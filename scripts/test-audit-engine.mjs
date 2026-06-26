#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendInstitutionalAuditEvent,
  assertInstitutionalAuditAppendOnly
} from "../server/services/auditEngine.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/institutionalComplianceAdmin.ts"), "utf8");
assert(adminSource.includes('INSTITUTIONAL_COMPLIANCE_ADMIN_PATH = "/hard/compliance"'), "compliance admin route");

const constantsSource = readFileSync(join(rootPath, "src/constants/institutionalAuditCompliance.ts"), "utf8");
assert(constantsSource.includes("Institutional Audit & Compliance Center™"), "institutional compliance brand");
assert(constantsSource.includes("consultant-transfer"), "consultant transfer tracked");
assert(constantsSource.includes("support-escalation"), "support escalation tracked");
assert(constantsSource.includes("safety-action"), "safety action tracked");
assert(constantsSource.includes("INSTITUTIONAL_AUDIT_APPEND_ONLY_RULES"), "append-only rules");
assert(constantsSource.includes("INSTITUTIONAL_COMPLIANCE_FUTURE_CAPABILITIES"), "future capabilities documented");
assert(constantsSource.includes("regulatory-exports"), "regulatory exports documented");

const typesSource = readFileSync(join(rootPath, "src/types/auditEngine.ts"), "utf8");
assert(typesSource.includes("export type AuditEvent"), "AuditEvent type");
assert(typesSource.includes("export type AuditActor"), "AuditActor type");
assert(typesSource.includes("export type AuditTarget"), "AuditTarget type");
assert(typesSource.includes("export type AuditAction"), "AuditAction type");

const engineSource = readFileSync(join(rootPath, "src/utils/auditEngine.ts"), "utf8");
assert(engineSource.includes("buildInstitutionalAuditBundle"), "institutional audit bundle builder");
assert(engineSource.includes("appendInstitutionalAuditCenterEvent"), "append-only event API");
assert(!engineSource.includes("deleteInstitutional"), "no delete API");

const logicSource = readFileSync(join(rootPath, "src/utils/auditEngineLogic.ts"), "utf8");
assert(logicSource.includes("assertInstitutionalAuditAppendOnly"), "append-only integrity check");
assert(logicSource.includes("filterInstitutionalAuditEvents"), "institutional event filters");
assert(logicSource.includes("severity"), "severity filter support");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("INSTITUTIONAL_COMPLIANCE_ADMIN_PATH"), "hard routes include compliance path");
assert(hardRoutesSource.includes('"compliance"'), "compliance tab slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/compliance"), "compliance route permission mapped");

const adminComponents = [
  "ComplianceOverviewCard.tsx",
  "AuditTimeline.tsx",
  "AuditEventCard.tsx",
  "AuditActorCard.tsx",
  "ComplianceSearchBar.tsx",
  "InstitutionalComplianceCenterPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/compliance", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("InstitutionalComplianceCenterPage"), "admin hub mounts compliance center");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:audit-engine"), "package.json defines test:audit-engine");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("institutional-compliance.css") || mainSource.includes("institutional-compliance.css")), "institutional compliance styles imported");

const seed = [
  {
    id: "inst_audit_test_001",
    timestamp: "2026-06-22T00:00:00.000Z",
    actor: {
      id: "operator_test",
      name: "Test Operator",
      email: "test@bamsignal.com",
      role: "Admin"
    },
    action: "login",
    target: {
      id: "session_test",
      kind: "session",
      label: "Test session",
      ref: "session_test"
    },
    severity: "info",
    result: "success",
    summary: "Test login"
  }
];

const appended = appendInstitutionalAuditEvent(seed, {
  actor: {
    id: "operator_test",
    name: "Test Operator",
    email: "test@bamsignal.com",
    role: "Admin"
  },
  action: "logout",
  target: {
    id: "session_test",
    kind: "session",
    label: "Test session",
    ref: "session_test"
  },
  severity: "info",
  result: "success",
  summary: "Test logout"
});
assert(appended.length === 2, "append adds event");

let threw = false;
try {
  assertInstitutionalAuditAppendOnly(appended, [appended[0]]);
} catch {
  threw = true;
}
assert(threw, "delete rejected");

threw = false;
try {
  assertInstitutionalAuditAppendOnly(appended, [
    { ...appended[0], actor: { ...appended[0].actor, email: "hacker@evil.com" } },
    appended[1]
  ]);
} catch {
  threw = true;
}
assert(threw, "history modification rejected");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Institutional audit engine checks passed.");
