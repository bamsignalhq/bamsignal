import {
  GROWING_TOGETHER_LABEL,
  LEGACY_ADVISOR_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/lifePartners";
import type { LegacyAdvisorViewModel } from "../../../utils/lifePartnersLogic";

type LegacyAdvisorCardProps = {
  advisor: LegacyAdvisorViewModel;
};

export function LegacyAdvisorCard({ advisor }: LegacyAdvisorCardProps) {
  return (
    <article className="lpr-advisor-card institute-glass">
      <header className="lpr-advisor-card__head">
        <h3>{advisor.name}</h3>
        <span className="lpr-advisor-card__badge">{LEGACY_ADVISOR_LABEL}</span>
      </header>

      <p className="lpr-advisor-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="lpr-advisor-card__specialty">{advisor.specialtyTitle}</p>
      <p className="lpr-advisor-card__title">{advisor.title}</p>
      <p className="lpr-advisor-card__focus">{advisor.focus}</p>
      <p className="lpr-advisor-card__status">{advisor.statusLabel}</p>
    </article>
  );
}
