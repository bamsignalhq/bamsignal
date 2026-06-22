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

const constantsSource = readFileSync(join(rootPath, "src/constants/internalMessaging.ts"), "utf8");
assert(constantsSource.includes("Internal Messaging™"), "messaging brand");
assert(constantsSource.includes("announcements"), "announcements channel");
assert(constantsSource.includes("handoff"), "handoff message type");
assert(constantsSource.includes("INTERNAL_MESSAGING_RULES"), "messaging rules documented");
assert(constantsSource.includes("No member chat"), "no member chat rule");
assert(constantsSource.includes("INTERNAL_MESSAGING_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Push notifications"), "push notifications future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("messages"), "hard routes include messages tab");

const engineSource = readFileSync(join(rootPath, "src/utils/internalMessagingEngine.ts"), "utf8");
assert(engineSource.includes("buildInternalMessagingBundle"), "messaging engine exists");

const logicSource = readFileSync(join(rootPath, "src/utils/internalMessagingLogic.ts"), "utf8");
assert(logicSource.includes("countUnread"), "unread count logic");
assert(logicSource.includes("buildChannelSummaries"), "channel summaries");

const seedSource = readFileSync(join(rootPath, "src/data/internalMessagingSeed.ts"), "utf8");
assert(seedSource.includes("acknowledged"), "seed includes acknowledgement");
assert(seedSource.includes("escalation"), "seed includes escalation");

const adminComponents = [
  "MessageChannelCard.tsx",
  "AnnouncementCard.tsx",
  "EscalationCard.tsx",
  "HandoffCard.tsx",
  "MessageTimelineCard.tsx",
  "UnreadBadge.tsx",
  "InternalMessagingPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/messages", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("InternalMessagingPage"), "admin hub mounts internal messaging");

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
