import { MESSAGE_CHANNEL_LABELS, MESSAGE_PRIORITY_LABELS } from "../../../constants/internalMessaging";
import type { InternalMessageRecord } from "../../../types/internalMessaging";

type HandoffCardProps = {
  messages: InternalMessageRecord[];
};

export function HandoffCard({ messages }: HandoffCardProps) {
  const handoffs = messages.filter((message) => message.typeId === "handoff");

  return (
    <section className="handoff-card concierge-consultant-card--glass cc-reveal">
      <header className="handoff-card__head">
        <h3>Handoffs</h3>
        <p>Operational handoffs between consultants and operations.</p>
      </header>

      {handoffs.length ? (
        <ul className="handoff-card__list">
          {handoffs.map((message) => (
            <li key={message.id}>
              <strong>{message.subject}</strong>
              <span>{MESSAGE_CHANNEL_LABELS[message.channelId]}</span>
              <span>{MESSAGE_PRIORITY_LABELS[message.priority]}</span>
              {message.recipient ? <span>To: {message.recipient}</span> : null}
              <p>{message.body}</p>
              {message.acknowledged ? (
                <span className="handoff-card__acked">
                  Acknowledged {new Date(message.acknowledgedAt ?? "").toLocaleString()}
                </span>
              ) : (
                <span className="handoff-card__pending">Awaiting acknowledgement</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="handoff-card__empty">No handoffs in current view.</p>
      )}
    </section>
  );
}
