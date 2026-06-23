/**
 * Notification Reliability Engine™ — status mapping (server-side tests).
 */

const OPS_STATUS_TO_DELIVERY = {
  queued: "queued",
  sent: "sending",
  delivered: "delivered",
  read: "opened",
  failed: "failed",
  retried: "retried",
  cancelled: "abandoned"
};

const CHANNEL_TO_QUEUE = {
  email: "email-queue",
  whatsapp: "whatsapp-queue",
  system: "system-queue"
};

export function mapOpsStatusToDeliveryStatus(status) {
  return OPS_STATUS_TO_DELIVERY[status] ?? "queued";
}

export function mapChannelToQueue(channel) {
  return CHANNEL_TO_QUEUE[channel] ?? "system-queue";
}

export function countByDeliveryStatus(records) {
  return records.reduce((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  }, {});
}
