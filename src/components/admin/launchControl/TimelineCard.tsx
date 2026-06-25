import type { LaunchTimelineEvent } from "../../../types/launchControlCenter";

type TimelineCardProps = {
  timeline: LaunchTimelineEvent[];
};

export function TimelineCard({ timeline }: TimelineCardProps) {
  const sorted = [...timeline].sort(
    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

  return (
    <section className="launch-control-card timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Launch timeline</h3>
        <p>Readiness milestones, verification drills, approvals, and launch window.</p>
      </header>
      <ul className="launch-control-card__list">
        {sorted.map((event) => (
          <li key={event.id}>
            <div className="launch-control-card__row">
              <strong>{event.title}</strong>
              <span className={`timeline-card__status timeline-card__status--${event.status}`}>
                {event.status}
              </span>
            </div>
            <p>{event.eventRef} · {event.phase}</p>
            <div className="launch-control-card__meta">
              <span>{new Date(event.scheduledAt).toLocaleString()}</span>
              <span>{event.ownerEmail}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
