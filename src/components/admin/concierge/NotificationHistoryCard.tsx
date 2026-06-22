import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_EVENT_LABELS
} from "../../../constants/notificationEvents";
import type { NotificationHistoryEntry } from "../../../types/notificationEvents";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationHistoryCardProps = {
  history: NotificationHistoryEntry[];
};

export function NotificationHistoryCard({ history }: NotificationHistoryCardProps) {
  return (
    <section className="notification-history concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Notification history</h3>
        <p>Append-only — permanent journey communication records.</p>
      </header>
      {history.length === 0 ? (
        <p className="notification-history__empty">No notifications recorded yet.</p>
      ) : (
        <ol className="notification-history__list">
          {history.map((entry) => (
            <li key={entry.id} className="notification-history__item">
              <div className="notification-history__row">
                <strong>{NOTIFICATION_EVENT_LABELS[entry.eventType]}</strong>
                <NotificationStatusBadge status={entry.status} />
              </div>
              <span className="notification-history__subject">{entry.subject}</span>
              <span className="notification-history__preview">{entry.preview}</span>
              <div className="notification-history__footer">
                <span>{NOTIFICATION_CHANNEL_LABELS[entry.channel]}</span>
                <time dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
