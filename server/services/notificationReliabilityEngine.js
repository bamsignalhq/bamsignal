/**
 * Enterprise Notification Center™ — status mapping (server-side tests).
 */

const OPS_STATUS_TO_DELIVERY = {
  queued: "queued",
  sent: "sending",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  retried: "retried",
  cancelled: "cancelled"
};

const CHANNEL_TO_QUEUE = {
  email: "email-queue",
  whatsapp: "whatsapp-queue",
  system: "push-queue",
  push: "push-queue",
  "in-app": "push-queue"
};

export function mapOpsStatusToDeliveryStatus(status) {
  return OPS_STATUS_TO_DELIVERY[status] ?? "queued";
}

export function mapChannelToQueue(channel) {
  return CHANNEL_TO_QUEUE[channel] ?? "email-queue";
}

export function countByDeliveryStatus(records) {
  return records.reduce((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  }, {});
}

export function notificationCenterRouteRegistered(permissionsSource) {
  return permissionsSource.includes("/hard/notifications");
}

export function buildNotificationCenterSummaryLine(summary) {
  return `sent=${summary.sentToday} failed=${summary.failed} delivery=${summary.deliveryRate}%`;
}

export const NOTIFICATION_CENTER_DB_TABLES = [
  "notification_messages",
  "notification_templates",
  "notification_audit_log",
  "notification_dead_letter"
];

export function getNotificationCenterDatabaseTableManifest() {
  return NOTIFICATION_CENTER_DB_TABLES.map((tableName) => ({ tableName, domain: "notifications" }));
}
