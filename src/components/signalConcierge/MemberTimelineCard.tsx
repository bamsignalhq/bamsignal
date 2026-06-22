import type { MemberTimelineEntry } from "../../types/memberDashboard";

type MemberTimelineCardProps = {
  timeline: MemberTimelineEntry[];
};

export function MemberTimelineCard({ timeline }: MemberTimelineCardProps) {
  return (
    <section className="member-dashboard-card member-timeline-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Journey timeline</h3>
        <p>Your private story — append-only, never deleted.</p>
      </header>
      {timeline.length === 0 ? (
        <p className="member-timeline-card__empty">Your journey timeline will appear here.</p>
      ) : (
        <ol className="member-timeline-card__list">
          {timeline.map((entry) => (
            <li key={entry.id}>
              <span className="member-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.detail ? <span>{entry.detail}</span> : null}
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
