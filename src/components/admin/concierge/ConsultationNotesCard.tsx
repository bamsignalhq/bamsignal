import { CONSULTATION_NOTES_SECTIONS } from "../../../constants/consultationReview";
import type { ConsultationNotesSections } from "../../../types/consultationReview";

type ConsultationNotesCardProps = {
  notes: ConsultationNotesSections;
};

export function ConsultationNotesCard({ notes }: ConsultationNotesCardProps) {
  const filled = CONSULTATION_NOTES_SECTIONS.filter((section) => notes[section.id]?.trim());

  return (
    <section className="consultation-notes-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation notes</h3>
        <p>Structured sections for goals, values, compatibility, and steward observations.</p>
      </header>
      {filled.length === 0 ? (
        <p className="concierge-consultant__empty">No structured consultation notes recorded yet.</p>
      ) : (
        <dl className="consultation-notes-card__grid">
          {filled.map((section) => (
            <div key={section.id}>
              <dt>{section.label}</dt>
              <dd>{notes[section.id]}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
