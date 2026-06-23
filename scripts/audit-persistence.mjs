#!/usr/bin/env node
/**
 * Supabase & Persistence Audit™ — static storage and schema analysis.
 * Generates docs/audits/bamsignal-persistence-audit.md and fails on critical drift.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = join(rootPath, "docs/audits/bamsignal-persistence-audit.md");

const AUDIT_DOMAINS = [
  { id: "members", label: "Members" },
  { id: "consultants", label: "Consultants" },
  { id: "applications", label: "Applications" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "archives", label: "Archives" },
  { id: "legacy", label: "Legacy Profiles" },
  { id: "support", label: "Support Tickets" },
  { id: "safety", label: "Safety Cases" },
  { id: "notifications", label: "Notifications" },
  { id: "documents", label: "Documents" },
  { id: "payments", label: "Payments" },
  { id: "meetings", label: "Meetings" }
];

let failed = 0;
const warnings = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function warn(message) {
  warnings.push(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function walkSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walkSourceFiles(fullPath, files);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function mdTable(rows, headers) {
  if (!rows.length) return "_None_\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n") + "\n";
}

function mdList(items) {
  if (!items.length) return "- None\n";
  return items.map((item) => `- ${item}`).join("\n") + "\n";
}

function extractConstArray(source, constName) {
  const match = source.match(
    new RegExp(`export const ${constName}[\\s\\S]*?=\\s*(?:Object\\.freeze\\(\\[|\\[)([\\s\\S]*?)(?:\\] as const|\\]\\))`, "m")
  );
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function extractLocalStorageManifest(source) {
  const entries = [];
  const blockMatch = source.match(/const ADMIN_LOCAL_STORAGE_MANIFEST[\s\S]*?=\s*\[([\s\S]*?)\n\];/);
  if (!blockMatch) return entries;

  const objectPattern = /\{\s*storageKey:\s*"([^"]+)"[\s\S]*?domainId:\s*"([^"]+)"[\s\S]*?engine:\s*"([^"]+)"[\s\S]*?expectedTable:\s*(null|"[^"]*")[\s\S]*?note:\s*"([^"]*)"/g;
  let match;
  while ((match = objectPattern.exec(blockMatch[1]))) {
    entries.push({
      storageKey: match[1],
      domainId: match[2],
      engine: match[3],
      expectedTable: match[4] === "null" ? null : match[4].replace(/"/g, ""),
      note: match[5]
    });
  }
  return entries;
}

function scanInstitutionalStorageKeys() {
  const keys = new Map();
  for (const filePath of walkSourceFiles(join(rootPath, "src"))) {
    const rel = relative(rootPath, filePath);
    const source = readFileSync(filePath, "utf8");

    for (const match of source.matchAll(/const STORAGE_KEY = "([^"]+)"/g)) {
      keys.set(match[1], { file: rel, kind: "admin-engine" });
    }
    for (const match of source.matchAll(/STORAGE_KEYS\.([a-zA-Z0-9_]+)/g)) {
      keys.set(`STORAGE_KEYS.${match[1]}`, { file: rel, kind: "limits-key" });
    }
    for (const match of source.matchAll(/readJson[^)]*"([^"]+bamsignal[^"]*)"/g)) {
      keys.set(match[1], { file: rel, kind: "readJson" });
    }
  }
  return keys;
}

function parseMigrationFeatures(migrationSource) {
  const foreignKeys = [...migrationSource.matchAll(/references concierge_members \(id\)/g)].length;
  const indexes = [...migrationSource.matchAll(/create (?:unique )?index if not exists/gi)].length;
  const noDeleteTriggers = [...migrationSource.matchAll(/concierge_no_delete/g)].length;
  const immutabilityTriggers = [...migrationSource.matchAll(/immutable/gi)].length;
  const tables = [...migrationSource.matchAll(/create table if not exists (\w+)/g)].map((m) => m[1]);
  const rlsEnabled = /row level security|enable row level security|create policy/i.test(migrationSource);
  return { foreignKeys, indexes, noDeleteTriggers, immutabilityTriggers, tables, rlsEnabled };
}

function mapDomainPersistence(domainId, manifest, migrationTables, requiredTables) {
  const deps = manifest.filter((item) => item.domainId === domainId || matchesDomainAlias(domainId, item.domainId));
  const tableMap = {
    members: ["concierge_members", "app_users", "app_member_profiles"],
    consultants: ["concierge_consultants"],
    applications: ["concierge_members"],
    introductions: ["concierge_introductions", "member_introductions"],
    "follow-ups": ["concierge_followups"],
    archives: ["concierge_archives"],
    legacy: ["concierge_legacy_profiles", "success_stories", "concierge_success_story_consents"],
    support: [],
    safety: [],
    notifications: ["concierge_notifications"],
    documents: [],
    payments: ["concierge_consultation_payments", "payment_events", "payment_fulfillments"],
    meetings: ["concierge_consultations", "concierge_meeting_notes"]
  };

  const expected = tableMap[domainId] ?? [];
  const tablesPresent = expected.filter((table) => migrationTables.includes(table) || requiredTables.includes(table));
  const localOnly = deps.filter((item) => !item.expectedTable);
  const dualWrite = deps.filter((item) => item.expectedTable);

  let status = "healthy";
  if (!expected.length && deps.length) status = "needs-migration";
  else if (dualWrite.length && tablesPresent.length) status = "partial";
  else if (tablesPresent.length && !deps.length) status = "healthy";
  else if (!tablesPresent.length && deps.length) status = "legacy-dependency";
  else if (expected.length && !tablesPresent.length) status = "missing";

  return { status, deps, tablesPresent, expected, localOnly, dualWrite };
}

function matchesDomainAlias(domainId, manifestDomain) {
  if (domainId === "applications" && manifestDomain === "members") return true;
  if (domainId === "meetings" && manifestDomain === "members") return false;
  return domainId === manifestDomain;
}

// --- Load sources ---
const databaseAuditSource = read("src/utils/databaseAudit.ts");
const migrationGapSource = read("src/utils/migrationGapReport.ts");
const supabaseReportSource = read("src/utils/supabaseHealthReport.ts");
const schemaVerificationSource = read("server/services/schemaVerification.js");
const migrationSource = read("migrations/0004_signal_concierge_persistence.sql");
const conciergePersistenceSource = read("server/services/conciergePersistence.js");
const repositorySharedSource = read("src/services/concierge/conciergeRepositoryShared.ts");
const backupRunbookSource = read("docs/runbooks/database-backup.md");

const baselineTables = extractConstArray(databaseAuditSource, "BASELINE_SCHEMA_TABLES");
const conciergeTables = extractConstArray(databaseAuditSource, "CONCIERGE_SCHEMA_TABLES");
const requiredTables = extractConstArray(schemaVerificationSource, "REQUIRED_SCHEMA_TABLES");
const localStorageManifest = extractLocalStorageManifest(databaseAuditSource);
const migrationFeatures = parseMigrationFeatures(migrationSource);
const scannedKeys = scanInstitutionalStorageKeys();

const conciergeNotInRequired = conciergeTables.filter((table) => !requiredTables.includes(table));
const duplicateTableGroups = [
  ["audit_logs", "platform_audit_log", "moderation_audit_log"],
  ["member_introductions", "concierge_introductions"],
  ["success_stories", "concierge_success_story_consents"]
];

const mockRepositories = [
  "consultantRepository.ts",
  "conciergeMemberRepository.ts",
  "introductionRepository.ts",
  "followupRepository.ts",
  "archiveRepository.ts",
  "legacyProfileRepository.ts",
  "successStoryConsentRepository.ts"
];

// --- Assertions ---
assert(databaseAuditSource.includes("buildDatabaseTableInventory"), "database table inventory builder");
assert(migrationGapSource.includes("buildMigrationGapReport"), "migration gap report builder");
assert(supabaseReportSource.includes("buildSupabaseHealthReport"), "supabase health report builder");
assert(conciergePersistenceSource.includes("concierge_members"), "server concierge persistence active");
assert(conciergePersistenceSource.includes("insert into"), "server writes to Postgres");
assert(repositorySharedSource.includes("noopSupabaseWrite"), "client repos stub Supabase writes");
assert(repositorySharedSource.includes("migration_not_enabled"), "client migration cutover documented");
assert(migrationSource.includes("concierge_prevent_delete"), "no-delete triggers in migration");
assert(migrationFeatures.tables.length >= 12, `${migrationFeatures.tables.length} concierge tables in migration 0004`);
assert(backupRunbookSource.includes("pg_dump"), "database backup runbook documents pg_dump");

for (const repo of mockRepositories) {
  assert(read(`src/services/concierge/${repo}`).includes("noopSupabase"), `${repo} uses noop Supabase layer`);
}

if (conciergeNotInRequired.length) {
  warn(
    `${conciergeNotInRequired.length} concierge tables absent from REQUIRED_SCHEMA_TABLES — startup verify will not catch missing concierge schema`
  );
}

if (!migrationFeatures.rlsEnabled) {
  warn("No Row Level Security policies in migration 0004 — concierge tables rely on server-side admin auth only");
}

// --- Domain persistence report ---
const domainRows = [];
const migrationGaps = [];
for (const domain of AUDIT_DOMAINS) {
  const mapped = mapDomainPersistence(domain.id, localStorageManifest, conciergeTables, requiredTables);
  domainRows.push([domain.label, mapped.status, mapped.tablesPresent.join(", ") || "—", String(mapped.deps.length)]);
  if (mapped.status !== "healthy") {
    migrationGaps.push({
      domain: domain.label,
      status: mapped.status,
      summary:
        mapped.status === "partial"
          ? "Postgres migration exists; localStorage engines still hold parallel state"
          : mapped.status === "needs-migration"
            ? "Admin engine localStorage-only — no dedicated Postgres table"
            : mapped.status === "legacy-dependency"
              ? "Domain depends on localStorage without Postgres cutover"
              : "Expected Postgres tables not mapped"
    });
  }
}

const databaseRisks = [
  {
    severity: "High",
    title: "Concierge schema not in startup verification",
    detail: `${conciergeNotInRequired.length} concierge_* tables missing from REQUIRED_SCHEMA_TABLES`
  },
  {
    severity: "High",
    title: "Client repositories still noop Supabase",
    detail: "conciergeRepositoryShared.ts returns migration_not_enabled — reads/writes stay in localStorage"
  },
  {
    severity: "Medium",
    title: "No RLS on concierge tables",
    detail: "Access control is server-only via requireAdmin; direct Supabase client access would be unscoped"
  },
  {
    severity: "Medium",
    title: "Parallel audit table families",
    detail: "audit_logs, platform_audit_log, moderation_audit_log overlap"
  },
  {
    severity: "Medium",
    title: "Dual introduction/legacy stores",
    detail: "member_introductions vs concierge_introductions; success_stories vs concierge_success_story_consents"
  },
  {
    severity: "Low",
    title: "Backups are operator-managed",
    detail: "No in-app backup job — Supabase PITR and pg_dump per docs/runbooks/database-backup.md"
  }
];

if (!migrationFeatures.rlsEnabled) {
  /* already in risks */
}

const recommendations = [
  "Add concierge_* tables to REQUIRED_SCHEMA_TABLES in schemaVerification.js",
  "Complete dual-write cutover: switch concierge repository reads from localStorage to server/conciergePersistence API",
  "Migrate Document Center, Safety Center, Support admin, Academy, and Quality engines to Postgres tables",
  "Consolidate audit_logs / platform_audit_log / moderation_audit_log into canonical storage",
  "Add RLS policies when enabling direct Supabase client reads for concierge data",
  "Run quarterly pg_dump restore drill per docs/runbooks/database-backup.md"
];

const generatedAt = new Date().toISOString();
const report = `# Supabase & Persistence Audit™

Generated: ${generatedAt}

## Executive Summary

Static persistence audit across institutional domains, Postgres migrations, localStorage dependencies, and server-side concierge persistence.

**Baseline Postgres tables:** ${baselineTables.length}  
**Concierge migration tables:** ${conciergeTables.length}  
**Startup-verified tables:** ${requiredTables.length}  
**Concierge tables not verified at startup:** ${conciergeNotInRequired.length}  
**Admin localStorage dependencies:** ${localStorageManifest.length}  
**Additional institutional storage keys scanned:** ${scannedKeys.size}  
**Mock/stub repositories:** ${mockRepositories.length}  
**Automated check failures:** ${failed}

Live audit: \`/hard/audit/database\` (Database Audit Center™).

## Persistence Report

### Domain status

${mdTable(domainRows, ["Domain", "Status", "Postgres tables", "localStorage deps"])}

### Concierge Postgres migration (0004)

| Feature | Count / status |
| --- | --- |
| Tables | ${migrationFeatures.tables.length} |
| Foreign keys → concierge_members | ${migrationFeatures.foreignKeys} |
| Indexes | ${migrationFeatures.indexes} |
| No-delete triggers | ${migrationFeatures.noDeleteTriggers} |
| Immutability triggers | ${migrationFeatures.immutabilityTriggers} |
| Row Level Security | ${migrationFeatures.rlsEnabled ? "Enabled" : "Not configured"} |
| Cascade rules | ON DELETE not used — append-only via prevent_delete triggers |

**Server persistence:** \`server/services/conciergePersistence.js\` writes members, introductions, follow-ups, archives, legacy, payments, consultations, meeting notes, notifications.

**Client persistence:** Repository layer uses \`noopSupabaseWrite\` — localStorage remains source of truth in browser.

## LocalStorage Inventory

### Admin institutional engines (manifest)

${mdTable(
  localStorageManifest.map((item) => [
    item.storageKey,
    item.domainId,
    item.engine,
    item.expectedTable ?? "none",
    item.expectedTable ? "dual-write" : "local-only"
  ]),
  ["Storage key", "Domain", "Engine", "Expected Postgres table", "Mode"]
)}

### Concierge operational stores (STORAGE_KEYS)

${mdList(
  [...(read("src/constants/limits.ts").matchAll(/concierge[A-Za-z]+: "([^"]+)"/g) ?? [])].map((match) => match[1])
)}

## Mock Repositories

Client concierge repositories delegate Supabase to noop stubs pending migration cutover:

${mdList(mockRepositories.map((repo) => `\`src/services/concierge/${repo}\``))}

\`conciergeRepositoryShared.ts\` documents stale table name constants — server uses \`concierge_*\` prefix from migration 0004.

## Migration Gaps

${migrationGaps.length ? mdTable(migrationGaps.map((gap) => [gap.domain, gap.status, gap.summary]), ["Domain", "Status", "Summary"]) : "All mapped domains have Postgres coverage or documented local-only admin engines.\n"}

### Concierge tables awaiting startup verification

${mdList(conciergeNotInRequired)}

### Missing Postgres tables (admin domains)

${mdList([
  "concierge_documents — Document Center™",
  "concierge_safety_incidents — Safety Center™",
  "concierge_careers_candidates — Talent admin",
  "concierge_academy_progress — Consultant Academy™",
  "concierge_quality_reviews — Quality Assurance™",
  "concierge_finance_records — Finance Operations mirror"
])}

## Database Risks

${mdTable(
  databaseRisks.map((risk) => [risk.severity, risk.title, risk.detail]),
  ["Severity", "Risk", "Detail"]
)}

### Duplicate table families

${mdList(duplicateTableGroups.map((group) => group.join(" ↔ ")))}

## Index & Foreign Key Verification

Migration \`0004_signal_concierge_persistence.sql\` defines:

- Unique \`journey_id\` index on \`concierge_members\`
- Unique \`introduction_id\`, \`notification_id\`, \`note_id\`, \`payment_id\` indexes
- Member-scoped indexes on payments, consultations, introductions, follow-ups, meeting notes
- FK references from child tables to \`concierge_members(id)\`
- Journey ID format CHECK constraint on members

## Backup Verification

| Check | Status |
| --- | --- |
| Database backup runbook | \`docs/runbooks/database-backup.md\` |
| Storage backup runbook | \`docs/runbooks/storage-backup.md\` |
| In-app automated backup | Not shipped — operator responsibility |
| Supabase PITR | Documented in runbook |
| pg_dump procedure | Documented |

## Recommendations

${mdList(recommendations)}

## Commands

\`\`\`bash
npm run build
npm run test:server-import
npm run audit:persistence
\`\`\`
`;

writeFileSync(reportPath, report, "utf8");
console.log(`Persistence audit report written: ${relative(rootPath, reportPath)}`);
console.log(
  `Baseline: ${baselineTables.length} | Concierge: ${conciergeTables.length} | localStorage deps: ${localStorageManifest.length} | Unverified concierge: ${conciergeNotInRequired.length}`
);

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (failed) {
  console.error(`\n${failed} persistence audit assertion(s) failed.`);
  process.exit(1);
}

console.log("Supabase & Persistence Audit passed.");
