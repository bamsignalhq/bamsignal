#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DATA_GOVERNANCE_CENTER_DB_TABLES,
  DATA_GOVERNANCE_MODULES,
  DATA_GOVERNANCE_TOOLS,
  GOVERNANCE_TRAIL_ACTIONS,
  appendConsentAudit,
  buildDataGovernanceSummary,
  canAccessDataGovernanceCenter,
  completePrivacyRequest,
  filterDeletionRequests,
  filterExportRequests,
  filterInventoryByArea,
  filterPrivacyRequestsByArea,
  getDataGovernanceCenterDatabaseTableManifest,
  listActiveConsents,
  listOpenPrivacyRequests,
  mapGovernanceToolToAuditAction,
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
assert(adminSource.includes("Data Governance & Privacy Center™"), "data governance brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/dataGovernanceCenter.ts"), "utf8");
assert(constantsSource.includes("consent-management"), "consent management module");
assert(constantsSource.includes("legal-holds"), "legal holds module");
assert(constantsSource.includes("audit-exports"), "audit exports module");
assert(constantsSource.includes("export-member"), "export member tool");
assert(constantsSource.includes("policy-versions"), "policy versions tool");
assert(constantsSource.includes("GovernanceTrailActionId"), "governance trail actions");
assert(constantsSource.includes("legal_holds"), "legal_holds table");
assert(constantsSource.includes("governance_audit_log"), "governance_audit_log table");
assert(constantsSource.includes("audit_exports"), "audit_exports table");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606261400_data_governance_privacy_center.sql"),
  "utf8"
);
assert(migrationSource.includes("legal_holds"), "legal_holds migration");
assert(migrationSource.includes("policy_versions"), "policy_versions migration");
assert(migrationSource.includes("governance_audit_log"), "governance_audit_log migration");
assert(migrationSource.includes("audit_exports"), "audit_exports migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/data-governance"), "data governance permission");

const engineSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildDataGovernanceCenterBundle"), "data governance engine");
assert(engineSource.includes("deletionRequests"), "deletion requests in bundle");
assert(engineSource.includes("governanceAudit"), "governance audit in bundle");

const storeSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "data governance audit logging");
assert(storeSource.includes("withdrawDataGovernanceConsent"), "consent withdrawal");
assert(storeSource.includes("completeDataGovernancePrivacyRequest"), "privacy request completion");
assert(storeSource.includes("applyDataGovernanceTool"), "governance tools");
assert(storeSource.includes("listLegalHolds"), "legal holds list");
assert(storeSource.includes("listGovernanceAudit"), "governance audit list");

const logicSource = readFileSync(join(rootPath, "src/utils/dataGovernanceCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildDataGovernanceSummary"), "summary builder");
assert(logicSource.includes("filterDeletionRequests"), "deletion request filter");
assert(logicSource.includes("mapGovernanceToolToAuditAction"), "tool audit mapping");

const seedSource = readFileSync(join(rootPath, "src/data/dataGovernanceCenterSeed.ts"), "utf8");
assert(seedSource.includes("LEGAL_HOLD_SEED"), "legal hold seed");
assert(seedSource.includes("POLICY_VERSION_SEED"), "policy version seed");
assert(seedSource.includes("GOVERNANCE_AUDIT_SEED"), "governance audit seed");
assert(seedSource.includes("AUDIT_EXPORT_SEED"), "audit export seed");

const adminComponents = [
  "GovernanceSummaryCard.tsx",
  "GovernanceToolsCard.tsx",
  "GovernanceAuditCard.tsx",
  "LegalHoldsCard.tsx",
  "PolicyVersionsCard.tsx",
  "AuditExportsCard.tsx",
  "ConsentCard.tsx",
  "RetentionCard.tsx",
  "PrivacyRequestCard.tsx",
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
assert(cssSource.includes("governance-tools-card__grid"), "governance tools styles");
assert(cssSource.includes("governance-audit-card__action"), "governance audit styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("DATA_GOVERNANCE_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("legal_holds"), "legal holds in database audit");
assert(databaseAuditSource.includes("bamsignal.dataGovernanceCenter.v1"), "localStorage manifest");

assert(DATA_GOVERNANCE_CENTER_DB_TABLES.length === 10, "ten data governance tables");
assert(getDataGovernanceCenterDatabaseTableManifest().length === 10, "database manifest");
assert(DATA_GOVERNANCE_MODULES.length === 7, "seven governance modules");
assert(DATA_GOVERNANCE_TOOLS.length === 5, "five governance tools");
assert(GOVERNANCE_TRAIL_ACTIONS.length === 4, "four governance trail actions");

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
assert(deletionRequests.length === 1, "deletion request filter by area");
assert(filterDeletionRequests(requests).length === 1, "deletion request filter");
assert(filterExportRequests(requests).length === 1, "export request filter");

const openRequests = listOpenPrivacyRequests(requests);
assert(openRequests.length === 2, "open privacy requests");

const retentionPolicies = [{ id: "ret_1", active: true }, { id: "ret_2", active: false }];
const consents = [
  { id: "con_1", status: "active" },
  { id: "con_2", status: "withdrawn" }
];
const regionalPolicies = [{ active: true }, { active: false }];
const sensitiveRegisters = [{ id: "sen_1" }];
const legalHolds = [{ active: true }, { active: false }];
const auditExports = [{ id: "ae_1" }, { id: "ae_2" }];
const policyVersions = [{ active: true }, { active: false }];
const governanceAudit = [{ id: "ga_1" }, { id: "ga_2" }, { id: "ga_3" }];

const summary = buildDataGovernanceSummary(
  inventory,
  retentionPolicies,
  requests,
  consents,
  regionalPolicies,
  sensitiveRegisters,
  legalHolds,
  auditExports,
  policyVersions,
  governanceAudit
);
assert(summary.inventoryCount === 2, "inventory count");
assert(summary.openPrivacyRequests === 2, "open request count");
assert(summary.highlyConfidentialCount === 1, "highly confidential count");
assert(summary.activeLegalHolds === 1, "active legal holds");
assert(summary.auditExportCount === 2, "audit export count");
assert(summary.governanceAuditCount === 3, "governance audit count");

assert(mapGovernanceToolToAuditAction("export-member") === "exported", "export maps to exported");
assert(mapGovernanceToolToAuditAction("delete-member") === "deleted", "delete maps to deleted");
assert(mapGovernanceToolToAuditAction("policy-versions") === "approved", "policy maps to approved");

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

console.log("Data Governance & Privacy Center checks passed.");
