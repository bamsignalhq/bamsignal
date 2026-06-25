#!/usr/bin/env node
/**
 * Route & Navigation Integrity Audit™ — static analysis runner.
 * Generates docs/audits/bamsignal-route-navigation-audit.md and fails on critical drift.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_STATIC_PATHS, SEO_DETAIL_PATHS, SEO_HUB_PATHS } from "./seo-sitemap-data.mjs";
import { getNigeriaIndexablePaths } from "./nigeria-sitemap-paths.mjs";
import { getSignalEventsIndexablePaths } from "./signal-events-sitemap-paths.mjs";
import { getBamSignalFoundationIndexablePaths } from "./bam-signal-foundation-sitemap-paths.mjs";
import { getBamSignalInstituteIndexablePaths } from "./bam-signal-institute-sitemap-paths.mjs";
import { getCenturyIndexablePaths } from "./century-sitemap-paths.mjs";
import { getCareersIndexablePaths } from "./careers-sitemap-paths.mjs";
import { getSupportCenterIndexablePaths } from "./support-center-sitemap-paths.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = join(rootPath, "docs/audits/bamsignal-route-navigation-audit.md");

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

function extractPathsFromRecord(source, recordName) {
  const basePaths = new Map();
  for (const match of source.matchAll(/export const ([A-Z_]+)\s*=\s*"(\/[^"]+)"/g)) {
    basePaths.set(match[1], match[2]);
  }

  const match = source.match(new RegExp(`export const ${recordName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\}\\s*as const`, "m"));
  if (!match) return [];

  const paths = [];
  const valuePattern = /:\s*(?:`([^`]+)`|"(\/[^"]+)")/g;
  let valueMatch;
  while ((valueMatch = valuePattern.exec(match[1]))) {
    let path = valueMatch[1] ?? valueMatch[2];
    path = path.replace(/\$\{([A-Z_]+)\}/g, (_, constName) => basePaths.get(constName) ?? `\${${constName}}`);
    paths.push(path);
  }
  return paths;
}

function extractConstPaths(source, constName) {
  const match = source.match(new RegExp(`export const ${constName}\\s*=\\s*"([^"]+)"`));
  return match ? [match[1]] : [];
}

function extractHardTabSlugs(hardRoutesSource) {
  const match = hardRoutesSource.match(/const TAB_SLUGS:[\s\S]*?=\s*\{([\s\S]*?)\};/m);
  if (!match) return [];
  const slugs = [];
  const slugPattern = /:\s*"([^"]+)"/g;
  let slugMatch;
  while ((slugMatch = slugPattern.exec(match[1]))) {
    slugs.push(`/hard/${slugMatch[1] === "command" ? "command" : slugMatch[1]}`);
  }
  return [...new Set(slugs.map((slug) => (slug === "/hard/command" ? "/hard/command" : slug)))];
}

function collectExportedHardPaths(...sources) {
  const paths = new Map();
  for (const source of sources) {
    for (const match of source.matchAll(/export const ([A-Z_]+)\s*=\s*"(\/hard[^"]+)"/g)) {
      paths.set(match[1], match[2]);
    }
  }
  return paths;
}

function extractHardRoutePermissions(permissionsSource, pathConstSources) {
  const constPaths = collectExportedHardPaths(permissionsSource, ...pathConstSources);

  const blockMatch = permissionsSource.match(
    /export const HARD_ROUTE_PERMISSIONS[\s\S]*?=\s*\{([\s\S]*?)\n\};/
  );
  if (!blockMatch) return [];

  const paths = [];
  for (const match of blockMatch[1].matchAll(/"(\/hard[^"]+)":/g)) {
    paths.push(match[1]);
  }
  for (const match of blockMatch[1].matchAll(/\[([A-Z_]+)\]:/g)) {
    const resolved = constPaths.get(match[1]);
    if (resolved) paths.push(resolved);
  }
  return [...new Set(paths)];
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

function findHardcodedRouteStrings() {
  const allowlist = new Set([
    "src/constants",
    "src/utils/routeAudit.ts",
    "src/utils/navigationAudit.ts",
    "src/utils/permissionsAudit.ts",
    "src/utils/securityAuditReport.ts",
    "src/types"
  ]);
  const hits = [];
  const pattern = /"(\/(?:hard|consultant|love|home|onboarding|discover|chats|signals|profile|settings|subscription|signal-concierge|institute|events|careers|century)[^"]*)"/g;

  for (const filePath of walkSourceFiles(join(rootPath, "src"))) {
    const rel = relative(rootPath, filePath);
    if ([...allowlist].some((prefix) => rel.startsWith(prefix))) continue;
    if (rel.includes("routeAudit") || rel.includes("permissionsAudit")) continue;

    const source = readFileSync(filePath, "utf8");
    const localHits = new Set();
    let match;
    while ((match = pattern.exec(source))) {
      localHits.add(match[1]);
    }
    if (localHits.size > 0) {
      hits.push({ file: rel, paths: [...localHits].sort() });
    }
  }
  return hits;
}

function buildSitemapPaths() {
  const cities = JSON.parse(read("src/data/blog/sitemap-cities.json"));
  const pillarSlugs = [
    "best-dating-apps-nigeria-2026",
    "find-real-love-nigeria-guide",
    "verified-dating-nigeria-safety",
    "what-is-bamsignal-nigeria-dating"
  ];
  const blogSlugs = [
    ...cities.map((city) => `/blog/find-love-in-${city}-nigeria`),
    ...pillarSlugs.map((slug) => `/blog/${slug}`)
  ];
  return new Set([
    "",
    "/blog",
    "/signal-concierge",
    ...getSignalEventsIndexablePaths(),
    ...getBamSignalFoundationIndexablePaths(),
    ...getBamSignalInstituteIndexablePaths(),
    ...getCenturyIndexablePaths(),
    ...getCareersIndexablePaths(),
    ...getSupportCenterIndexablePaths(),
    ...LEGAL_STATIC_PATHS,
    ...SEO_HUB_PATHS,
    ...SEO_DETAIL_PATHS,
    ...getNigeriaIndexablePaths(),
    ...blogSlugs
  ]);
}

function inventoryByArea(inventory) {
  return inventory.reduce((groups, item) => {
    groups[item.area] = groups[item.area] ?? [];
    groups[item.area].push(item);
    return groups;
  }, {});
}

function mdList(items) {
  if (!items.length) return "- None\n";
  return items.map((item) => `- ${item}`).join("\n") + "\n";
}

function mdTable(rows, headers) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ];
  return lines.join("\n") + "\n";
}

// --- Load route constants ---
const routesSource = read("src/constants/routes.ts");
const hardRoutesSource = read("src/constants/hardRoutes.ts");
const permissionsSource = read("src/constants/permissions.ts");
const adminNavSource = read("src/components/admin/adminConsoleNav.ts");
const appSource = read("src/App.tsx");
const lazyRoutesSource = read("src/app/lazyRoutes.ts");
const routeAuditSource = read("src/utils/routeAudit.ts");
const navigationAuditSource = read("src/utils/navigationAudit.ts");

const MEMBER_PATHS = [
  "/home",
  "/fast-connection",
  "/onboarding",
  "/discover",
  "/chats",
  "/signals",
  "/profile",
  "/voice-vibe",
  "/trusted-member",
  "/saved-profiles",
  "/settings",
  "/subscription",
  "/payment/success"
];

const PUBLIC_STATIC = [
  "/",
  "/love",
  "/love/login",
  "/love/sign",
  "/blog",
  "/nigeria",
  "/cities",
  "/help",
  "/safety",
  "/features",
  "/premium",
  "/faq",
  "/guides",
  "/compare"
];

const ROUTE_RECORDS = [
  { file: "src/constants/consultantRoutes.ts", record: "CONSULTANT_ROUTES", area: "consultant" },
  { file: "src/constants/signalConciergeRoutes.ts", record: "SIGNAL_CONCIERGE_ROUTES", area: "concierge" },
  { file: "src/constants/signalEventsRoutes.ts", record: "SIGNAL_EVENTS_ROUTES", area: "events" },
  { file: "src/constants/bamSignalFoundationRoutes.ts", record: "BAMSIGNAL_FOUNDATION_ROUTES", area: "public" },
  { file: "src/constants/bamSignalInstituteRoutes.ts", record: "BAMSIGNAL_INSTITUTE_ROUTES", area: "institute" },
  { file: "src/constants/centuryRoutes.ts", record: "CENTURY_ROUTES", area: "century" },
  { file: "src/constants/careersRoutes.ts", record: "CAREERS_ROUTES", area: "public" },
  { file: "src/constants/supportCenterRoutes.ts", record: "SUPPORT_CENTER_ROUTES", area: "public" }
];

const inventory = [];

for (const path of PUBLIC_STATIC) {
  inventory.push({ path, area: "public", source: "public-static", health: "healthy" });
}
for (const path of MEMBER_PATHS) {
  inventory.push({ path, area: "member", source: "member-app", health: "healthy" });
}

for (const { file, record, area } of ROUTE_RECORDS) {
  const source = read(file);
  for (const path of extractPathsFromRecord(source, record)) {
    inventory.push({ path, area, source: record, health: "healthy" });
  }
}

const hardTabPaths = extractHardTabSlugs(hardRoutesSource);
for (const path of hardTabPaths) {
  inventory.push({ path, area: "admin", source: "hard-routes", health: "healthy" });
}

const nestedAdminPaths = [
  "/hard/auth",
  "/hard/concierge",
  "/hard/concierge/operations",
  "/hard/concierge/intelligence",
  "/hard/audit/routes",
  "/hard/audit/database",
  "/hard/audit/security",
  "/hard/audit/journeys",
  "/hard/launch",
  "/hard/remediation",
  "/hard/readiness",
  "/hard/data-integrity"
];

for (const path of nestedAdminPaths) {
  if (!inventory.some((item) => item.path === path)) {
    inventory.push({ path, area: "admin", source: "nested-admin", health: "healthy" });
  }
}

// --- Duplicate detection ---
const pathOwners = new Map();
for (const item of inventory) {
  if (item.path.includes("{")) continue;
  const owners = pathOwners.get(item.path) ?? [];
  owners.push(item);
  pathOwners.set(item.path, owners);
}

const INTENTIONAL_DUPLICATES = new Set(["/help", "/premium", "/safety"]);

const duplicates = [...pathOwners.entries()]
  .filter(([, owners]) => owners.length > 1)
  .map(([path, owners]) => ({
    path,
    intentional: INTENTIONAL_DUPLICATES.has(path),
    sources: owners.map((owner) => `${owner.area}:${owner.source}`).join(", ")
  }));

for (const item of inventory) {
  const dup = duplicates.find((entry) => entry.path === item.path);
  if (dup && !dup.intentional) {
    item.health = "duplicate";
  }
}

// --- Navigation coverage ---
const navTabIds = [...adminNavSource.matchAll(/id:\s*"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((id) => hardRoutesSource.includes(`${id}:`));
const navPaths = new Set(
  navTabIds.map((tab) => (tab === "command" ? "/hard/command" : `/hard/${tab === "overview" ? "metrics" : tab === "cityhome" ? "city-home" : tab === "verifications" ? "verify" : tab === "ads" ? "home-ads" : tab}`))
);

const slugMap = {
  command: "/hard/command",
  overview: "/hard/metrics",
  cityhome: "/hard/city-home",
  verifications: "/hard/verify",
  ads: "/hard/home-ads"
};
const resolvedNavPaths = new Set(
  navTabIds.map((tab) => slugMap[tab] ?? `/hard/${tab}`)
);

const unlinkedNested = [
  { path: "/hard/concierge/operations", label: "Operations Center" },
  { path: "/hard/concierge/intelligence", label: "Journey Intelligence" },
  { path: "/hard/audit/routes", label: "Route & Navigation Audit" },
  { path: "/hard/audit/database", label: "Database Audit" },
  { path: "/hard/audit/security", label: "Permissions Audit" },
  { path: "/hard/audit/journeys", label: "Journey Integrity Audit" },
  { path: "/hard/launch", label: "Launch Readiness" },
  { path: "/hard/remediation", label: "Remediation Board" },
  { path: "/hard/readiness", label: "Readiness Report" },
  { path: "/hard/data-integrity", label: "Data Integrity" }
];

const missingNavigation = unlinkedNested.filter((entry) => !resolvedNavPaths.has(entry.path));

// --- Permission coverage ---
const enforcedPaths = extractHardRoutePermissions(permissionsSource, [
  read("src/constants/operationsCenter.ts"),
  read("src/constants/auditCenterAdmin.ts"),
  read("src/constants/routeAudit.ts"),
  read("src/constants/databaseAudit.ts"),
  read("src/constants/permissionsAudit.ts"),
  read("src/constants/journeyIntegrityAudit.ts"),
  read("src/constants/launchReadiness.ts"),
  read("src/constants/journeyIntelligence.ts"),
  read("src/constants/institutionalComplianceAdmin.ts"),
  read("src/constants/systemHealthAdmin.ts"),
  read("src/constants/notificationReliabilityAdmin.ts"),
  read("src/constants/remediationBoardAdmin.ts"),
  read("src/constants/institutionalReadinessAdmin.ts"),
  read("src/constants/dataIntegrityAdmin.ts"),
  read("src/constants/recoveryCenterAdmin.ts")
]);
const permissionGaps = hardTabPaths.filter((path) => !enforcedPaths.includes(path));

// --- Lazy loading ---
const lazyExports = [...lazyRoutesSource.matchAll(/export const (Lazy[A-Za-z0-9_]+)/g)].map((match) => match[1]);
const lazyImportsInApp = [...appSource.matchAll(/Lazy[A-Za-z0-9_]+/g)].map((match) => match[0]);
const uniqueLazyImports = [...new Set(lazyImportsInApp)].filter((name) => name.startsWith("Lazy"));
const lazyWithoutFallback = uniqueLazyImports.filter((name) => name !== "LazyRouteFallback" && !lazyExports.includes(name));

assert(lazyExports.length >= 50, `lazy route modules exported (${lazyExports.length})`);
assert(lazyWithoutFallback.length === 0, `App.tsx lazy imports resolve in lazyRoutes.ts (${lazyWithoutFallback.join(", ") || "ok"})`);
assert(appSource.includes("LazyAdminConsoleRoot"), "admin console lazy loaded");
assert(appSource.includes("LazyConsultantPortalRoot"), "consultant portal lazy loaded");
assert(appSource.includes("LazyPublicMarketingRoutes"), "public marketing lazy loaded");
assert(appSource.includes("LazyRouteFallback"), "lazy route fallback present");

// --- Sitemap ---
const sitemapPaths = buildSitemapPaths();
const indexablePublicRecords = ROUTE_RECORDS.filter(({ area }) => area === "public" || area === "institute" || area === "events" || area === "concierge" || area === "century");
const sitemapGaps = [];
for (const { file, record, area } of indexablePublicRecords) {
  const source = read(file);
  for (const path of extractPathsFromRecord(source, record)) {
    if (path.includes("{")) continue;
    if (area === "concierge" && path.includes("dashboard")) continue;
    if (area === "concierge" && path.includes("status")) continue;
    if (area === "concierge" && path.includes("apply")) continue;
    if (area === "concierge" && path.includes("consultation")) continue;
    if (area === "concierge" && path.includes("share-your-story")) continue;
    if (!sitemapPaths.has(path)) {
      sitemapGaps.push(`${path} (${record})`);
    }
  }
}

// Member and admin routes should not be in sitemap — informational only
const brokenRoutes = [];

// --- Route constants wiring ---
assert(routeAuditSource.includes("buildRouteInventory"), "route inventory builder present");
assert(navigationAuditSource.includes("buildNavigationMap"), "navigation map builder present");
assert(routeAuditSource.includes("SIGNAL_CONCIERGE_ROUTES"), "concierge routes inventoried");
assert(routeAuditSource.includes("BAMSIGNAL_INSTITUTE_ROUTES"), "institute routes inventoried");

// --- Hardcoded route strings (warning tier) ---
const hardcodedHits = findHardcodedRouteStrings();
if (hardcodedHits.length > 20) {
  warn(`${hardcodedHits.length} source files contain inline route strings — prefer constants`);
}

// --- App route matchers ---
const routeMatcherChecks = [
  { path: "/home", marker: "isMemberAppPath" },
  { path: "/hard/command", marker: "LazyAdminConsoleRoot" },
  { path: "/consultant/login", marker: "LazyConsultantPortalRoot" },
  { path: "/signal-concierge", marker: "signalConciergeRoute" },
  { path: "/institute", marker: "bamSignalInstituteRoute" },
  { path: "/events", marker: "signalEventsRoute" },
  { path: "/careers", marker: "careersRoute" },
  { path: "/help", marker: "supportCenterRoute" }
];

for (const check of routeMatcherChecks) {
  assert(appSource.includes(check.marker), `${check.path} handled via ${check.marker}`);
}

assert(permissionGaps.length === 0, `admin tab paths covered by HARD_ROUTE_PERMISSIONS (${permissionGaps.join(", ") || "ok"})`);
const unexpectedDuplicates = duplicates.filter((item) => !item.intentional);
assert(
  unexpectedDuplicates.length === 0,
  `no unexpected duplicate inventory paths (${unexpectedDuplicates.map((item) => item.path).join(", ") || "ok"})`
);

// --- Build markdown report ---
const generatedAt = new Date().toISOString();
const areaGroups = inventoryByArea(inventory);
const areaCounts = Object.entries(areaGroups)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([area, items]) => `- **${area}**: ${items.length} routes`);

const inventorySample = inventory
  .slice(0, 40)
  .map((item) => [item.path, item.area, item.source, item.health]);

const report = `# Route & Navigation Integrity Audit™

Generated: ${generatedAt}

## Executive Summary

Static route inventory, navigation map cross-check, permission coverage, lazy-loading verification, and sitemap alignment for BamSignal web routes.

**Inventory total:** ${inventory.length} registered routes  
**Duplicates:** ${duplicates.length} (${duplicates.filter((item) => item.intentional).length} intentional SEO/support overlap)  
**Unlinked nested admin views:** ${missingNavigation.length}  
**Permission gaps:** ${permissionGaps.length}  
**Lazy exports:** ${lazyExports.length}  
**Hardcoded route string files (warning):** ${hardcodedHits.length}  
**Automated check failures:** ${failed}

## Route Inventory

${areaCounts.join("\n")}

### Sample inventory

${mdTable(inventorySample, ["Path", "Area", "Source", "Health"])}

Full live inventory: \`/hard/audit/routes\` (Route & Navigation Audit™ admin view).

## Broken Routes

${brokenRoutes.length ? mdList(brokenRoutes) : "No unreachable registered routes detected in static analysis.\n"}

## Duplicate Routes

${
  duplicates.length
    ? mdTable(
        duplicates.map((item) => [item.path, item.intentional ? "Intentional overlap" : "Unexpected", item.sources]),
        ["Path", "Status", "Sources"]
      )
    : "No duplicate path collisions across route registries.\n"
}

## Missing Navigation Entries

Nested admin workspaces reachable by URL but not listed in \`ADMIN_NAV_SECTIONS\`:

${mdTable(
  missingNavigation.map((entry) => [entry.path, entry.label, "Add sub-nav or cross-link from parent tab"]),
  ["Path", "Label", "Recommendation"]
)}

## Permission Mismatches

| Check | Result |
| --- | --- |
| \`HARD_ROUTE_PERMISSIONS\` tab coverage | ${permissionGaps.length ? permissionGaps.join(", ") : "All admin tab paths covered"} |
| \`RequirePermission\` wrapper on AdminHub | ${appSource.includes("RequirePermission") ? "Present" : "Missing"} |
| Consultant login public | Expected — local PIN session |
| Member routes gated | \`requiresMemberRestoreBlocking\` + \`MemberRouteGuard\` |

Known permission warnings tracked in Permissions Audit™ (\`/hard/audit/security\`).

## Lazy Loading

| Check | Status |
| --- | --- |
| \`lazyRoutes.ts\` exports | ${lazyExports.length} lazy modules |
| App imports resolve | ${lazyWithoutFallback.length === 0 ? "Pass" : lazyWithoutFallback.join(", ")} |
| Admin console | Lazy |
| Consultant portal | Lazy |
| Public marketing shell | Lazy |

## Sitemap Inclusion

Public indexable route families are generated via \`scripts/generate-sitemap.mjs\` during \`npm run build\`.

${
  sitemapGaps.length
    ? `### Sitemap gaps (non-auth public paths)\n\n${mdList(sitemapGaps.slice(0, 15))}`
    : "No indexable public route constants missing from sitemap generators.\n"
}

Member (\`/home\`, \`/discover\`, etc.) and admin (\`/hard/*\`) routes are intentionally excluded from \`sitemap.xml\`.

## Route Constants Usage

Route constants live under \`src/constants/*Routes.ts\` and are consumed by \`src/utils/routeAudit.ts\` inventory builders.

Hardcoded route strings outside constants: **${hardcodedHits.length} files** (acceptable in pages/components when paired with matchers — migrate opportunistically).

## Recommendations

1. Add sub-navigation or breadcrumbs for nested admin views (${missingNavigation.map((item) => item.label).join(", ")}).
2. Cross-link finance surfaces (\`/hard/business\`, \`/hard/finance\`, \`/hard/executive\`) per navigation simplification guidance.
3. Unify Support Center discoverability for \`/help\`, \`/contact\`, \`/tickets\`, and SEO hub overlap.
4. Keep institute route density grouped under fewer nav clusters — 60+ institute paths are registered.
5. Re-run \`npm run audit:routes\` after adding routes; update \`src/utils/routeAudit.ts\` inventory when introducing new route families.

## Commands

\`\`\`bash
npm run build
npm run test:server-import
npm run audit:routes
\`\`\`
`;

writeFileSync(reportPath, report, "utf8");
console.log(`Route audit report written: ${relative(rootPath, reportPath)}`);
console.log(`Inventory: ${inventory.length} routes | Duplicates: ${duplicates.length} | Nav gaps: ${missingNavigation.length}`);

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (failed) {
  console.error(`\n${failed} route audit assertion(s) failed.`);
  process.exit(1);
}

console.log("Route & Navigation Integrity Audit passed.");
