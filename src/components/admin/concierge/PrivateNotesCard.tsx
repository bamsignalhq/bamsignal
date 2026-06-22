import { useState } from "react";
import { CONCIERGE_PRIVATE_NOTES_TITLE } from "../../../constants/conciergeConsultant";
import type { ConciergePrivateNote } from "../../../types/conciergeConsultant";

const NOTE_EXAMPLES = [
  "Family-oriented",
  "Prefers relocation",
  "Strong communicator",
  "Avoid smokers",
  "Needs follow-up"
];

type PrivateNotesCardProps = {
  notes: ConciergePrivateNote[];
  onAddNote?: (body: string) => Promise<void>;
};

export function PrivateNotesCard({ notes, onAddNote }: PrivateNotesCardProps) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!draft.trim() || !onAddNote) return;
    setSaving(true);
    try {
      await onAddNote(draft.trim());
      setDraft("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_PRIVATE_NOTES_TITLE}</h3>
        <p>Visible only to consultants.</p>
      </header>
      <div className="concierge-private-notes__examples" aria-label="Note examples">
        {NOTE_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="concierge-private-notes__chip"
            onClick={() => setDraft((current) => (current ? `${current}\n${example}` : example))}
          >
            {example}
          </button>
        ))}
      </div>
      {onAddNote ? (
        <div className="concierge-consultant-note-form">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a private note for your consultant team…"
            rows={3}
          />
          <button
            type="button"
            className="concierge-consultant-btn"
            disabled={!draft.trim() || saving}
            onClick={() => void handleAdd()}
          >
            Add note
          </button>
        </div>
      ) : null}
      <ul className="concierge-consultant-notes">
        {notes.length ? (
          notes.map((note) => (
            <li key={note.id}>
              <p>{note.body}</p>
              <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString()}</time>
            </li>
          ))
        ) : (
          <li className="concierge-consultant__empty">No private notes yet.</li>
        )}
      </ul>
    </section>
  );
}
