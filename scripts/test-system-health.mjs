#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countServicesByStatus,
  resolveLiveServiceStatus,
  resolveWorstStatus
} from "../server/services/systemHealthEngine.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/systemHealthAdmin.ts"), "utf8");
assert(adminSource.includes('SYSTEM_HEALTH_ADMIN_PATH = "/hard/system-health"'), "system health admin route");

const constantsSource = readFileSync(join(rootPath, "src/constants/systemHealth.ts"), "utf8");
assert(constantsSource.includes("Institutional System Health Center™"), "system health brand");
assert(constantsSource.includes("google-calendar"), "google calendar monitored");
assert(constantsSource.includes("whatsapp-queue"), "whatsapp queue monitored");
assert(constantsSource.includes("SYSTEM_HEALTH_FUTURE_CAPABILITIES"), "future capabilities documented");
assert(constantsSource.includes("pagerduty"), "pagerduty documented");

const typesSource = readFileSync(join(rootPath, "src/types/systemHealth.ts"), "utf8");
assert(typesSource.includes("ServiceHealthRecord"), "ServiceHealthRecord type");
assert(typesSource.includes("DependencyStatusRecord"), "dependency status type");
assert(typesSource.includes("HealthIncidentRecord"), "incident type");

const logicSource = readFileSync(join(rootPath, "src/utils/systemHealthLogic.ts"), "utf8");
assert(logicSource.includes("buildSystemHealthBundle"), "system health bundle builder");
assert(logicSource.includes("buildDependencyStatuses"), "dependency status builder");
assert(logicSource.includes("uptimePercent"), "uptime metric support");
assert(logicSource.includes("recoveryTimeMinutes"), "recovery time metric support");

const engineSource = readFileSync(join(rootPath, "src/utils/systemHealthEngine.ts"), "utf8");
assert(engineSource.includes("fetchLiveHealthSnapshot"), "live health probe");
assert(engineSource.includes("buildLiveSystemHealthBundle"), "live bundle builder");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("SYSTEM_HEALTH_ADMIN_PATH"), "hard routes include system health path");
assert(hardRoutesSource.includes('"system-health"'), "system health slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/system-health"), "system health route permission mapped");

const adminComponents = [
  "SystemHealthPage.tsx",
  "ServiceHealthCard.tsx",
  "DependencyStatusCard.tsx",
  "HealthSummaryCard.tsx",
  "IncidentTimeline.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/systemHealth", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("SystemHealthPage"), "admin hub mounts system health page");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:system-health"), "package.json defines test:system-health");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("system-health.css"), "system health styles imported");

const monitoredServices = [
  "supabase",
  "paystack",
  "google-calendar",
  "zoom",
  "google-meet",
  "resend",
  "sendchamp",
  "storage",
  "background-jobs",
  "email-queue",
  "whatsapp-queue"
];

for (const serviceId of monitoredServices) {
  assert(constantsSource.includes(`"${serviceId}"`), `${serviceId} monitored`);
}

const healthyHealth = {
  database: "connected",
  paystack: true,
  resend: true,
  signupEmail: true,
  sendchamp: true,
  firebase: true,
  photoStorage: true
};

assert(resolveLiveServiceStatus("supabase", healthyHealth) === "healthy", "supabase healthy when connected");
assert(resolveLiveServiceStatus("paystack", healthyHealth) === "healthy", "paystack healthy");
assert(resolveLiveServiceStatus("storage", { ...healthyHealth, photoStorage: false }) === "offline", "storage offline");

const worst = resolveWorstStatus(["healthy", "degraded", "offline"]);
assert(worst === "offline", "worst status resolves offline");

const counts = countServicesByStatus([
  { status: "healthy" },
  { status: "healthy" },
  { status: "degraded" },
  { status: "offline" }
]);
assert(counts.healthy === 2 && counts.degraded === 1 && counts.offline === 1, "status counts");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Institutional system health checks passed.");
