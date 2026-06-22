import {
  CELEBRATING_LOVE_LABEL,
  HALL_OF_LEGACY_LABEL
} from "../../../constants/hallOfLegacy";
import type { LegacyJourneyViewModel } from "../../../utils/hallOfLegacyLogic";

type GoldenAnniversaryCardProps = {
  journey: LegacyJourneyViewModel;
};

export function GoldenAnniversaryCard({ journey }: GoldenAnniversaryCardProps) {
  return (
    <article className="hol-golden-card institute-glass">
      <header className="hol-golden-card__head">
        <h3>{journey.title}</h3>
        <span className="hol-golden-card__badge">{CELEBRATING_LOVE_LABEL}</span>
      </header>

      <p className="hol-golden-card__labels">{HALL_OF_LEGACY_LABEL}</p>
      <p className="hol-golden-card__category">{journey.categoryLabel}</p>
      <p className="hol-golden-card__summary">{journey.summary}</p>
      <p className="hol-golden-card__privacy">
        {journey.privateLabel} · {journey.consentLabel}
      </p>
      <p className="hol-golden-card__status">{journey.statusLabel}</p>
    </article>
  );
}
