import {
  GROWING_TOGETHER_LABEL,
  LEGACY_CONTRIBUTION_LABEL,
  LEGACY_PROFESSIONALS_FORBIDDEN_COPY,
  LIFETIME_STEWARD_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/legacyProfessionals";
import type { LegacyContributionViewModel } from "../../../utils/legacyProfessionalsLogic";

type LegacyContributionCardProps = {
  contribution: LegacyContributionViewModel;
};

export function LegacyContributionCard({ contribution }: LegacyContributionCardProps) {
  return (
    <article className="lgpr-contribution-card institute-glass">
      <header className="lgpr-contribution-card__head">
        <h3>{contribution.title}</h3>
        <span className="lgpr-contribution-card__badge">{LEGACY_CONTRIBUTION_LABEL}</span>
      </header>

      <p className="lgpr-contribution-card__labels">
        {LIFETIME_STEWARD_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="lgpr-contribution-card__steward">{contribution.stewardLabel}</p>
      <p className="lgpr-contribution-card__role">{contribution.roleTitle}</p>
      <p className="lgpr-contribution-card__summary">{contribution.summary}</p>
      <p className="lgpr-contribution-card__forbidden">
        Not {LEGACY_PROFESSIONALS_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="lgpr-contribution-card__status">{contribution.statusLabel}</p>
    </article>
  );
}
