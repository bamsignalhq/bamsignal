import { MESSAGE_CHANNEL_LABELS, MESSAGE_PRIORITY_LABELS } from "../../../constants/internalMessaging";
import type { InternalMessageRecord } from "../../../types/internalMessaging";

type EscalationCardProps = {
  messages: InternalMessageRecord[];
};

export function EscalationCard({ messages }: EscalationCardProps) {
  const escalations = messages.filter(
    (message) => message.typeId === "escalation" || message.typeId === "alert"
  );

  return (
    <section className="escalation-card concierge-consultant-card--glass cc-reveal">
      <header className="escalation-card__head">
        <h3>Escalations & alerts</h3>
        <p>{escalations.length} urgent operational messages.</p>
      </header>

      {escalations.length ? (
        <ul className="escalation-card__list">
          {escalations.map((message) => (
            <li key={message.id} className={!message.read ? "is-unread" : ""}>
              <strong>{message.subject}</strong>
              <span className={`escalation-card__priority escalation-card__priority--${message.priority}`}>
                {MESSAGE_PRIORITY_LABELS[message.priority]}
              </span>
              <span>{MESSAGE_CHANNEL_LABELS[message.channelId]}</span>
              <p>{message.body}</p>
              {!message.acknowledged ? (
                <span className="escalation-card__pending">Acknowledgement pending</span>
              ) : (
                <span className="escalation-card__acked">
                  Acknowledged by {message.acknowledgedBy}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="escalation-card__empty">No escalations in current view.</p>
      )}
    </section>
  );
}
