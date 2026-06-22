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

const constantsSource = readFileSync(join(rootPath, "src/constants/notificationOperations.ts"), "utf8");
assert(constantsSource.includes("Notification Operations Center™"), "notification operations brand");
assert(constantsSource.includes("Queued"), "status labels");
assert(constantsSource.includes("Retried"), "retried status");
assert(constantsSource.includes("Payment received"), "event labels");
assert(constantsSource.includes("Journey update"), "journey update event");

const typesSource = readFileSync(join(rootPath, "src/types/notificationOperations.ts"), "utf8");
assert(typesSource.includes("NotificationOpsChannel"), "channel types");
assert(typesSource.includes('"system"'), "system channel");
assert(typesSource.includes("successRate"), "delivery metrics");
assert(typesSource.includes("retryRate"), "retry rate metric");

const logicSource = readFileSync(join(rootPath, "src/utils/notificationOperationsLogic.ts"), "utf8");
assert(logicSource.includes("emailRecordToOpsRecord"), "maps email records");
assert(logicSource.includes("whatsappRecordToOpsRecord"), "maps whatsapp records");
assert(logicSource.includes("paymentToOpsRecord"), "maps payment events");
assert(logicSource.includes("buildNotificationDeliveryMetrics"), "computes metrics");
assert(logicSource.includes("filterNotificationOpsRecords"), "filter and search support");

const engineSource = readFileSync(join(rootPath, "src/utils/notificationOperationsEngine.ts"), "utf8");
assert(engineSource.includes("buildNotificationOperationsBundle"), "ops bundle builder");
assert(engineSource.includes("retryNotificationOpsRecord"), "retry failed deliveries");
assert(engineSource.includes("listAllConciergeNotificationEvents"), "aggregates system notifications");

const operationsEngineSource = readFileSync(join(rootPath, "src/utils/OperationsCenterEngine.ts"), "utf8");
assert(operationsEngineSource.includes("buildNotificationOperationsBundle"), "operations center delegates to ops engine");
assert(operationsEngineSource.includes("retryNotificationOpsRecord"), "operations center retry path");

const componentFiles = [
  "NotificationQueueCard.tsx",
  "NotificationStatusBadge.tsx",
  "NotificationHistoryCard.tsx",
  "NotificationRetryCard.tsx",
  "DeliveryMetricsCard.tsx",
  "OperationsNotificationCard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const operationsCardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/OperationsNotificationCard.tsx"),
  "utf8"
);
assert(operationsCardSource.includes("DeliveryMetricsCard"), "operations tab shows metrics");
assert(operationsCardSource.includes("Search Journey ID"), "journey id search");

const retryCardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/NotificationRetryCard.tsx"),
  "utf8"
);
assert(retryCardSource.includes("Retry failed"), "retry action");

const operationsCenterPageSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/OperationsCenterPage.tsx"),
  "utf8"
);
assert(operationsCenterPageSource.includes('activeSection === "notifications"'), "notifications tab in operations center");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:notification-operations"), "package.json defines test:notification-operations");

if (failed) process.exit(1);
console.log("notification operations tests ok");
