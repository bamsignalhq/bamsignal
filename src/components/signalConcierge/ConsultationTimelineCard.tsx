import type { ConsultationSchedulingTimelineEntry } from "../../types/consultationScheduling";
import { CONSULTATION_SCHEDULING_ENGINE_BRAND } from "../../constants/consultationScheduling";

type ConsultationTimelineCardProps = {
  timeline: ConsultationSchedulingTimelineEntry[] | import("../../types/calendar").CalendarTimelineEntry[];
};

export function ConsultationTimelineCard({ timeline }: ConsultationTimelineCardProps) {
  return (
    <section className="consultation-timeline-card signal-concierge-glass sc-reveal">
      <header className="consultation-timeline-card__head">
        <h3>Scheduling timeline</h3>
        <p>{CONSULTATION_SCHEDULING_ENGINE_BRAND} — append-only consultation history.</p>
      </header>
      {timeline.length ? (
        <ol className="consultation-timeline-card__list">
          {timeline.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.label}</strong>
              {entry.detail ? <span>{entry.detail}</span> : null}
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="consultation-timeline-card__empty">
          Scheduling steps will appear here as your consultation is booked.
        </p>
      )}
    </section>
  );
}
