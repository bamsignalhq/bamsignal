import {
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_PRIORITY_LABELS,
  MESSAGE_TYPE_LABELS
} from "../../../constants/internalMessaging";
import type { InternalMessageRecord } from "../../../types/internalMessaging";

type MessageTimelineCardProps = {
  message: InternalMessageRecord;
};

export function MessageTimelineCard({ message }: MessageTimelineCardProps) {
  return (
    <section className="message-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="message-timeline-card__head">
        <h3>Message detail</h3>
        <p>{message.messageRef}</p>
      </header>

      <dl className="message-timeline-card__grid">
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
          <dd>{MESSAGE_PRIORITY_LABELS[message.priority]}</dd>
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
          <dt>Read status</dt>
          <dd>{message.read ? "Read" : "Unread"}</dd>
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

      <div className="message-timeline-card__body">
        <h4>{message.subject}</h4>
        <p>{message.body}</p>
      </div>
    </section>
  );
}
