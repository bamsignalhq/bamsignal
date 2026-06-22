import type { CoupleHappinessNoteEntry } from "../../../types/coupleHappinessNotes";
import { coupleHappinessNoteSourceLabel } from "../../../constants/coupleHappinessNotes";

type HappinessTimelineProps = {
  notes: CoupleHappinessNoteEntry[];
};

export function HappinessTimeline({ notes }: HappinessTimelineProps) {
  if (!notes.length) {
    return (
      <p className="concierge-consultant__empty couple-happiness-timeline__empty">
        No relationship notes recorded yet.
      </p>
    );
  }

  return (
    <ol className="couple-happiness-timeline">
      {notes.map((note) => (
        <li key={note.id} className="couple-happiness-timeline__item">
          <div className="couple-happiness-timeline__head">
            <span className="couple-happiness-timeline__source">
              {coupleHappinessNoteSourceLabel(note.source)}
            </span>
            <time dateTime={note.recordedAt}>{new Date(note.recordedAt).toLocaleString()}</time>
          </div>
          <p className="couple-happiness-timeline__body">{note.body}</p>
          {note.recordedBy ? (
            <span className="couple-happiness-timeline__by">{note.recordedBy}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
