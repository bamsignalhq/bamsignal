import {
  CELEBRATING_LOVE_LABEL,
  HALL_OF_LEGACY_LABEL,
  LEGACY_COUPLES_LABEL
} from "../../../constants/hallOfLegacy";
import type { LegacyJourneyViewModel } from "../../../utils/hallOfLegacyLogic";

type FoundersCoupleCardProps = {
  journey: LegacyJourneyViewModel;
};

export function FoundersCoupleCard({ journey }: FoundersCoupleCardProps) {
  return (
    <article className="hol-founders-card institute-glass">
      <header className="hol-founders-card__head">
        <h3>{journey.title}</h3>
        <span className="hol-founders-card__badge">{LEGACY_COUPLES_LABEL}</span>
      </header>

      <p className="hol-founders-card__labels">
        {HALL_OF_LEGACY_LABEL} · {CELEBRATING_LOVE_LABEL}
      </p>
      <p className="hol-founders-card__category">{journey.categoryLabel}</p>
      <p className="hol-founders-card__summary">{journey.summary}</p>
      <p className="hol-founders-card__privacy">
        {journey.privateLabel} · {journey.consentLabel}
      </p>
      <p className="hol-founders-card__status">{journey.statusLabel}</p>
    </article>
  );
}
