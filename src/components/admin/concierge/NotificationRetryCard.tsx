import {
  NOTIFICATION_OPS_CHANNEL_LABELS,
  NOTIFICATION_OPS_EVENT_LABELS
} from "../../../constants/notificationOperations";
import type { NotificationOpsRecord } from "../../../types/notificationOperations";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationRetryCardProps = {
  records: NotificationOpsRecord[];
  onRetry: (record: NotificationOpsRecord) => void;
};

export function NotificationRetryCard({ records, onRetry }: NotificationRetryCardProps) {
  const retryable = records.filter((record) => record.channel === "email" || record.channel === "whatsapp");

  return (
    <section className="notification-retry-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Failed deliveries</h3>
        <p>Retry failed Email and WhatsApp messages from the operational queue.</p>
      </header>
      {retryable.length === 0 ? (
        <p className="concierge-consultant__empty">No failed deliveries requiring retry.</p>
      ) : (
        <ul className="notification-retry-card__list">
          {retryable.slice(0, 12).map((record) => (
            <li key={record.id} className="notification-retry-card__item">
              <div>
                <div className="notification-retry-card__row">
                  <strong>{record.memberName}</strong>
                  <NotificationStatusBadge status={record.status} />
                </div>
                <span>
                  {NOTIFICATION_OPS_CHANNEL_LABELS[record.channel]} ·{" "}
                  {NOTIFICATION_OPS_EVENT_LABELS[record.eventType]}
                </span>
                <span className="notification-retry-card__preview">{record.preview}</span>
                {record.journeyId ? <span>Journey {record.journeyId}</span> : null}
                <time dateTime={record.updatedAt}>{new Date(record.updatedAt).toLocaleString()}</time>
              </div>
              <button type="button" className="concierge-consultant-btn" onClick={() => onRetry(record)}>
                Retry failed
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
