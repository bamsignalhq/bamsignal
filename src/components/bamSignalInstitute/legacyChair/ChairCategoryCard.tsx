import { CHAIR_CATEGORY_LABEL } from "../../../constants/legacyChair";
import type { ChairCategoryViewModel } from "../../../utils/legacyChairLogic";

type ChairCategoryCardProps = {
  category: ChairCategoryViewModel;
};

export function ChairCategoryCard({ category }: ChairCategoryCardProps) {
  return (
    <article className="lgch-category-card institute-glass">
      <header className="lgch-category-card__head">
        <h3>{category.title}</h3>
        <span className="lgch-category-card__badge">{CHAIR_CATEGORY_LABEL}</span>
      </header>
      <p className="lgch-category-card__description">{category.description}</p>
      <p className="lgch-category-card__status">{category.statusLabel}</p>
    </article>
  );
}
