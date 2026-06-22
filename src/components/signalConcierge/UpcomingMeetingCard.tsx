import type { UpcomingMeetingSummary } from "../../types/memberDashboard";

type UpcomingMeetingCardProps = {
  meeting?: UpcomingMeetingSummary;
};

export function UpcomingMeetingCard({ meeting }: UpcomingMeetingCardProps) {
  return (
    <section className="member-dashboard-card upcoming-meeting-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Upcoming consultation</h3>
        <p>Private — details shared only with you.</p>
      </header>
      {meeting ? (
        <>
          <p className="upcoming-meeting-card__label">{meeting.label}</p>
          <p className="upcoming-meeting-card__time">
            <time dateTime={meeting.scheduledAt}>
              {new Date(meeting.scheduledAt).toLocaleString()}
            </time>
          </p>
          <p className="upcoming-meeting-card__channel">{meeting.channelLabel}</p>
          <p className="upcoming-meeting-card__detail">{meeting.detail}</p>
        </>
      ) : (
        <p className="upcoming-meeting-card__empty">
          No upcoming consultation scheduled. Your steward will reach out privately when ready.
        </p>
      )}
    </section>
  );
}
