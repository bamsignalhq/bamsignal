import type { KnowledgeCategoryCardViewModel } from "../../../types/institutionalKnowledgeBase";

type KnowledgeCategoryCardProps = {
  category: KnowledgeCategoryCardViewModel;
};

export function KnowledgeCategoryCard({ category }: KnowledgeCategoryCardProps) {
  return (
    <article className="ikb-category-card institute-glass">
      <header className="ikb-category-card__head">
        <h3>{category.title}</h3>
        <span className="ikb-category-card__badge">{category.categoryLabel}</span>
      </header>
      <p className="ikb-category-card__order">Category {category.categoryOrder}</p>
      <p className="ikb-category-card__description">{category.description}</p>
      <p className="ikb-category-card__meta">
        {category.articleCount} article{category.articleCount === 1 ? "" : "s"} prepared
      </p>
      <p className="ikb-category-card__status">{category.statusLabel}</p>
    </article>
  );
}
