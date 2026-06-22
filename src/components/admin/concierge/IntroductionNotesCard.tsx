import { MATCH_NOTE_EXAMPLES } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { updateIntroductionMatchNotes } from "../../../utils/IntroductionEngine";

type IntroductionNotesCardProps = {
  record: IntroductionRecord;
  onUpdated: () => void;
};

export function IntroductionNotesCard({ record, onUpdated }: IntroductionNotesCardProps) {
  const handleAdd = (note: string) => {
    if (record.matchNotes.includes(note)) return;
    updateIntroductionMatchNotes(record.id, [...record.matchNotes, note]);
    onUpdated();
  };

  return (
    <section className="introduction-notes concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Match notes</h3>
        <p>Private — consultants only.</p>
      </header>
      <div className="concierge-private-notes__examples">
        {MATCH_NOTE_EXAMPLES.map((note) => (
          <button
            key={note}
            type="button"
            className="concierge-private-notes__chip"
            onClick={() => handleAdd(note)}
          >
            {note}
          </button>
        ))}
      </div>
      {record.matchNotes.length ? (
        <ul className="introduction-notes__list">
          {record.matchNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No match notes yet.</p>
      )}
    </section>
  );
}
