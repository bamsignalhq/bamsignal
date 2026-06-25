import {
  CONFIGURATION_CATEGORIES,
  CONFIGURATION_CATEGORY_LABELS
} from "../../../constants/configurationPlatform";
import type { ConfigurationCategoryId } from "../../../constants/configurationPlatform";

type CategoryExplorerCardProps = {
  categoryCounts: Record<ConfigurationCategoryId, number>;
  activeCategoryId: ConfigurationCategoryId | "all";
  onSelectCategory: (categoryId: ConfigurationCategoryId) => void;
};

export function CategoryExplorerCard({
  categoryCounts,
  activeCategoryId,
  onSelectCategory
}: CategoryExplorerCardProps) {
  return (
    <section className="config-card category-explorer-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Categories</h3>
        <p>Institution, payments, operations, security, governance, and more.</p>
      </header>
      <ul className="category-explorer-card__grid">
        {CONFIGURATION_CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={`category-explorer-card__btn${
                activeCategoryId === category.id ? " is-active" : ""
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <span>{CONFIGURATION_CATEGORY_LABELS[category.id]}</span>
              <strong>{categoryCounts[category.id] ?? 0}</strong>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
