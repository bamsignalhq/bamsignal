import {
  LEGACY_PROFESSIONALS_LABEL,
  PROFESSIONAL_JOURNEY_LABEL
} from "../../../constants/legacyProfessionals";
import type { ProfessionalJourneyViewModel } from "../../../utils/legacyProfessionalsLogic";

type ProfessionalJourneyCardProps = {
  journey: ProfessionalJourneyViewModel;
};

export function ProfessionalJourneyCard({ journey }: ProfessionalJourneyCardProps) {
  const sorted = [...journey.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="lgpr-journey-card institute-glass">
      <header className="lgpr-journey-card__head">
        <h3>{LEGACY_PROFESSIONALS_LABEL}</h3>
        <p>{journey.title}</p>
      </header>

      <p className="lgpr-journey-card__summary">{journey.summary}</p>
      <p className="lgpr-journey-card__label">{PROFESSIONAL_JOURNEY_LABEL}</p>
      <p className="lgpr-journey-card__role">{journey.roleTitle}</p>

      {sorted.length ? (
        <ol className="lgpr-journey-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="lgpr-journey-card__item">
              <span className="lgpr-journey-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="lgpr-journey-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lgpr-journey-card__empty">
          {PROFESSIONAL_JOURNEY_LABEL} timelines will appear as legacy professionals join the ecosystem.
        </p>
      )}

      <p className="lgpr-journey-card__status">{journey.statusLabel}</p>
    </section>
  );
}
