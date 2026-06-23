import {
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_PRIORITY_LABELS,
  MESSAGE_TYPE_LABELS
} from "../../../constants/internalMessaging";
import type { InternalMessageRecord } from "../../../types/internalMessaging";

type AnnouncementCardProps = {
  message: InternalMessageRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function AnnouncementCard({ message, selected = false, onSelect }: AnnouncementCardProps) {
  const content = (
    <>
      <div className="announcement-card__head">
        <p className="announcement-card__ref">{message.messageRef}</p>
        <span className={`announcement-card__priority announcement-card__priority--${message.priority}`}>
          {MESSAGE_PRIORITY_LABELS[message.priority]}
        </span>
      </div>
      <h3>{message.subject}</h3>
      <p>{message.body}</p>
      <dl className="announcement-card__meta">
        <div>
          <dt>Channel</dt>
          <dd>{MESSAGE_CHANNEL_LABELS[message.channelId]}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{MESSAGE_TYPE_LABELS[message.typeId]}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{message.departmentRoute}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{message.author}</dd>
        </div>
        <div>
          <dt>Read</dt>
          <dd>{message.read ? "Read" : "Unread"}</dd>
        </div>
      </dl>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`announcement-card announcement-card--button${selected ? " is-selected" : ""}${
          !message.read ? " is-unread" : ""
        }`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="announcement-card">{content}</article>;
}
