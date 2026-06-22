import type { AcademyTimelineEntry } from "../../../types/consultantAcademy";

type AcademyTimelineCardProps = {
  timeline: AcademyTimelineEntry[];
};

export function AcademyTimelineCard({ timeline }: AcademyTimelineCardProps) {
  return (
    <section className="academy-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="academy-timeline-card__head">
        <h3>Academy timeline</h3>
        <p>Certification milestones and training events.</p>
      </header>

      {timeline.length ? (
        <ol className="academy-timeline-card__list">
          {[...timeline].reverse().map((entry) => (
            <li key={entry.id}>
              <div className="academy-timeline-card__row">
                <strong>{entry.label}</strong>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="academy-timeline-card__empty">No timeline entries yet.</p>
      )}
    </section>
  );
}
