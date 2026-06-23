import {
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_PRIORITY_LABELS,
  MESSAGE_TYPE_LABELS
} from "../../../constants/internalMessaging";
import type { InternalMessageRecord } from "../../../types/internalMessaging";

type MessageThreadCardProps = {
  message: InternalMessageRecord;
};

export function MessageThreadCard({ message }: MessageThreadCardProps) {
  return (
    <section className="message-thread-card concierge-consultant-card--glass cc-reveal" aria-label="Message thread">
      <header className="message-thread-card__head">
        <h3>Message thread</h3>
        <p>{message.messageRef}</p>
      </header>

      <dl className="message-thread-card__grid">
        <div>
          <dt>Channel</dt>
          <dd>{MESSAGE_CHANNEL_LABELS[message.channelId]}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{MESSAGE_TYPE_LABELS[message.typeId]}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>
            <span className={`message-thread-card__priority message-thread-card__priority--${message.priority}`}>
              {MESSAGE_PRIORITY_LABELS[message.priority]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Department route</dt>
          <dd>{message.departmentRoute}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{message.author}</dd>
        </div>
        {message.recipient ? (
          <div>
            <dt>Recipient</dt>
            <dd>{message.recipient}</dd>
          </div>
        ) : null}
        <div>
          <dt>Sent</dt>
          <dd>{new Date(message.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Read receipt</dt>
          <dd>
            {message.read && message.readBy
              ? `Read by ${message.readBy} at ${new Date(message.readAt ?? "").toLocaleString()}`
              : "Unread"}
          </dd>
        </div>
        <div>
          <dt>Acknowledgement</dt>
          <dd>
            {message.acknowledged
              ? `Acknowledged by ${message.acknowledgedBy} at ${new Date(message.acknowledgedAt ?? "").toLocaleString()}`
              : "Pending"}
          </dd>
        </div>
      </dl>

      <div className="message-thread-card__body">
        <h4>{message.subject}</h4>
        <p>{message.body}</p>
      </div>
    </section>
  );
}
