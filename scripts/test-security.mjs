#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SECURITY_RESPONSE_HEADERS,
  adminSecretAcceptedViaHeaderOnly,
  buildSecurityScore,
  canAccessSecurityDashboard,
  formatSecuritySummaryLine,
  hasSecurityHeaders,
  scoreToSecurityStatus
} from "../server/services/productionSecurity.js";
import { applySecurityHeaders } from "../server/services/securityHeaders.js";

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

// --- Server hardening ---
const adminAuthSource = read("server/adminAuth.js");
const appSource = read("server/app.js");
const securityHeadersSource = read("server/services/securityHeaders.js");

assert(adminSecretAcceptedViaHeaderOnly(adminAuthSource), "CRON_SECRET header-only in adminAuth");
assert(adminAuthSource.includes("admin_cron_secret_auth"), "cron secret auth audit logged");
assert(appSource.includes('app.disable("x-powered-by")'), "X-Powered-By disabled");
assert(appSource.includes("securityHeadersMiddleware"), "security headers middleware registered");
assert(securityHeadersSource.includes("X-Content-Type-Options"), "nosniff header defined");
assert(securityHeadersSource.includes("X-Frame-Options"), "frame options header defined");

const mockRes = {
  headers: {},
  getHeader(name) {
    return this.headers[name.toLowerCase()];
  },
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }
};
applySecurityHeaders(mockRes);
assert(hasSecurityHeaders(mockRes.headers), "applySecurityHeaders sets required headers");
assert(Object.keys(SECURITY_RESPONSE_HEADERS).length >= 5, "security header manifest populated");

assert(canAccessSecurityDashboard(["ManageOperations"]), "operations can access security dashboard");
assert(canAccessSecurityDashboard(["ManageSafety"]), "safety can access security dashboard");
assert(canAccessSecurityDashboard(["SystemAdministration"]), "system admin can access security dashboard");
assert(!canAccessSecurityDashboard(["ViewFinance"]), "finance alone cannot access security dashboard");

const sampleDomains = [
  { status: "secure", score: 90 },
  { status: "warning", score: 72 },
  { status: "critical", score: 35 }
];
assert(buildSecurityScore(sampleDomains) > 0, "security score computed");
assert(scoreToSecurityStatus(90, false) === "secure", "high score maps to secure");
assert(scoreToSecurityStatus(60, false) === "warning", "mid score maps to warning");
assert(scoreToSecurityStatus(80, true) === "critical", "critical flag forces critical status");

const sampleReport = {
  passedCheckCount: 10,
  warningIssueCount: 2,
  criticalIssueCount: 1,
  overallScore: 78
};
assert(
  formatSecuritySummaryLine(sampleReport).includes("10 passed"),
  "security summary line formatted"
);

// --- Constants and types ---
const adminConstants = read("src/constants/productionSecurityAdmin.ts");
assert(adminConstants.includes('PRODUCTION_SECURITY_ADMIN_PATH = "/hard/security-dashboard"'), "security dashboard route");
assert(adminConstants.includes("Production Security Dashboard"), "security dashboard brand");

const constantsSource = read("src/constants/productionSecurity.ts");
assert(constantsSource.includes("SECURITY_AUDIT_DOMAINS"), "audit domains defined");
assert(constantsSource.includes('"authentication"'), "authentication domain");
assert(constantsSource.includes('"rls"'), "RLS domain");
assert(constantsSource.includes("SECURITY_HARDENING_FIXES"), "hardening fixes list");
assert(constantsSource.includes("CRON_SECRET accepted via header only"), "header-only fix documented");

const typesSource = read("src/types/productionSecurity.ts");
assert(typesSource.includes("SecurityHealthReport"), "SecurityHealthReport type");
assert(typesSource.includes("SecurityChecklistItem"), "SecurityChecklistItem type");

// --- Logic and engine ---
const logicSource = read("src/utils/productionSecurityLogic.ts");
assert(logicSource.includes("buildSecurityHealthReport"), "health report builder");
assert(logicSource.includes("buildSecurityChecklist"), "checklist builder");
assert(logicSource.includes("buildRouteVerifications"), "route verification builder");
assert(logicSource.includes("buildSecurityDomains"), "domain builder");
assert(logicSource.includes("formatSecuritySummaryLine"), "summary formatter");

const engineSource = read("src/utils/productionSecurityEngine.ts");
assert(engineSource.includes("buildProductionSecurityReport"), "production security engine");

// --- Permissions and routing ---
const permissionsSource = read("src/constants/permissions.ts");
assert(permissionsSource.includes("securitydashboard"), "securitydashboard tab permission");
assert(permissionsSource.includes("/hard/security-dashboard"), "security dashboard enforced route");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('securitydashboard: "security-dashboard"'), "security dashboard slug");
assert(hardRoutesSource.includes("PRODUCTION_SECURITY_ADMIN_PATH"), "security path import");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"securitydashboard"'), "security dashboard nav tab");

// --- UI components ---
const adminComponents = [
  "SecurityHealthReportCard.tsx",
  "SecurityChecklist.tsx",
  "SecurityDashboard.tsx"
];
for (const file of adminComponents) {
  const source = read(`src/components/admin/security/${file}`);
  assert(source.length > 0, `${file} exists`);
}
assert(read("src/components/admin/security/SecurityDashboard.tsx").includes("SecurityHealthReportCard"), "dashboard mounts health report");
assert(read("src/components/admin/security/SecurityDashboard.tsx").includes("SecurityChecklist"), "dashboard mounts checklist");
assert(read("src/components/admin/security/SecurityDashboard.tsx").includes("buildProductionSecurityReport"), "dashboard uses engine");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "securitydashboard"'), "AdminHub mounts SecurityDashboard");
assert(adminHubSource.includes("SecurityDashboard"), "SecurityDashboard imported");

const mainSource = read("src/main.tsx");
assert(mainSource.includes("production-security.css"), "security styles imported");

const stylesSource = read("src/styles/production-security.css");
assert(stylesSource.includes(".production-security-page"), "security page styles");

// --- Domain count verification ---
const domainCount = (constantsSource.match(/id: "/g) || []).length;
assert(domainCount >= 18, `at least 18 audit domains (${domainCount})`);

if (failed > 0) {
  console.error(`\n${failed} security test(s) failed.`);
  process.exit(1);
}

console.log("All production security tests passed.");
