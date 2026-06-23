import { MESSAGE_CHANNEL_LABELS } from "../../../constants/internalMessaging";
import type { MessageChannelId } from "../../../constants/internalMessaging";
import { UnreadBadge } from "./UnreadBadge";

type ChannelCardProps = {
  channelId: MessageChannelId;
  hint: string;
  messageCount: number;
  unreadCount: number;
  active?: boolean;
  onSelect?: () => void;
};

export function ChannelCard({
  channelId,
  hint,
  messageCount,
  unreadCount,
  active = false,
  onSelect
}: ChannelCardProps) {
  return (
    <button
      type="button"
      className={`channel-card message-channel-card${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <div className="channel-card__head message-channel-card__head">
        <p className="channel-card__eyebrow message-channel-card__eyebrow">Channel</p>
        {unreadCount > 0 ? <UnreadBadge count={unreadCount} /> : null}
      </div>
      <h3>{MESSAGE_CHANNEL_LABELS[channelId]}</h3>
      <p>{hint}</p>
      <span>{messageCount} messages</span>
    </button>
  );
}
