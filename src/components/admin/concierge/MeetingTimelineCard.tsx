import { MEETING_NOTE_TYPE_LABELS } from "../../../constants/meetingNotes";
import type { MeetingTimelineEntry } from "../../../types/meetingNotes";

type MeetingTimelineCardProps = {
  timeline: MeetingTimelineEntry[];
};

export function MeetingTimelineCard({ timeline }: MeetingTimelineCardProps) {
  return (
    <section className="meeting-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Meeting timeline</h3>
        <p>Append-only journey memory — no deletion, no shrinking.</p>
      </header>
      {timeline.length === 0 ? (
        <p className="meeting-timeline__empty">No meetings recorded yet.</p>
      ) : (
        <ol className="meeting-timeline__list">
          {timeline.map((entry) => (
            <li key={entry.id} className="meeting-timeline__item">
              <span className="meeting-timeline__dot" aria-hidden />
              <div>
                <div className="meeting-timeline__row">
                  <strong>{MEETING_NOTE_TYPE_LABELS[entry.type]}</strong>
                  <time dateTime={entry.heldAt}>{new Date(entry.heldAt).toLocaleString()}</time>
                </div>
                <span className="meeting-timeline__title">{entry.title}</span>
                <span className="meeting-timeline__preview">{entry.preview}</span>
                <span className="meeting-timeline__steward">Steward: {entry.consultantName}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
