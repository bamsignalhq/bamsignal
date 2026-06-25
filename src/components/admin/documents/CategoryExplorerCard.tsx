import type { DocumentCategoryId } from "../../../constants/documentCenter";
import { DOCUMENT_CATEGORY_LABELS } from "../../../constants/documentCenter";

type CategoryExplorerCardProps = {
  categoryCounts: Record<DocumentCategoryId, number>;
  activeCategoryId: DocumentCategoryId | "all";
  onSelectCategory: (categoryId: DocumentCategoryId) => void;
};

export function CategoryExplorerCard({
  categoryCounts,
  activeCategoryId,
  onSelectCategory
}: CategoryExplorerCardProps) {
  return (
    <section className="document-card category-explorer-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Categories</h3>
        <p>Browse policies, procedures, guides, manuals, templates, and frameworks.</p>
      </header>
      <div className="category-explorer-card__grid">
        {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategoryId[]).map((categoryId) => (
          <button
            key={categoryId}
            type="button"
            className={`category-explorer-card__chip${activeCategoryId === categoryId ? " is-active" : ""}`}
            onClick={() => onSelectCategory(categoryId)}
          >
            <span>{DOCUMENT_CATEGORY_LABELS[categoryId]}</span>
            <strong>{categoryCounts[categoryId] ?? 0}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
