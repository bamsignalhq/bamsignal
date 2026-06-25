#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DATA_GOVERNANCE_CENTER_DB_TABLES,
  appendConsentAudit,
  buildDataGovernanceSummary,
  canAccessDataGovernanceCenter,
  completePrivacyRequest,
  filterInventoryByArea,
  filterPrivacyRequestsByArea,
  getDataGovernanceCenterDatabaseTableManifest,
  listActiveConsents,
  listOpenPrivacyRequests,
  withdrawConsent
} from "../server/services/dataGovernanceCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/dataGovernanceCenterAdmin.ts"), "utf8");
assert(adminSource.includes('DATA_GOVERNANCE_CENTER_ADMIN_PATH = "/hard/data-governance"'), "data governance route");
assert(
  adminSource.includes("Data Governance, Privacy & Retention Center™"),
  "data governance brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/dataGovernanceCenter.ts"), "utf8");
assert(constantsSource.includes("classification"), "classification area");
assert(constantsSource.includes("highly-confidential"), "highly confidential class");
assert(constantsSource.includes("journey-records"), "journey records retention");
assert(constantsSource.includes("consent-withdrawal"), "consent withdrawal request");
assert(constantsSource.includes("data_inventory_items"), "data_inventory_items table");
assert(constantsSource.includes("DATA_GOVERNANCE_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("DATA_GOVERNANCE_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Legal Hold"), "legal hold future item");
assert(constantsSource.includes("NDPR"), "ndpr future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252700_data_governance_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("data_inventory_items"), "data_inventory_items migration");
assert(migrationSource.includes("consent_records"), "consent_records migration");
assert(migrationSource.includes("sensitive_data_registers"), "sensitive_data_registers migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/data-governance"), "data governance permission");

const engineSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildDataGovernanceCenterBundle"), "data governance engine");

const storeSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "data governance audit logging");
assert(storeSource.includes("withdrawDataGovernanceConsent"), "consent withdrawal");
assert(storeSource.includes("completeDataGovernancePrivacyRequest"), "privacy request completion");

const logicSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildDataGovernanceSummary"), "summary builder");
assert(logicSource.includes("listOpenPrivacyRequests"), "open requests helper");

const seedSource = readFileSync(join(rootPath, "src/data/dataGovernanceCenterSeed.ts"), "utf8");
assert(seedSource.includes("DATA_INVENTORY_SEED"), "inventory seed");
assert(seedSource.includes("RETENTION_POLICY_SEED"), "retention seed");
assert(seedSource.includes("CONSENT_RECORD_SEED"), "consent seed");
assert(seedSource.includes("SENSITIVE_DATA_REGISTER_SEED"), "sensitive data seed");

const adminComponents = [
  "DataInventoryCard.tsx",
  "RetentionCard.tsx",
  "ConsentCard.tsx",
  "PrivacyRequestCard.tsx",
  "SensitiveDataCard.tsx",
  "ComplianceCard.tsx",
  "DataGovernanceCenterPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/dataGovernance", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("DataGovernanceCenterPage"), "admin hub mounts data governance page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"datagovernance"'), "data governance nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:data-governance"), "package.json defines test:data-governance");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("data-governance-center.css"), "data governance styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/data-governance-center.css"), "utf8");
assert(cssSource.includes("data-governance-center-page"), "data governance styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("DATA_GOVERNANCE_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.dataGovernanceCenter.v1"), "localStorage manifest");

assert(DATA_GOVERNANCE_CENTER_DB_TABLES.length === 6, "six data governance tables");
assert(getDataGovernanceCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessDataGovernanceCenter(["ManageGovernance"]), "governance can access");
assert(canAccessDataGovernanceCenter(["ManageCompliance"]), "compliance can access");
assert(canAccessDataGovernanceCenter(["SystemAdministration"]), "system admin can access");
assert(!canAccessDataGovernanceCenter(["ViewMembers"]), "members cannot access");

const inventory = [
  {
    id: "inv_1",
    dataClass: "confidential",
    containsPii: true,
    containsSensitive: false
  },
  {
    id: "inv_2",
    dataClass: "restricted",
    containsPii: true,
    containsSensitive: true
  }
];

const sensitiveFiltered = filterInventoryByArea(inventory, "sensitive");
assert(sensitiveFiltered.length === 2, "sensitive inventory filter");

const requests = [
  { id: "pr_1", requestType: "delete", status: "pending" },
  { id: "pr_2", requestType: "download", status: "processing" },
  { id: "pr_3", requestType: "correct", status: "completed" }
];

const deletionRequests = filterPrivacyRequestsByArea(requests, "deletion");
assert(deletionRequests.length === 1, "deletion request filter");

const openRequests = listOpenPrivacyRequests(requests);
assert(openRequests.length === 2, "open privacy requests");

const retentionPolicies = [{ id: "ret_1", active: true }, { id: "ret_2", active: false }];
const consents = [
  { id: "con_1", status: "active" },
  { id: "con_2", status: "withdrawn" }
];
const regionalPolicies = [{ active: true }, { active: false }];
const sensitiveRegisters = [{ id: "sen_1" }];

const summary = buildDataGovernanceSummary(
  inventory,
  retentionPolicies,
  requests,
  consents,
  regionalPolicies,
  sensitiveRegisters
);
assert(summary.inventoryCount === 2, "inventory count");
assert(summary.openPrivacyRequests === 2, "open request count");
assert(summary.highlyConfidentialCount === 1, "highly confidential count");

const consent = {
  id: "con_test",
  consentRef: "CON-TEST",
  memberRef: "member_***01",
  version: 1,
  purpose: "Test purpose",
  scope: "Test scope",
  status: "active",
  grantedAt: "2026-01-01T00:00:00.000Z",
  auditTrail: []
};

const audited = appendConsentAudit(consent, "privacy@bamsignal.com", "reviewed");
assert(audited.auditTrail.length === 1, "consent audit appended");

const withdrawn = withdrawConsent(consent, "member");
assert(withdrawn.status === "withdrawn", "consent withdrawn");

let threw = false;
try {
  withdrawConsent({ ...consent, status: "withdrawn" }, "member");
} catch {
  threw = true;
}
assert(threw, "cannot withdraw twice");

const completed = completePrivacyRequest(
  { id: "pr_test", requestRef: "PRV-TEST", requestType: "delete", status: "pending", memberRef: "m1" },
  "privacy@bamsignal.com"
);
assert(completed.status === "completed", "privacy request completed");

const activeConsents = listActiveConsents(consents);
assert(activeConsents.length === 1, "active consents listed");

if (failed) {
  console.error(`\n${failed} data governance test(s) failed.`);
  process.exit(1);
}

console.log("Data Governance, Privacy & Retention Center checks passed.");
