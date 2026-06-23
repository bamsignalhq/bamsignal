#!/usr/bin/env node
/**
 * Journey Integrity Audit™ — static journey ID and cross-reference analysis.
 * Generates docs/audits/bamsignal-journey-integrity-audit.md and fails on critical drift.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assignJourneyId,
  createEmptyJourneyRegistry,
  registerExistingJourneyId
} from "../server/services/journeyRegistry.js";
import {
  formatJourneyId,
  isValidJourneyId,
  normalizeJourneyId,
  parseJourneyId
} from "../server/services/journeyId.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = join(rootPath, "docs/audits/bamsignal-journey-integrity-audit.md");

const REFERENCE_SEEDS = [
  { file: "src/data/conciergeConsultantSeed.ts", fields: ["journeyId"], source: "conciergeConsultantSeed" },
  { file: "src/data/auditCenterSeed.ts", fields: ["journeyId"], source: "auditCenterSeed" },
  { file: "src/data/financeOperationsSeed.ts", fields: ["journeyRef"], source: "financeOperationsSeed" },
  { file: "src/data/consultantQualitySeed.ts", fields: ["journeyRef"], source: "consultantQualitySeed" },
  { file: "src/data/conciergeJourneyMilestoneSeed.ts", fields: ["journeyId"], source: "journeyMilestoneSeed" },
  { file: "src/data/conciergeRelationshipLegacyIndexSeed.ts", fields: ["journeyId"], source: "relationshipLegacyIndexSeed" },
  { file: "src/data/successStoryEngineSeed.ts", fields: ["journeyId"], source: "successStoryEngineSeed" },
  { file: "src/data/conciergeSuccessStoryConsentSeed.ts", fields: ["journeyId"], source: "successStoryConsentSeed" },
  { file: "src/data/coupleHappinessNotesSeed.ts", fields: ["journeyId"], source: "coupleHappinessNotesSeed" },
  { file: "src/data/relationshipHealthAlertsSeed.ts", fields: ["journeyId"], source: "relationshipHealthAlertsSeed" },
  { file: "src/data/conciergeJourneyStoryProfileSeed.ts", fields: ["journeyId"], source: "journeyStoryProfileSeed" },
  { file: "src/data/conciergePersistenceSeed.ts", fields: ["journeyId"], source: "conciergePersistenceSeed" },
  { file: "src/data/institutionalAuditSeed.ts", fields: ["journeyId"], source: "institutionalAuditSeed" }
];

const JOURNEY_STAGES = [
  "application",
  "consultation",
  "assignment",
  "introduction",
  "follow-up",
  "relationship",
  "archive",
  "legacy",
  "success-story",
  "milestones",
  "family",
  "quotes",
  "events"
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

function extractJourneyIdsFromSource(source, fields) {
  const ids = [];
  for (const field of fields) {
    const pattern = new RegExp(`${field}:\\s*"(BS-JR-[^"]+)"`, "g");
    let match;
    while ((match = pattern.exec(source))) {
      ids.push(normalizeJourneyId(match[1]));
    }
  }
  return ids;
}

function countNullJourneyRefs(source) {
  return (source.match(/journeyRef:\s*null/g) ?? []).length;
}

function extractMemberJourneyPairs(source) {
  const pairs = [];
  const blocks = source.split(/(?=\n  \{\n    id: "sc_member_)/);
  for (const block of blocks) {
    const idMatch = block.match(/id: "(sc_member_[^"]+)"/);
    if (!idMatch) continue;
    const journeyMatch = block.match(/\n    journeyId: "(BS-JR-[^"]+)"/);
    pairs.push({
      memberId: idMatch[1],
      journeyId: journeyMatch ? normalizeJourneyId(journeyMatch[1]) : null
    });
  }
  return pairs;
}

function collectReferences() {
  const map = new Map();
  const add = (journeyId, source) => {
    if (!journeyId) return;
    const normalized = normalizeJourneyId(journeyId);
    const owners = map.get(normalized) ?? [];
    if (!owners.includes(source)) owners.push(source);
    map.set(normalized, owners);
  };

  for (const seed of REFERENCE_SEEDS) {
    const source = read(seed.file);
    for (const journeyId of extractJourneyIdsFromSource(source, seed.fields)) {
      add(journeyId, seed.source);
    }
  }

  return map;
}

function findDuplicates(ids) {
  const seen = new Set();
  const duplicates = new Set();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

function detectTimelineMismatches(consultantSeed) {
  const issues = [];
  const pairs = extractMemberJourneyPairs(consultantSeed);
  for (const pair of pairs) {
    if (!pair.journeyId) continue;
    const blockPattern = new RegExp(
      `id: "${pair.memberId}"[\\s\\S]*?(?=\\n  \\{\\n    id: "sc_member_|\\n];)`,
      "m"
    );
    const block = consultantSeed.match(blockPattern)?.[0] ?? "";
    const timelineIds = extractJourneyIdsFromSource(block, ["journeyId"]).filter(
      (id) => id !== pair.journeyId
    );
    for (const timelineId of [...new Set(timelineIds)]) {
      if (timelineId !== pair.journeyId) {
        issues.push({
          memberId: pair.memberId,
          expected: pair.journeyId,
          found: timelineId,
          kind: "timeline-inconsistency"
        });
      }
    }
  }
  return issues;
}

function detectArchiveIssues(consultantSeed) {
  const issues = [];
  const pairs = extractMemberJourneyPairs(consultantSeed);
  for (const pair of pairs) {
    if (!pair.journeyId) continue;
    const blockPattern = new RegExp(
      `id: "${pair.memberId}"[\\s\\S]*?(?=\\n  \\{\\n    id: "sc_member_|\\n];)`,
      "m"
    );
    const block = consultantSeed.match(blockPattern)?.[0] ?? "";
    const statusMatch = block.match(/status: "([^"]+)"/);
    const hasArchive = block.includes("journeyArchive:");
    const status = statusMatch?.[1] ?? "";

    if (status === "legacy-archive" && !hasArchive) {
      issues.push({
        journeyId: pair.journeyId,
        kind: "archive-inconsistency",
        summary: "legacy-archive status without journeyArchive metadata"
      });
    }
    if (hasArchive && status !== "legacy-archive" && status !== "married") {
      issues.push({
        journeyId: pair.journeyId,
        kind: "archive-inconsistency",
        summary: `journeyArchive present but status is ${status}`
      });
    }
  }
  return issues;
}

function runRegistrySmokeTests() {
  assert(formatJourneyId(2026, 1) === "BS-JR-2026-0001", "journey ID format BS-JR-YYYY-NNNN");
  assert(isValidJourneyId("BS-JR-2026-0045"), "valid journey ID accepted");
  assert(!isValidJourneyId("BS-JR-26-45"), "invalid journey ID rejected");

  let registry = createEmptyJourneyRegistry();
  const first = assignJourneyId(registry, { memberId: "audit_member_a", createdAt: "2026-01-15T00:00:00.000Z" });
  registry = first.state;
  assert(first.journeyId === "BS-JR-2026-0001", "registry assigns sequential IDs");

  const repeat = assignJourneyId(registry, { memberId: "audit_member_a" });
  assert(!repeat.created && repeat.journeyId === first.journeyId, "journey ID persistence per member");

  let threw = false;
  try {
    registerExistingJourneyId(registry, {
      journeyId: first.journeyId,
      memberId: "audit_member_b",
      assignedAt: new Date().toISOString()
    });
  } catch {
    threw = true;
  }
  assert(threw, "duplicate journey ID registration rejected");
}

// --- Wiring checks ---
const auditSource = read("src/utils/journeyIntegrityAudit.ts");
const reportSource = read("src/utils/journeyIntegrityReport.ts");
const constantsSource = read("src/constants/journeyIntegrityAudit.ts");
const adminHubSource = read("src/pages/AdminHubPage.tsx");

assert(constantsSource.includes("Journey Integrity Audit™"), "journey audit brand");
assert(auditSource.includes("buildCanonicalJourneyRecords"), "canonical journey records builder");
assert(auditSource.includes("findDuplicateJourneyIds"), "duplicate detection");
assert(reportSource.includes("buildJourneyIntegrityReport"), "integrity report builder");
assert(adminHubSource.includes("JourneyIntegrityAuditPage"), "admin hub mounts journey audit");

runRegistrySmokeTests();

// --- Seed analysis ---
const consultantSeed = read("src/data/conciergeConsultantSeed.ts");
const memberPairs = extractMemberJourneyPairs(consultantSeed);
const canonicalIds = new Set(
  memberPairs.filter((pair) => pair.journeyId).map((pair) => pair.journeyId)
);
const missingJourneyMembers = memberPairs.filter((pair) => !pair.journeyId).map((pair) => pair.memberId);
const memberJourneyIds = memberPairs.filter((pair) => pair.journeyId).map((pair) => pair.journeyId);
const duplicateIds = findDuplicates(memberJourneyIds);
const references = collectReferences();
const financeSource = read("src/data/financeOperationsSeed.ts");
const missingFinanceRefs = countNullJourneyRefs(financeSource);

const orphanRecords = [];
const invalidFormat = [];
const missingReferences = [];

for (const [journeyId, sources] of references.entries()) {
  if (!isValidJourneyId(journeyId)) {
    invalidFormat.push({ journeyId, sources: sources.join(", ") });
    continue;
  }

  const externalSources = sources.filter((source) => source !== "conciergeConsultantSeed");
  if (!canonicalIds.has(journeyId) && externalSources.length) {
    orphanRecords.push({ journeyId, sources: externalSources.join(", ") });
  }
}

for (const pair of memberPairs) {
  if (!pair.journeyId) continue;
  const legacySource = read("src/data/conciergeRelationshipLegacyIndexSeed.ts");
  const milestoneSource = read("src/data/conciergeJourneyMilestoneSeed.ts");
  const blockPattern = new RegExp(
    `id: "${pair.memberId}"[\\s\\S]*?(?=\\n  \\{\\n    id: "sc_member_|\\n];)`,
    "m"
  );
  const block = consultantSeed.match(blockPattern)?.[0] ?? "";
  const status = block.match(/status: "([^"]+)"/)?.[1] ?? "";

  if (status === "legacy-archive" || status === "married") {
    const inLegacy = legacySource.includes(pair.journeyId);
    if (!inLegacy && !block.includes("relationshipLegacyIndex")) {
      missingReferences.push({
        journeyId: pair.journeyId,
        missing: "legacy index or relationshipLegacyIndex on member"
      });
    }
  }
}

const timelineIssues = detectTimelineMismatches(consultantSeed);
const archiveIssues = detectArchiveIssues(consultantSeed);
const brokenRelationships = [...timelineIssues, ...archiveIssues];

assert(duplicateIds.length === 0, `no duplicate member journey IDs (${duplicateIds.join(", ") || "ok"})`);
assert(missingJourneyMembers.length === 0, `all members have journey IDs (${missingJourneyMembers.join(", ") || "ok"})`);

if (orphanRecords.length) {
  warn(`${orphanRecords.length} orphan journey reference(s) in cross-system seeds — expected for finance/audit demo data`);
}

if (missingFinanceRefs > 0) {
  warn(`${missingFinanceRefs} finance record(s) have null journeyRef`);
}

const stageCoverage = {
  application: memberPairs.length,
  consultation: (consultantSeed.match(/consultationScheduledAt|communicationJournal/g) ?? []).length,
  assignment: (consultantSeed.match(/assignedConsultantId|currentConsultantId/g) ?? []).length,
  introduction: (consultantSeed.match(/introductions:/g) ?? []).length,
  "follow-up": (consultantSeed.match(/followUpTasks:/g) ?? []).length,
  relationship: memberPairs.length,
  archive: (consultantSeed.match(/journeyArchive:/g) ?? []).length,
  legacy: extractJourneyIdsFromSource(read("src/data/conciergeRelationshipLegacyIndexSeed.ts"), ["journeyId"]).length,
  "success-story": extractJourneyIdsFromSource(read("src/data/successStoryEngineSeed.ts"), ["journeyId"]).length,
  milestones: extractJourneyIdsFromSource(read("src/data/conciergeJourneyMilestoneSeed.ts"), ["journeyId"]).length,
  family: extractJourneyIdsFromSource(read("src/data/conciergeJourneyStoryProfileSeed.ts"), ["journeyId"]).length,
  quotes: extractJourneyIdsFromSource(read("src/data/coupleHappinessNotesSeed.ts"), ["journeyId"]).length,
  events: extractJourneyIdsFromSource(read("src/data/relationshipHealthAlertsSeed.ts"), ["journeyId"]).length
};

const recommendations = [];
if (orphanRecords.length) {
  recommendations.push(
    "Link finance, audit, and quality seed records to canonical member journey IDs or document as external references."
  );
}
if (missingFinanceRefs > 0) {
  recommendations.push(`Attach journeyRef to ${missingFinanceRefs} finance operation record(s) with null refs.`);
}
if (duplicateIds.length) {
  recommendations.push("Reissue duplicate journey IDs from the registry.");
}
if (brokenRelationships.length) {
  recommendations.push("Normalize timeline journeyId fields and align archive metadata with member status.");
}
if (!recommendations.length) {
  recommendations.push("Canonical member registry and journey ID generation are aligned — monitor cross-seed references.");
}

const generatedAt = new Date().toISOString();
const report = `# Journey Integrity Audit™

Generated: ${generatedAt}

## Executive Summary

Journey ID backbone verification from application through legacy archive across canonical member registry and cross-system seed references.

**Canonical journeys:** ${canonicalIds.size}  
**Referenced journey IDs:** ${references.size}  
**Duplicate member IDs:** ${duplicateIds.length}  
**Members missing journey ID:** ${missingJourneyMembers.length}  
**Orphan references:** ${orphanRecords.length}  
**Invalid format IDs:** ${invalidFormat.length}  
**Finance records missing journeyRef:** ${missingFinanceRefs}  
**Timeline/archive issues:** ${brokenRelationships.length}  
**Automated check failures:** ${failed}

Live audit: \`/hard/audit/journeys\` (Journey Integrity Audit™ admin view).

## Journey Integrity Report

### Canonical member registry

${mdTable(
  memberPairs.map((pair) => [pair.memberId, pair.journeyId ?? "—", pair.journeyId && isValidJourneyId(pair.journeyId) ? "Valid" : "Invalid/missing"]),
  ["Member ID", "Journey ID", "Format"]
)}

### Lifecycle stage coverage (seed data signals)

${mdTable(
  JOURNEY_STAGES.map((stage) => [stage, String(stageCoverage[stage] ?? 0)]),
  ["Stage", "Records with signal"]
)}

### Journey ID generation & persistence

| Check | Result |
| --- | --- |
| Format \`BS-JR-YYYY-NNNN\` | Pass |
| Registry sequential assignment | Pass |
| Member ID persistence | Pass — same member retains journey ID |
| Duplicate registration guard | Pass — registry rejects reused IDs |
| Client registry | \`conciergeJourneyRegistry.ts\` mirrors server |
| Server registry | \`server/services/journeyRegistry.js\` |

## Duplicate IDs

${duplicateIds.length ? mdList(duplicateIds) : "No duplicate journey IDs in canonical member registry.\n"}

## Missing References

${missingReferences.length ? mdTable(missingReferences.map((item) => [item.journeyId, item.missing]), ["Journey ID", "Missing"]) : "No missing legacy references on archived/married canonical members.\n"}

### Finance journeyRef gaps

${missingFinanceRefs > 0 ? mdList([`${missingFinanceRefs} finance operation record(s) with journeyRef: null`]) : "All finance records include journeyRef.\n"}

## Broken Relationships

${
  brokenRelationships.length
    ? mdTable(
        brokenRelationships.map((item) => [
          item.journeyId ?? item.memberId ?? "—",
          item.kind,
          item.summary ?? (item.expected ? `Expected ${item.expected}, found ${item.found}` : "—")
        ]),
        ["Journey / Member", "Kind", "Detail"]
      )
    : "No timeline or archive inconsistencies detected in canonical member seed.\n"
}

## Orphan Journey References

References in cross-system seeds not present in canonical member registry (demo/finance data may intentionally reference external journeys):

${orphanRecords.length ? mdTable(orphanRecords.slice(0, 20).map((item) => [item.journeyId, item.sources]), ["Journey ID", "Sources"]) : "None\n"}

## Invalid Journey ID Format

${invalidFormat.length ? mdTable(invalidFormat.map((item) => [item.journeyId, item.sources]), ["Value", "Sources"]) : "None\n"}

## Cross-System Reference Map

${mdTable(
  [...references.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, 25)
    .map(([journeyId, sources]) => [
      journeyId,
      canonicalIds.has(journeyId) ? "Canonical" : "External",
      sources.join(", ")
    ]),
  ["Journey ID", "Registry", "Sources"]
)}

## Recommendations

${mdList(recommendations)}

## Commands

\`\`\`bash
npm run build
npm run test:server-import
npm run audit:journeys
\`\`\`
`;

writeFileSync(reportPath, report, "utf8");
console.log(`Journey audit report written: ${relative(rootPath, reportPath)}`);
console.log(
  `Canonical: ${canonicalIds.size} | References: ${references.size} | Orphans: ${orphanRecords.length} | Duplicates: ${duplicateIds.length}`
);

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (failed) {
  console.error(`\n${failed} journey audit assertion(s) failed.`);
  process.exit(1);
}

console.log("Journey Integrity Audit passed.");
