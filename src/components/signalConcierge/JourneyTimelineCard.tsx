import { MEMBER_JOURNEY_ID_LABEL } from "../../constants/memberDashboard";
import type { MemberTimelineEntry } from "../../types/memberDashboard";

type JourneyTimelineCardProps = {
  timeline: MemberTimelineEntry[];
  journeyId?: string;
};

export function JourneyTimelineCard({ timeline, journeyId }: JourneyTimelineCardProps) {
  return (
    <section className="member-dashboard-card journey-timeline-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Journey timeline</h3>
        <p>
          Application, consultations, approvals, introductions, milestones, and archive events.
          {journeyId ? ` ${MEMBER_JOURNEY_ID_LABEL}: ${journeyId}` : ""}
        </p>
      </header>
      {timeline.length === 0 ? (
        <p className="journey-timeline-card__empty">Your journey timeline will appear here.</p>
      ) : (
        <ol className="journey-timeline-card__list">
          {timeline.map((entry) => (
            <li key={entry.id}>
              <span className="journey-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.detail ? <span>{entry.detail}</span> : null}
                {entry.journeyId ? <em>{entry.journeyId}</em> : null}
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
