import {
  BAMSIGNAL_HONORS_FORBIDDEN_COPY,
  HONOR_CATEGORY_LABEL
} from "../../../constants/bamSignalHonors";
import type { HonorCategoryViewModel } from "../../../utils/bamSignalHonorsLogic";

type HonorCategoryCardProps = {
  category: HonorCategoryViewModel;
};

export function HonorCategoryCard({ category }: HonorCategoryCardProps) {
  return (
    <article className="bshn-category-card institute-glass">
      <header className="bshn-category-card__head">
        <h3>{category.title}</h3>
        <span className="bshn-category-card__badge">{HONOR_CATEGORY_LABEL}</span>
      </header>
      <p className="bshn-category-card__description">{category.description}</p>
      <p className="bshn-category-card__forbidden">
        Not {BAMSIGNAL_HONORS_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bshn-category-card__status">{category.statusLabel}</p>
    </article>
  );
}
