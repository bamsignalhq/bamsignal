import { COLLABORATIONS_LABEL } from "../../../constants/researchPartnerships";
import type { PartnerCategoryDefinition } from "../../../constants/researchPartnerships";

type PartnerCategoryCardProps = {
  category: PartnerCategoryDefinition;
};

export function PartnerCategoryCard({ category }: PartnerCategoryCardProps) {
  return (
    <article className="rp-category-card institute-glass">
      <header className="rp-category-card__head">
        <h3>{category.label}</h3>
        <span className="rp-category-card__badge">{COLLABORATIONS_LABEL}</span>
      </header>
      <p className="rp-category-card__description">{category.description}</p>
    </article>
  );
}
