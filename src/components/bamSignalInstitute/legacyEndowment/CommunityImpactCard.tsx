import {
  COMMUNITY_IMPACT_LABEL,
  GIVING_BACK_LABEL,
  LEGACY_ENDOWMENT_FORBIDDEN_COPY,
  STRENGTHENING_FAMILIES_LABEL
} from "../../../constants/legacyEndowment";
import type { CommunityImpactViewModel } from "../../../utils/legacyEndowmentLogic";

type CommunityImpactCardProps = {
  impact: CommunityImpactViewModel;
};

export function CommunityImpactCard({ impact }: CommunityImpactCardProps) {
  return (
    <article className="lgnd-impact-card institute-glass">
      <header className="lgnd-impact-card__head">
        <h3>{impact.title}</h3>
        <span className="lgnd-impact-card__badge">{COMMUNITY_IMPACT_LABEL}</span>
      </header>
      <p className="lgnd-impact-card__labels">
        {GIVING_BACK_LABEL} · {STRENGTHENING_FAMILIES_LABEL}
      </p>
      <p className="lgnd-impact-card__program">{impact.programTitle}</p>
      <p className="lgnd-impact-card__description">{impact.description}</p>
      <p className="lgnd-impact-card__forbidden">
        Not {LEGACY_ENDOWMENT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lgnd-impact-card__status">{impact.statusLabel}</p>
    </article>
  );
}
