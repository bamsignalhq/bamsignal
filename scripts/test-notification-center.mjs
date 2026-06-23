#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countByDeliveryStatus,
  mapChannelToQueue,
  mapOpsStatusToDeliveryStatus
} from "../server/services/notificationReliabilityEngine.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/notificationReliabilityAdmin.ts"), "utf8");
assert(adminSource.includes('NOTIFICATION_RELIABILITY_ADMIN_PATH = "/hard/notifications"'), "notifications admin route");

const constantsSource = readFileSync(join(rootPath, "src/constants/notificationReliability.ts"), "utf8");
assert(constantsSource.includes("Notification Reliability Center™"), "notification reliability brand");
assert(constantsSource.includes("email-queue"), "email queue defined");
assert(constantsSource.includes("whatsapp-queue"), "whatsapp queue defined");
assert(constantsSource.includes("system-queue"), "system queue defined");
assert(constantsSource.includes("abandoned"), "abandoned status");
assert(constantsSource.includes("opened"), "opened status");
assert(constantsSource.includes("NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES"), "future capabilities documented");
assert(constantsSource.includes("push-notifications"), "push notifications documented");

const typesSource = readFileSync(join(rootPath, "src/types/notificationReliability.ts"), "utf8");
assert(typesSource.includes("ReliabilityNotificationRecord"), "reliability notification record type");
assert(typesSource.includes("NotificationReliabilityBundle"), "reliability bundle type");

const logicSource = readFileSync(join(rootPath, "src/utils/notificationReliabilityLogic.ts"), "utf8");
assert(logicSource.includes("mapOpsRecordToReliability"), "maps ops records");
assert(logicSource.includes("buildNotificationReliabilityMetrics"), "reliability metrics");
assert(logicSource.includes("average-delivery-time"), "average delivery time metric");

const engineSource = readFileSync(join(rootPath, "src/utils/notificationReliabilityEngine.ts"), "utf8");
assert(engineSource.includes("buildNotificationReliabilityBundle"), "reliability bundle builder");
assert(engineSource.includes("retryReliabilityNotification"), "retry path");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("NOTIFICATION_RELIABILITY_ADMIN_PATH"), "hard routes include notifications path");
assert(hardRoutesSource.includes('"notifications"'), "notifications tab slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/notifications"), "notifications route permission mapped");

const adminComponents = [
  "NotificationQueuePage.tsx",
  "NotificationCard.tsx",
  "DeliveryStatusBadge.tsx",
  "FailedDeliveryCard.tsx",
  "RetryQueueCard.tsx",
  "NotificationMetricsCard.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/notificationReliability", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("NotificationQueuePage"), "admin hub mounts notification queue page");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:notification-center"), "package.json defines test:notification-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("notification-reliability.css"), "notification reliability styles imported");

assert(mapOpsStatusToDeliveryStatus("sent") === "sending", "sent maps to sending");
assert(mapOpsStatusToDeliveryStatus("read") === "opened", "read maps to opened");
assert(mapOpsStatusToDeliveryStatus("cancelled") === "abandoned", "cancelled maps to abandoned");
assert(mapChannelToQueue("email") === "email-queue", "email channel maps to queue");

const counts = countByDeliveryStatus([
  { status: "delivered" },
  { status: "delivered" },
  { status: "failed" }
]);
assert(counts.delivered === 2 && counts.failed === 1, "delivery status counts");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Notification Reliability Center checks passed.");
