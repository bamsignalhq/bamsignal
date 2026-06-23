import { DELIVERY_STATUS_LABELS, type DeliveryStatusId } from "../../../constants/notificationReliability";

type DeliveryStatusBadgeProps = {
  status: DeliveryStatusId;
};

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`delivery-status-badge delivery-status-badge--${status}`}>
      {DELIVERY_STATUS_LABELS[status]}
    </span>
  );
}
