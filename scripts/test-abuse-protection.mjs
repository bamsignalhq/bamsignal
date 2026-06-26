#!/usr/bin/env node
/**
 * Abuse Protection Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ABUSE_PROTECTION_DB_TABLES,
  abuseProtectionRouteRegistered,
  buildAbuseProtectionSummaryLine,
  canAccessAbuseProtectionCenter,
  countAbuseBlocksByType,
  getAbuseProtectionDatabaseTableManifest,
  listOpenSuspiciousActivity,
  resolveWorstAbuseRiskLevel,
  topAbuseOffendingIps
} from "../server/services/abuseProtection.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const adminSource = read("src/constants/abuseProtectionAdmin.ts");
assert(adminSource.includes('ABUSE_PROTECTION_ADMIN_PATH = "/hard/abuse-protection"'), "abuse protection route");
assert(adminSource.includes("Abuse Protection Center™"), "abuse protection brand");

const constantsSource = read("src/constants/abuseProtection.ts");
assert(constantsSource.includes("otp-requests"), "otp monitor");
assert(constantsSource.includes("bot-detection"), "bot detection monitor");
assert(constantsSource.includes("payment-abuse"), "payment abuse monitor");
assert(constantsSource.includes("endpoint"), "per endpoint rate limit");
assert(constantsSource.includes("ABUSE_PROTECTION_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("abuse_blocks"), "blocks table");

const typesSource = read("src/types/abuseProtection.ts");
assert(typesSource.includes("AbuseProtectionCenterBundle"), "bundle type");
assert(typesSource.includes("AbuseForensicsRecord"), "forensics type");
assert(typesSource.includes("riskScore"), "risk score field");

const logicSource = read("src/utils/abuseProtectionLogic.ts");
assert(logicSource.includes("buildAbuseProtectionCenterBundle"), "bundle builder");
assert(logicSource.includes("exportAbuseReportCsv"), "csv export");
assert(logicSource.includes("adjustAbuseRateLimit"), "rate limit adjust");

const engineSource = read("src/utils/abuseProtectionEngine.ts");
assert(engineSource.includes("buildLiveAbuseProtectionCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/abuseProtectionStore.ts");
assert(storeSource.includes("bamsignal.abuseProtectionCenter.v1"), "localStorage key");
assert(storeSource.includes("applyAbuseProtectionAction"), "protection action store");

const seedSource = read("src/data/abuseProtectionSeed.ts");
assert(seedSource.includes("ABUSE_MONITOR_SEED"), "monitor seed");
assert(seedSource.includes("ABUSE_RATE_LIMIT_SEED"), "rate limit seed");
assert(seedSource.includes("ABUSE_FORENSICS_SEED"), "forensics seed");

const permissionsSource = read("src/constants/permissions.ts");
assert(abuseProtectionRouteRegistered(permissionsSource), "abuse protection permissions wired");
assert(permissionsSource.includes("abuseprotection"), "abuseprotection tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('abuseprotection: "abuse-protection"'), "abuse protection slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyAbuseProtectionCenterPage"), "lazy abuse protection page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "abuseprotection"'), "admin hub tab wired");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"abuseprotection"'), "nav tab id");

const cssSource = read("src/styles/abuse-protection-center.css");
assert(cssSource.includes("abuse-protection-page"), "page styles");

const mainSource = read("src/main.tsx");
assert(mainSource.includes("abuse-protection-center.css"), "styles imported");

const packageSource = read("package.json");
assert(packageSource.includes("test:abuse-protection"), "package.json defines test:abuse-protection");

const sampleBundle = {
  summary: { blockedRequests24h: 541, suspiciousOpen: 3, overallRisk: "high" },
  blocks: [
    { blockType: "temporary" },
    { blockType: "permanent" }
  ],
  suspicious: [{ status: "open" }, { status: "reviewing" }, { status: "resolved" }],
  topIps: [{ blockedRequests: 10 }, { blockedRequests: 5 }]
};

assert(canAccessAbuseProtectionCenter(["ManageSafety"]), "safety can access");
assert(!canAccessAbuseProtectionCenter(["ViewArchives"]), "archives cannot access");
assert(resolveWorstAbuseRiskLevel(["low", "high", "critical"]) === "critical", "worst risk");
assert(buildAbuseProtectionSummaryLine(sampleBundle).includes("541 blocked"), "summary line");
assert(countAbuseBlocksByType(sampleBundle.blocks).permanent === 1, "count blocks");
assert(listOpenSuspiciousActivity(sampleBundle.suspicious).length === 2, "open suspicious");
assert(topAbuseOffendingIps(sampleBundle.topIps, 1).length === 1, "top ips");
assert(getAbuseProtectionDatabaseTableManifest().length === ABUSE_PROTECTION_DB_TABLES.length, "db manifest");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: Abuse Protection Center™ verification complete.");
