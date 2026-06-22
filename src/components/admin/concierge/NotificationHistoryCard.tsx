import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_EVENT_LABELS
} from "../../../constants/notificationEvents";
import {
  NOTIFICATION_OPS_CHANNEL_LABELS,
  NOTIFICATION_OPS_EVENT_LABELS
} from "../../../constants/notificationOperations";
import type { NotificationHistoryEntry } from "../../../types/notificationEvents";
import type { NotificationOpsRecord } from "../../../types/notificationOperations";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationHistoryCardProps =
  | {
      history: NotificationHistoryEntry[];
      operationsHistory?: never;
    }
  | {
      history?: never;
      operationsHistory: NotificationOpsRecord[];
    };

export function NotificationHistoryCard(props: NotificationHistoryCardProps) {
  if (props.operationsHistory) {
    const history = props.operationsHistory;

    return (
      <section className="notification-history-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>Notification history</h3>
          <p>Append-only delivery records across Email, WhatsApp, and System channels.</p>
        </header>
        {history.length === 0 ? (
          <p className="concierge-consultant__empty">No notification history yet.</p>
        ) : (
          <ol className="notification-history-card__list">
            {history.slice(0, 20).map((record) => (
              <li key={record.id}>
                <div className="notification-history-card__row">
                  <strong>{NOTIFICATION_OPS_EVENT_LABELS[record.eventType]}</strong>
                  <NotificationStatusBadge status={record.status} />
                </div>
                <span>{record.memberName}</span>
                <span>
                  {NOTIFICATION_OPS_CHANNEL_LABELS[record.channel]}
                  {record.journeyId ? ` · ${record.journeyId}` : ""}
                </span>
                <span className="notification-history-card__preview">{record.preview}</span>
                <time dateTime={record.updatedAt}>{new Date(record.updatedAt).toLocaleString()}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    );
  }

  const history = props.history;

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
                <NotificationStatusBadge status={entry.status as import("../../../types/notificationOperations").NotificationOpsStatus} />
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
