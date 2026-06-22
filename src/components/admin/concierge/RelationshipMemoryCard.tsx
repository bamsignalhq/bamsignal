import {
  CELEBRATING_PROGRESS_LABEL,
  COUPLE_HAPPINESS_PRIVACY_COPY,
  JOURNEY_MEMORIES_LABEL
} from "../../../constants/coupleHappinessNotes";
import type { CoupleHappinessNoteEntry } from "../../../types/coupleHappinessNotes";

type RelationshipMemoryCardProps = {
  memory: CoupleHappinessNoteEntry | null;
};

export function RelationshipMemoryCard({ memory }: RelationshipMemoryCardProps) {
  return (
    <section className="relationship-memory-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_MEMORIES_LABEL}</h3>
        <p>{CELEBRATING_PROGRESS_LABEL}</p>
      </header>

      <p className="relationship-memory-card__privacy">{COUPLE_HAPPINESS_PRIVACY_COPY}</p>

      {memory ? (
        <blockquote className="relationship-memory-card__quote">
          <p>{memory.body}</p>
          <footer>
            <time dateTime={memory.recordedAt}>{new Date(memory.recordedAt).toLocaleDateString()}</time>
            {memory.recordedBy ? <span> · {memory.recordedBy}</span> : null}
          </footer>
        </blockquote>
      ) : (
        <p className="concierge-consultant__empty">Journey memories will appear here as notes are added.</p>
      )}
    </section>
  );
}
