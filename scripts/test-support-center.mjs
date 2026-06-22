#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const routesSource = readFileSync(join(rootPath, "src/constants/supportCenterRoutes.ts"), "utf8");
assert(routesSource.includes('help: "/help"'), "help route");
assert(routesSource.includes('contact: "/contact"'), "contact route");
assert(routesSource.includes('tickets: "/tickets"'), "tickets route");
assert(routesSource.includes('knowledgeBase: "/knowledge-base"'), "knowledge base route");

const constantsSource = readFileSync(join(rootPath, "src/constants/supportCenter.ts"), "utf8");
assert(constantsSource.includes("Customer Support Center™"), "support center brand");
assert(constantsSource.includes("safety-concerns"), "safety category");
assert(constantsSource.includes("SUPPORT_CENTER_FUTURE_KINDS"), "future-ready documented");
assert(constantsSource.includes("live-chat"), "live chat documented only");

const adminSource = readFileSync(join(rootPath, "src/constants/supportCenterAdmin.ts"), "utf8");
assert(adminSource.includes('SUPPORT_CENTER_ADMIN_PATH = "/hard/support"'), "admin support route");

const appRoutesSource = readFileSync(join(rootPath, "src/constants/routes.ts"), "utf8");
assert(appRoutesSource.includes("isSupportCenterRoute"), "public routes include support center");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("support"), "hard routes include support tab");

const seoRoutesSource = readFileSync(join(rootPath, "src/constants/seoRoutes.ts"), "utf8");
assert(seoRoutesSource.includes('hubPath === "/help"'), "seo defers /help hub to support center");

const engineSource = readFileSync(join(rootPath, "src/utils/supportCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildSupportCenterBundle"), "support center engine exists");
assert(engineSource.includes("average-response-time"), "response time metrics");
assert(engineSource.includes("updateSupportTicketStatus"), "ticket status updates");

const publicComponents = [
  "SupportTicketCard.tsx",
  "SupportCategoryCard.tsx",
  "KnowledgeBaseCard.tsx",
  "TicketStatusBadge.tsx",
  "SupportCenterLandingPage.tsx"
];

for (const file of publicComponents) {
  const source = readFileSync(join(rootPath, "src/components/supportCenter", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminComponents = ["SupportQueueCard.tsx", "EscalationCard.tsx", "SupportCenterAdminPage.tsx"];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/support", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:support-center"), "package.json defines test:support-center");

if (failed) process.exit(1);
console.log("support center tests ok");
