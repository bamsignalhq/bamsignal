import type { CalendarTimelineEntry } from "../../types/calendar";

type CalendarTimelineCardProps = {
  timeline: CalendarTimelineEntry[];
};

export function CalendarTimelineCard({ timeline }: CalendarTimelineCardProps) {
  return (
    <section className="calendar-timeline-card signal-concierge-glass sc-reveal">
      <header className="calendar-timeline-card__head">
        <h3>Scheduling timeline</h3>
        <p>Append-only — permanent consultation scheduling history.</p>
      </header>
      {timeline.length ? (
        <ol className="calendar-timeline-card__list">
          {timeline.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.label}</strong>
              {entry.detail ? <span>{entry.detail}</span> : null}
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="calendar-timeline-card__empty">Scheduling steps will appear here as your consultation is booked.</p>
      )}
    </section>
  );
}
