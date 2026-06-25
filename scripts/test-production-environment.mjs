#!/usr/bin/env node
/**
 * Production Environment Audit™ — verification tests.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessProductionEnvironmentAudit,
  formatProductionEnvironmentSummary,
  isPlaceholderEnvValue,
  parseEnvExampleKeys,
  productionEnvironmentRouteRegistered,
  registryCriticalVarNames
} from "../server/services/productionEnvironmentAudit.js";

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

const adminSource = read("src/constants/productionEnvironmentAdmin.ts");
assert(adminSource.includes("/hard/production-environment"), "production environment route");
assert(adminSource.includes("Production Environment Audit"), "production environment brand");

const constantsSource = read("src/constants/productionEnvironmentAudit.ts");
assert(constantsSource.includes("PRODUCTION_ENV_REGISTRY"), "env registry");
assert(constantsSource.includes('"supabase"'), "supabase integration");
assert(constantsSource.includes("PRODUCTION_ENV_DUPLICATE_GROUPS"), "duplicate groups");
assert(constantsSource.includes("VAPID"), "vapid documented");

const typesSource = read("src/types/productionEnvironmentAudit.ts");
assert(typesSource.includes("ProductionEnvironmentReport"), "report type");
assert(typesSource.includes("ready"), "ready status");

const logicSource = read("src/utils/productionEnvironmentAuditLogic.ts");
assert(logicSource.includes("buildProductionEnvironmentReport"), "report builder");
assert(logicSource.includes("formatProductionEnvironmentSummary"), "summary formatter");

const engineSource = read("src/utils/productionEnvironmentAuditEngine.ts");
assert(engineSource.includes("buildProductionEnvironmentAudit"), "audit engine");

const permissionsSource = read("src/constants/permissions.ts");
assert(productionEnvironmentRouteRegistered(permissionsSource), "production environment permissions");
assert(permissionsSource.includes("productionenvironment"), "productionenvironment tab");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(
  hardRoutesSource.includes('productionenvironment: "production-environment"'),
  "production environment slug"
);

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyProductionEnvironmentDashboard"), "lazy env dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "productionenvironment"'), "AdminHub mounts env dashboard");

const dashboardSource = read("src/components/admin/productionEnvironment/ProductionEnvironmentDashboard.tsx");
assert(dashboardSource.includes("ProductionEnvironmentReportCard"), "dashboard report card");
assert(dashboardSource.includes("Re-audit"), "re-audit action");

const reportDoc = read("PRODUCTION_ENVIRONMENT_REPORT.md");
assert(reportDoc.includes("## Ready"), "report ready section");
assert(reportDoc.includes("## Warning"), "report warning section");
assert(reportDoc.includes("Supabase"), "report supabase");

const envExample = read(".env.example");
const envKeys = parseEnvExampleKeys(envExample);
for (const name of registryCriticalVarNames()) {
  assert(envKeys.includes(name), `.env.example must document critical var ${name}`);
}

assert(isPlaceholderEnvValue("<your-api-key>"), "placeholder detector works");
assert(!isPlaceholderEnvValue(""), "empty is not placeholder");

const dockerfile = read("Dockerfile");
assert(dockerfile.includes("VITE_SUPABASE_URL"), "Dockerfile supabase build arg");
assert(!dockerfile.includes("ARG DATABASE_URL"), "DATABASE_URL must not be Docker build arg");
assert(!dockerfile.includes("ARG PAYSTACK_SECRET_KEY"), "Paystack secret must not be Docker build arg");

const packageSource = read("package.json");
assert(packageSource.includes("test:production-environment"), "test script registered");

assert(canAccessProductionEnvironmentAudit(["ManageOperations"]), "operations can access env audit");
assert(!canAccessProductionEnvironmentAudit(["ViewFinance"]), "finance alone cannot access");

const sampleReport = { readyCount: 12, warningCount: 4, overallScore: 85 };
assert(formatProductionEnvironmentSummary(sampleReport).includes("85"), "summary includes score");

if (failed > 0) {
  console.error(`\n${failed} production environment test(s) failed.`);
  process.exit(1);
}

console.log("production environment checks passed");
