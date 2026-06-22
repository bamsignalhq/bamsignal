import {
  NOTIFICATION_OPS_CHANNEL_LABELS,
  NOTIFICATION_OPS_EVENT_LABELS
} from "../../../constants/notificationOperations";
import type { NotificationOpsRecord } from "../../../types/notificationOperations";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationQueueCardProps = {
  records: NotificationOpsRecord[];
  selectedId?: string | null;
  onSelect?: (record: NotificationOpsRecord) => void;
};

export function NotificationQueueCard({ records, selectedId, onSelect }: NotificationQueueCardProps) {
  return (
    <section className="notification-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Operational queue</h3>
        <p>Queued, sent, and retried messages awaiting delivery confirmation.</p>
      </header>
      {records.length === 0 ? (
        <p className="concierge-consultant__empty">Delivery queue is clear.</p>
      ) : (
        <ul className="notification-queue-card__list">
          {records.slice(0, 16).map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`notification-queue-card__item${selectedId === record.id ? " is-selected" : ""}`}
                onClick={() => onSelect?.(record)}
              >
                <div className="notification-queue-card__row">
                  <strong>{record.memberName}</strong>
                  <NotificationStatusBadge status={record.status} />
                </div>
                <span>
                  {NOTIFICATION_OPS_CHANNEL_LABELS[record.channel]} ·{" "}
                  {NOTIFICATION_OPS_EVENT_LABELS[record.eventType]}
                </span>
                <span className="notification-queue-card__preview">{record.preview}</span>
                <time dateTime={record.updatedAt}>{new Date(record.updatedAt).toLocaleString()}</time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
