import { CONCIERGE_JOURNEY_HISTORY_TITLE } from "../../../constants/conciergeMemberOwnership";
import { CONCIERGE_TIMELINE_EVENT_LABELS } from "../../../constants/conciergeConsultant";
import type { ConciergeConsultantActivity } from "../../../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { MemberJourneyTimeline } from "./MemberJourneyTimeline";

type JourneyHistoryCardProps = {
  member: ConciergeMemberRecord;
  activity?: ConciergeConsultantActivity[];
};

export function JourneyHistoryCard({ member, activity = [] }: JourneyHistoryCardProps) {
  const relationshipEvents = member.timeline.filter((event) =>
    ["relationship-update", "feedback-received", "success-story", "introduction"].includes(event.type)
  );

  return (
    <section className="journey-history-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_JOURNEY_HISTORY_TITLE}</h3>
        <p>Full member journey — preserved across steward transitions.</p>
      </header>
      <MemberJourneyTimeline events={member.timeline} />
      {relationshipEvents.length ? (
        <div className="journey-history-card__highlights">
          <h4>Relationship updates</h4>
          <ul>
            {relationshipEvents.map((event) => (
              <li key={event.id}>
                <strong>{CONCIERGE_TIMELINE_EVENT_LABELS[event.type] ?? event.label}</strong>
                {event.detail ? <span>{event.detail}</span> : null}
                <time dateTime={event.at}>{new Date(event.at).toLocaleDateString()}</time>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {activity.length ? (
        <div className="journey-history-card__audit">
          <h4>Logged activity</h4>
          <ul>
            {activity.slice(0, 8).map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
                {item.changes ? <em>{item.changes}</em> : null}
                <time dateTime={item.at}>{new Date(item.at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
