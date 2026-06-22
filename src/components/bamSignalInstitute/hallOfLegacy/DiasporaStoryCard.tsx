import {
  CELEBRATING_LOVE_LABEL,
  HALL_OF_LEGACY_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/hallOfLegacy";
import type { LegacyJourneyViewModel } from "../../../utils/hallOfLegacyLogic";

type DiasporaStoryCardProps = {
  journey: LegacyJourneyViewModel;
};

export function DiasporaStoryCard({ journey }: DiasporaStoryCardProps) {
  return (
    <article className="hol-diaspora-card institute-glass">
      <header className="hol-diaspora-card__head">
        <h3>{journey.title}</h3>
        <span className="hol-diaspora-card__badge">{CELEBRATING_LOVE_LABEL}</span>
      </header>

      <p className="hol-diaspora-card__labels">
        {HALL_OF_LEGACY_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
      </p>
      <p className="hol-diaspora-card__category">{journey.categoryLabel}</p>
      <p className="hol-diaspora-card__summary">{journey.summary}</p>
      <p className="hol-diaspora-card__privacy">
        {journey.privateLabel} · {journey.consentLabel}
      </p>
      <p className="hol-diaspora-card__status">{journey.statusLabel}</p>
    </article>
  );
}
