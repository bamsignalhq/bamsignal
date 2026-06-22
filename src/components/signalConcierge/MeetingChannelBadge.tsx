import { MEETING_LINK_CHANNEL_LABELS } from "../../constants/meetingLink";
import type { MeetingLinkChannel } from "../../types/meetingLink";

type MeetingChannelBadgeProps = {
  channel: MeetingLinkChannel;
};

export function MeetingChannelBadge({ channel }: MeetingChannelBadgeProps) {
  return (
    <span className={`meeting-channel-badge meeting-channel-badge--${channel}`}>
      {MEETING_LINK_CHANNEL_LABELS[channel]}
    </span>
  );
}
