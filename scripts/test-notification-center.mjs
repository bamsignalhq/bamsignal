#!/usr/bin/env node
/**
 * Enterprise Notification Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildNotificationCenterSummaryLine,
  countByDeliveryStatus,
  getNotificationCenterDatabaseTableManifest,
  mapChannelToQueue,
  mapOpsStatusToDeliveryStatus,
  notificationCenterRouteRegistered,
  NOTIFICATION_CENTER_DB_TABLES
} from "../server/services/notificationReliabilityEngine.js";

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

const adminSource = read("src/constants/notificationReliabilityAdmin.ts");
assert(adminSource.includes('NOTIFICATION_RELIABILITY_ADMIN_PATH = "/hard/notifications"'), "notifications admin route");
assert(adminSource.includes("Enterprise Notification Center™"), "enterprise notification center brand");

const constantsSource = read("src/constants/notificationReliability.ts");
assert(constantsSource.includes("email-queue"), "email queue defined");
assert(constantsSource.includes("whatsapp-queue"), "whatsapp queue defined");
assert(constantsSource.includes("push-queue"), "push queue defined");
assert(constantsSource.includes("scheduled-queue"), "scheduled queue defined");
assert(constantsSource.includes("retry-queue"), "retry queue defined");
assert(constantsSource.includes("dead-letter-queue"), "dead letter queue defined");
assert(constantsSource.includes("read"), "read status");
assert(constantsSource.includes("cancelled"), "cancelled status");
assert(constantsSource.includes("NOTIFICATION_CENTER_TOOLS"), "notification tools");
assert(constantsSource.includes("otp"), "otp template");
assert(constantsSource.includes("relationship"), "relationship template");
assert(constantsSource.includes("NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES"), "future capabilities documented");
assert(constantsSource.includes("telegram"), "telegram documented");
assert(constantsSource.includes("NOTIFICATION_CENTER_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("notification_messages"), "messages table");

const typesSource = read("src/types/notificationReliability.ts");
assert(typesSource.includes("EnterpriseNotificationRecord"), "enterprise notification record type");
assert(typesSource.includes("EnterpriseNotificationCenterBundle"), "enterprise bundle type");
assert(typesSource.includes("NotificationAuditRecord"), "audit record type");
assert(typesSource.includes("NotificationTemplateRecord"), "template record type");

const logicSource = read("src/utils/notificationReliabilityLogic.ts");
assert(logicSource.includes("mapOpsRecordToEnterprise"), "maps ops records");
assert(logicSource.includes("buildNotificationCenterSummary"), "center summary");
assert(logicSource.includes("buildEnterpriseNotificationCenterBundle"), "enterprise bundle builder");
assert(logicSource.includes("delivery-rate"), "delivery rate metric");

const engineSource = read("src/utils/notificationReliabilityEngine.ts");
assert(engineSource.includes("buildNotificationReliabilityBundle"), "reliability bundle builder");
assert(engineSource.includes("buildLiveNotificationCenterBundle"), "live bundle builder");
assert(engineSource.includes("retryReliabilityNotification"), "retry path");
assert(engineSource.includes("cancelReliabilityNotification"), "cancel path");
assert(engineSource.includes("previewReliabilityNotification"), "preview path");

const storeSource = read("src/utils/notificationCenterStore.ts");
assert(storeSource.includes("bamsignal.notificationCenter.v1"), "localStorage key");
assert(storeSource.includes("applyNotificationCenterAction"), "center action store");

const seedSource = read("src/data/notificationCenterSeed.ts");
assert(seedSource.includes("NOTIFICATION_TEMPLATE_SEED"), "template seed");
assert(seedSource.includes("NOTIFICATION_AUDIT_SEED"), "audit seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("NOTIFICATION_RELIABILITY_ADMIN_PATH"), "hard routes include notifications path");
assert(hardRoutesSource.includes('"notifications"'), "notifications tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(notificationCenterRouteRegistered(permissionsSource), "notifications route permission mapped");

const adminComponents = [
  "NotificationQueuePage.tsx",
  "NotificationCard.tsx",
  "DeliveryStatusBadge.tsx",
  "FailedDeliveryCard.tsx",
  "RetryQueueCard.tsx",
  "NotificationCenterSummaryCard.tsx",
  "NotificationChannelsCard.tsx",
  "NotificationQueuesCard.tsx",
  "NotificationTemplatesCard.tsx",
  "NotificationAuditCard.tsx",
  "NotificationToolsPanel.tsx"
];

for (const file of adminComponents) {
  const source = read(`src/components/admin/notificationReliability/${file}`);
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes("NotificationQueuePage"), "admin hub mounts notification center page");

const packageSource = read("package.json");
assert(packageSource.includes("test:notification-center"), "package.json defines test:notification-center");

const mainSource = read("src/main.tsx");
assert(mainSource.includes("notification-reliability.css"), "notification center styles imported");

const migrationSource = read("supabase/migrations/202606261100_notification_center.sql");
assert(migrationSource.includes("notification_audit_log"), "audit log migration");

assert(mapOpsStatusToDeliveryStatus("sent") === "sending", "sent maps to sending");
assert(mapOpsStatusToDeliveryStatus("read") === "read", "read maps to read");
assert(mapOpsStatusToDeliveryStatus("cancelled") === "cancelled", "cancelled maps to cancelled");
assert(mapChannelToQueue("email") === "email-queue", "email channel maps to queue");
assert(mapChannelToQueue("push") === "push-queue", "push channel maps to queue");

const counts = countByDeliveryStatus([
  { status: "delivered" },
  { status: "delivered" },
  { status: "failed" }
]);
assert(counts.delivered === 2 && counts.failed === 1, "delivery status counts");

assert(NOTIFICATION_CENTER_DB_TABLES.length === 4, "four notification tables");
assert(getNotificationCenterDatabaseTableManifest().length === 4, "table manifest");

const summaryLine = buildNotificationCenterSummaryLine({
  sentToday: 42,
  failed: 2,
  deliveryRate: 95
});
assert(summaryLine.includes("sent=42"), "summary line format");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Enterprise Notification Center checks passed.");
