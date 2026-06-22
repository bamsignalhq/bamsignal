import { MEETING_INFRASTRUCTURE_BRAND } from "../../constants/meetingInfrastructure";
import type { MeetingLinkTimelineEntry } from "../../types/meetingLink";

type MeetingTimelineCardProps = {
  timeline: MeetingLinkTimelineEntry[];
};

export function MeetingTimelineCard({ timeline }: MeetingTimelineCardProps) {
  return (
    <section className="meeting-infrastructure-timeline signal-concierge-glass sc-reveal">
      <header className="meeting-infrastructure-timeline__head">
        <h3>Meeting timeline</h3>
        <p>{MEETING_INFRASTRUCTURE_BRAND} — append-only consultation meeting history.</p>
      </header>
      {timeline.length ? (
        <ol className="meeting-infrastructure-timeline__list">
          {timeline.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.label}</strong>
              {entry.detail ? <span>{entry.detail}</span> : null}
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="meeting-infrastructure-timeline__empty">
          Meeting steps will appear here after your consultation is booked.
        </p>
      )}
    </section>
  );
}
