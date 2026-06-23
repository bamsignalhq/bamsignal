import { NOTIFICATION_QUEUE_LABELS } from "../../../constants/notificationReliability";
import type { ReliabilityNotificationRecord } from "../../../types/notificationReliability";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";

type NotificationCardProps = {
  record: ReliabilityNotificationRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function NotificationCard({ record, selected = false, onSelect }: NotificationCardProps) {
  const content = (
    <>
      <div className="notification-card__head">
        <div>
          <p className="notification-card__queue">{NOTIFICATION_QUEUE_LABELS[record.queue]}</p>
          <h3>{record.recipientName}</h3>
        </div>
        <DeliveryStatusBadge status={record.status} />
      </div>
      <p className="notification-card__preview">{record.preview}</p>
      <dl className="notification-card__grid">
        <div>
          <dt>Template</dt>
          <dd>{record.templateLabel}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(record.updatedAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Retries</dt>
          <dd>{record.retryCount}</dd>
        </div>
        <div>
          <dt>Delivery time</dt>
          <dd>{record.deliveryTimeMs ? `${record.deliveryTimeMs} ms` : "—"}</dd>
        </div>
      </dl>
      {record.journeyId ? <p className="notification-card__meta">Journey: {record.journeyId}</p> : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`notification-card notification-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="notification-card">{content}</article>;
}
