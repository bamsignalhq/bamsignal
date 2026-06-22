import { INSIGHTS_LABEL } from "../../../constants/relationshipLab";
import type { LabCategoryDefinition } from "../../../constants/relationshipLab";

type LabCategoryCardProps = {
  category: LabCategoryDefinition;
};

export function LabCategoryCard({ category }: LabCategoryCardProps) {
  return (
    <article className="rl-category-card institute-glass">
      <header className="rl-category-card__head">
        <h3>{category.label}</h3>
        <span className="rl-category-card__badge">{INSIGHTS_LABEL}</span>
      </header>
      <p className="rl-category-card__description">{category.description}</p>
    </article>
  );
}
