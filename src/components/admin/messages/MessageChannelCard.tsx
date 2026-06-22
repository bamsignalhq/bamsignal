import { MESSAGE_CHANNEL_LABELS } from "../../../constants/internalMessaging";
import type { MessageChannelId } from "../../../constants/internalMessaging";
import { UnreadBadge } from "./UnreadBadge";

type MessageChannelCardProps = {
  channelId: MessageChannelId;
  hint: string;
  messageCount: number;
  unreadCount: number;
  active?: boolean;
  onSelect?: () => void;
};

export function MessageChannelCard({
  channelId,
  hint,
  messageCount,
  unreadCount,
  active = false,
  onSelect
}: MessageChannelCardProps) {
  return (
    <button
      type="button"
      className={`message-channel-card${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <div className="message-channel-card__head">
        <p className="message-channel-card__eyebrow">Channel</p>
        {unreadCount > 0 ? <UnreadBadge count={unreadCount} /> : null}
      </div>
      <h3>{MESSAGE_CHANNEL_LABELS[channelId]}</h3>
      <p>{hint}</p>
      <span>{messageCount} messages</span>
    </button>
  );
}
