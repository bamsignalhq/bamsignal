import { NOTIFICATION_STATUS_LABELS } from "../../../constants/notificationEvents";
import type { NotificationDeliveryStatus } from "../../../types/notificationEvents";

type NotificationStatusBadgeProps = {
  status: NotificationDeliveryStatus;
};

export function NotificationStatusBadge({ status }: NotificationStatusBadgeProps) {
  return (
    <span className={`notification-status-badge notification-status-badge--${status}`}>
      {NOTIFICATION_STATUS_LABELS[status]}
    </span>
  );
}
