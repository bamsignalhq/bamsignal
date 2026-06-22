import { MEETING_LINK_CHANNEL_LABELS } from "../../constants/meetingLink";
import { meetingAccessLabel } from "../../utils/meetingLinkLogic";
import type { MeetingLinkRecord } from "../../types/meetingLink";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import { MeetingChannelBadge } from "./MeetingChannelBadge";

type MeetingLinkCardProps = {
  record: MeetingLinkRecord;
};

export function MeetingLinkCard({ record }: MeetingLinkCardProps) {
  return (
    <section className="meeting-link-card signal-concierge-glass sc-reveal">
      <header className="meeting-link-card__head">
        <h3>Meeting link</h3>
        <MeetingChannelBadge channel={record.channel} />
      </header>
      <dl className="meeting-link-card__meta">
        <div>
          <dt>Meeting ID</dt>
          <dd>{record.meetingId}</dd>
        </div>
        <div>
          <dt>Channel</dt>
          <dd>{MEETING_LINK_CHANNEL_LABELS[record.channel]}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <MeetingStatusBadge status={record.status} />
          </dd>
        </div>
      </dl>
      <p className="meeting-link-card__access">{meetingAccessLabel(record.channel, record.access)}</p>
    </section>
  );
}
