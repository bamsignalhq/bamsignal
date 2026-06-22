import {
  FAITH_CATEGORY_LABEL,
  FAITH_NETWORK_DIVERSITY_COPY,
  FAITH_NETWORK_RESPECT_COPY
} from "../../../constants/faithNetwork";
import type { FaithCategoryViewModel } from "../../../utils/faithNetworkLogic";

type FaithCategoryCardProps = {
  category: FaithCategoryViewModel;
};

export function FaithCategoryCard({ category }: FaithCategoryCardProps) {
  return (
    <article className="fnw-category-card institute-glass">
      <header className="fnw-category-card__head">
        <h3>{category.title}</h3>
        <span className="fnw-category-card__badge">{FAITH_CATEGORY_LABEL}</span>
      </header>

      <p className="fnw-category-card__labels">
        {FAITH_NETWORK_DIVERSITY_COPY} · {FAITH_NETWORK_RESPECT_COPY}
      </p>
      <p className="fnw-category-card__description">{category.description}</p>
      <p className="fnw-category-card__status">{category.statusLabel}</p>
    </article>
  );
}
