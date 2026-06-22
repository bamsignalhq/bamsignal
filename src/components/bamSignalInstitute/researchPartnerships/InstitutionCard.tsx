import {
  COLLABORATIONS_LABEL,
  INSTITUTIONAL_RELATIONSHIPS_LABEL,
  RESEARCH_PARTNERSHIPS_LABEL
} from "../../../constants/researchPartnerships";
import type { InstitutionViewModel } from "../../../utils/researchPartnershipsLogic";

type InstitutionCardProps = {
  institution: InstitutionViewModel;
};

export function InstitutionCard({ institution }: InstitutionCardProps) {
  return (
    <article className="rp-institution-card institute-glass">
      <header className="rp-institution-card__head">
        <h3>{institution.name}</h3>
        <span className="rp-institution-card__badge">{RESEARCH_PARTNERSHIPS_LABEL}</span>
      </header>

      <p className="rp-institution-card__labels">
        {INSTITUTIONAL_RELATIONSHIPS_LABEL} · {COLLABORATIONS_LABEL}
      </p>
      <p className="rp-institution-card__category">{institution.categoryLabel}</p>
      <p className="rp-institution-card__description">{institution.description}</p>
      <p className="rp-institution-card__status">{institution.statusLabel}</p>
    </article>
  );
}
