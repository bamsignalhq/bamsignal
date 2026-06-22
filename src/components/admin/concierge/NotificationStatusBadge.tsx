import { NOTIFICATION_STATUS_LABELS } from "../../../constants/notificationEvents";
import {
  NOTIFICATION_OPS_CHANNEL_LABELS,
  NOTIFICATION_OPS_EVENT_LABELS,
  NOTIFICATION_OPS_STATUS_LABELS
} from "../../../constants/notificationOperations";
import type { NotificationDeliveryStatus } from "../../../types/notificationEvents";
import type { NotificationOpsRecord, NotificationOpsStatus } from "../../../types/notificationOperations";

type NotificationStatusBadgeProps = {
  status: NotificationOpsStatus | NotificationDeliveryStatus;
};

function statusLabel(status: NotificationOpsStatus | NotificationDeliveryStatus): string {
  if (status in NOTIFICATION_OPS_STATUS_LABELS) {
    return NOTIFICATION_OPS_STATUS_LABELS[status as NotificationOpsStatus];
  }
  return NOTIFICATION_STATUS_LABELS[status as NotificationDeliveryStatus];
}

export function NotificationStatusBadge({ status }: NotificationStatusBadgeProps) {
  return (
    <span className={`notification-status-badge notification-status-badge--${status}`}>
      {statusLabel(status)}
    </span>
  );
}

export function notificationOpsChannelLabel(record: NotificationOpsRecord): string {
  return NOTIFICATION_OPS_CHANNEL_LABELS[record.channel];
}

export function notificationOpsEventLabel(record: NotificationOpsRecord): string {
  return NOTIFICATION_OPS_EVENT_LABELS[record.eventType];
}
