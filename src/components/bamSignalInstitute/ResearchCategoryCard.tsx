import { INSIGHTS_LABEL, RESEARCH_LABEL } from "../../constants/bamSignalInstitute";
import type { ResearchAreaViewModel } from "../../utils/bamSignalInstituteLogic";

type ResearchCategoryCardProps = {
  area: ResearchAreaViewModel;
};

export function ResearchCategoryCard({ area }: ResearchCategoryCardProps) {
  return (
    <article className="bi-category-card institute-glass">
      <header className="bi-category-card__head">
        <h3>{area.title}</h3>
        <span className="bi-category-card__badge">{RESEARCH_LABEL}</span>
      </header>

      <p className="bi-category-card__labels">{INSIGHTS_LABEL} · Understanding Relationships</p>
      <p className="bi-category-card__description">{area.description}</p>
      <p className="bi-category-card__status">{area.statusLabel}</p>
    </article>
  );
}
