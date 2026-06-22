import {
  MEETING_NOTE_ID_LABEL,
  MEETING_NOTE_TYPE_LABELS
} from "../../../constants/meetingNotes";
import type { MeetingNote } from "../../../types/meetingNotes";

type MeetingNoteCardProps = {
  note: MeetingNote;
};

export function MeetingNoteCard({ note }: MeetingNoteCardProps) {
  return (
    <article className="meeting-note-card concierge-consultant-card--glass cc-reveal">
      <header className="meeting-note-card__head">
        <div>
          <span className="meeting-note-card__type">{MEETING_NOTE_TYPE_LABELS[note.type]}</span>
          <h4>{note.title}</h4>
        </div>
        <span className="meeting-note-card__visibility">Consultant-admin only</span>
      </header>
      <p className="meeting-note-card__narrative">{note.narrative}</p>
      <dl className="meeting-note-card__meta">
        <div>
          <dt>{MEETING_NOTE_ID_LABEL}</dt>
          <dd className="meeting-note-card__id">{note.noteId}</dd>
        </div>
        <div>
          <dt>Steward</dt>
          <dd>{note.consultantName}</dd>
        </div>
        <div>
          <dt>Held</dt>
          <dd>
            <time dateTime={note.heldAt}>{new Date(note.heldAt).toLocaleString()}</time>
          </dd>
        </div>
        {note.durationMinutes ? (
          <div>
            <dt>Duration</dt>
            <dd>{note.durationMinutes} minutes</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
