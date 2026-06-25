#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DOCUMENT_CENTER_DB_TABLES,
  getDocumentCenterDatabaseTableManifest,
  recordAcknowledgement,
  searchKnowledgeArticles,
  validateDocumentPublish,
  canAccessDocumentCenter
} from "../server/services/documentCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/documentCenterAdmin.ts"), "utf8");
assert(adminSource.includes('DOCUMENT_CENTER_ADMIN_PATH = "/hard/document-center"'), "document center route");
assert(adminSource.includes("Institutional Policy & Documentation Center™"), "institutional brand");

const policiesAdminSource = readFileSync(
  join(rootPath, "src/constants/institutionalPoliciesAdmin.ts"),
  "utf8"
);
assert(policiesAdminSource.includes('INSTITUTIONAL_POLICIES_ADMIN_PATH = "/hard/policies"'), "policies route");

const constantsSource = readFileSync(join(rootPath, "src/constants/documentCenter.ts"), "utf8");
assert(constantsSource.includes("operating-procedures"), "operating procedures category");
assert(constantsSource.includes("support-guides"), "support guides category");
assert(constantsSource.includes("finance-manuals"), "finance manuals category");
assert(constantsSource.includes("journey-frameworks"), "journey frameworks category");
assert(constantsSource.includes("incident-response"), "incident response category");
assert(constantsSource.includes("published"), "published status");
assert(constantsSource.includes("DOCUMENT_CENTER_DB_TABLES"), "db tables constant");
assert(constantsSource.includes("knowledge_articles"), "knowledge_articles table");
assert(constantsSource.includes("document_acknowledgements"), "acknowledgements table");
assert(constantsSource.includes("DOCUMENT_AUDIT_ACTIONS"), "audit actions");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252000_document_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("documents"), "documents migration");
assert(migrationSource.includes("document_versions"), "document_versions migration");
assert(migrationSource.includes("policy_versions"), "policy_versions migration");
assert(migrationSource.includes("knowledge_articles"), "knowledge_articles migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/document-center"), "document center permission");
assert(permissionsSource.includes("/hard/policies"), "policies permission");

const engineSource = readFileSync(join(rootPath, "src/utils/documentCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildDocumentCenterBundle"), "document center engine");
assert(engineSource.includes("buildInstitutionalPoliciesBundle"), "policies bundle");
assert(engineSource.includes("knowledgeArticles"), "knowledge articles in bundle");

const storeSource = readFileSync(join(rootPath, "src/utils/documentCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "document audit logging");
assert(storeSource.includes("publishDocument"), "publish workflow");
assert(storeSource.includes("acknowledgeDocument"), "acknowledgement workflow");

const logicSource = readFileSync(join(rootPath, "src/utils/documentCenterLogic.ts"), "utf8");
assert(logicSource.includes("searchKnowledgeArticles"), "knowledge search");
assert(logicSource.includes("recordAcknowledgement"), "acknowledgement logic");
assert(logicSource.includes("pending-acknowledgements"), "pending acknowledgement metric");

const seedSource = readFileSync(join(rootPath, "src/data/documentCenterSeed.ts"), "utf8");
assert(seedSource.includes("KNOWLEDGE_ARTICLE_SEED"), "knowledge article seed");
assert(seedSource.includes("bodyMarkdown"), "markdown support");
assert(seedSource.includes("attachments"), "attachment support");
assert(seedSource.includes("DOCUMENT_ACKNOWLEDGEMENT_SEED"), "acknowledgement seed");
assert(seedSource.includes("POLICY_VERSION_SEED"), "policy version seed");

const adminComponents = [
  "DocumentLibraryCard.tsx",
  "KnowledgeBaseCard.tsx",
  "PolicyCard.tsx",
  "VersionHistoryCard.tsx",
  "AcknowledgementCard.tsx",
  "CategoryExplorerCard.tsx",
  "SearchCard.tsx",
  "DocumentCenterPage.tsx",
  "InstitutionalPoliciesPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/documents", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("DocumentCenterPage"), "admin hub mounts document center");
assert(hubSource.includes("InstitutionalPoliciesPage"), "admin hub mounts policies");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"policies"'), "policies nav tab");

assert(DOCUMENT_CENTER_DB_TABLES.length === 6, "six document tables");
assert(getDocumentCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessDocumentCenter(["ManageDocuments"]), "manage documents can access");
assert(!canAccessDocumentCenter(["ManageConsultants"]), "consultants cannot access");

const publishCheck = validateDocumentPublish({
  title: "Test",
  version: "1.0",
  status: "review"
});
assert(publishCheck.ok, "review document can publish path validate");

const articles = searchKnowledgeArticles(
  [
    {
      title: "PIN reset",
      bodyMarkdown: "Forgot PIN flow",
      slug: "pin-reset",
      tags: ["support"]
    }
  ],
  "pin"
);
assert(articles.length === 1, "knowledge search works");

const ack = recordAcknowledgement([], {
  documentId: "doc_001",
  employeeEmail: "test@bamsignal.com",
  version: "1.0"
});
assert(ack.acknowledgements.length === 1, "acknowledgement recorded");
assert(ack.acknowledgements[0].acknowledgedAt, "acknowledgement timestamp");

if (failed) {
  console.error(`\n${failed} document center test(s) failed.`);
  process.exit(1);
}

console.log("Document Center checks passed.");
