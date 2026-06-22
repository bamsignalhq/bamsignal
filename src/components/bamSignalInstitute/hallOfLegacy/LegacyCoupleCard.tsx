import {
  CELEBRATING_LOVE_LABEL,
  HALL_OF_LEGACY_LABEL,
  LEGACY_COUPLES_LABEL
} from "../../../constants/hallOfLegacy";
import type { LegacyJourneyViewModel } from "../../../utils/hallOfLegacyLogic";

type LegacyCoupleCardProps = {
  journey: LegacyJourneyViewModel;
};

export function LegacyCoupleCard({ journey }: LegacyCoupleCardProps) {
  return (
    <article className="hol-legacy-card institute-glass">
      <header className="hol-legacy-card__head">
        <h3>{journey.title}</h3>
        <span className="hol-legacy-card__badge">{LEGACY_COUPLES_LABEL}</span>
      </header>

      <p className="hol-legacy-card__labels">
        {HALL_OF_LEGACY_LABEL} · {CELEBRATING_LOVE_LABEL}
      </p>
      <p className="hol-legacy-card__category">{journey.categoryLabel}</p>
      <p className="hol-legacy-card__summary">{journey.summary}</p>
      <p className="hol-legacy-card__privacy">
        {journey.privateLabel} · {journey.consentLabel}
      </p>
      <p className="hol-legacy-card__status">{journey.statusLabel}</p>
    </article>
  );
}
