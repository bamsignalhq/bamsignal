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

const adminSource = readFileSync(join(rootPath, "src/constants/internalMessagingAdmin.ts"), "utf8");
assert(adminSource.includes('INTERNAL_MESSAGING_ADMIN_PATH = "/hard/messages"'), "admin messages route");
assert(adminSource.includes("Internal Messaging Center™"), "messaging center brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/internalMessaging.ts"), "utf8");
assert(constantsSource.includes("Internal Messaging Center™"), "messaging brand");
assert(constantsSource.includes("announcements"), "announcements channel");
assert(constantsSource.includes("handoff"), "handoff message type");
assert(constantsSource.includes("INTERNAL_MESSAGING_FEATURES"), "messaging features documented");
assert(constantsSource.includes("read-receipts"), "read receipts feature");
assert(constantsSource.includes("department-routing"), "department routing feature");
assert(constantsSource.includes("INTERNAL_MESSAGING_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("mobile-notifications"), "mobile notifications future item");
assert(constantsSource.includes("department-chat"), "department chat future item");
assert(constantsSource.includes("MESSAGING_CENTER_METRICS"), "messaging metrics");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("messages"), "hard routes include messages tab");

const engineSource = readFileSync(join(rootPath, "src/utils/internalMessagingEngine.ts"), "utf8");
assert(engineSource.includes("buildInternalMessagingBundle"), "messaging engine exists");
assert(engineSource.includes("buildMessagingMetrics"), "messaging metrics in bundle");

const logicSource = readFileSync(join(rootPath, "src/utils/internalMessagingLogic.ts"), "utf8");
assert(logicSource.includes("countUnread"), "unread count logic");
assert(logicSource.includes("buildChannelSummaries"), "channel summaries");
assert(logicSource.includes("countEscalations"), "escalations metric");

const seedSource = readFileSync(join(rootPath, "src/data/internalMessagingSeed.ts"), "utf8");
assert(seedSource.includes("readBy"), "seed includes read receipts");
assert(seedSource.includes("departmentRoute"), "seed includes department routing");
assert(seedSource.includes("escalation"), "seed includes escalation");

const adminComponents = [
  "ChannelCard.tsx",
  "AnnouncementCard.tsx",
  "EscalationCard.tsx",
  "HandoffCard.tsx",
  "MessageThreadCard.tsx",
  "MessagingDashboardPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/messages", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("MessagingDashboardPage"), "admin hub mounts messaging dashboard");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"messages"'), "admin nav includes messages tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:internal-messaging"), "package.json defines test:internal-messaging");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("internal-messaging.css"), "messaging styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Internal Messaging checks passed.");
