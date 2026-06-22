import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_ID_LABEL
} from "../../../constants/notificationEvents";
import type { NotificationEvent } from "../../../types/notificationEvents";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationCardProps = {
  notification: NotificationEvent;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <article className="notification-card concierge-consultant-card--glass cc-reveal">
      <header className="notification-card__head">
        <div>
          <span className="notification-card__event">
            {NOTIFICATION_EVENT_LABELS[notification.eventType]}
          </span>
          <h4>{notification.subject}</h4>
        </div>
        <NotificationStatusBadge status={notification.status} />
      </header>
      <p className="notification-card__preview">{notification.preview}</p>
      <dl className="notification-card__meta">
        <div>
          <dt>{NOTIFICATION_ID_LABEL}</dt>
          <dd className="notification-card__id">{notification.notificationId}</dd>
        </div>
        <div>
          <dt>Channel</dt>
          <dd>{NOTIFICATION_CHANNEL_LABELS[notification.channel]}</dd>
        </div>
        <div>
          <dt>Queued</dt>
          <dd>
            <time dateTime={notification.queuedAt}>
              {new Date(notification.queuedAt).toLocaleString()}
            </time>
          </dd>
        </div>
      </dl>
    </article>
  );
}
