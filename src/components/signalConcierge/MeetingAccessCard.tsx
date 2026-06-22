import { meetingAccessLabel } from "../../utils/meetingLinkLogic";
import type { MeetingLinkRecord } from "../../types/meetingLink";
import { MeetingChannelBadge } from "./MeetingChannelBadge";

type MeetingAccessCardProps = {
  record: MeetingLinkRecord;
};

export function MeetingAccessCard({ record }: MeetingAccessCardProps) {
  const label = meetingAccessLabel(record.channel, record.access);

  return (
    <section className="meeting-access-card signal-concierge-glass sc-reveal">
      <header className="meeting-access-card__head">
        <h3>How to join</h3>
        <MeetingChannelBadge channel={record.channel} />
      </header>
      <p className="meeting-access-card__detail">{label}</p>
      {record.access.joinUrl ? (
        <a
          className="signal-concierge-btn signal-concierge-btn--primary"
          href={record.access.joinUrl}
          target="_blank"
          rel="noreferrer"
        >
          Join consultation
        </a>
      ) : null}
      {record.access.password ? (
        <p className="meeting-access-card__password">Passcode: {record.access.password}</p>
      ) : null}
      <p className="meeting-access-card__note">
        Access details were shared privately with you and your steward.
      </p>
    </section>
  );
}
