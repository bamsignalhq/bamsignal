import type { KnowledgeArticleCardViewModel } from "../../../types/institutionalKnowledgeBase";

type KnowledgeArticleCardProps = {
  article: KnowledgeArticleCardViewModel;
};

export function KnowledgeArticleCard({ article }: KnowledgeArticleCardProps) {
  return (
    <article className="ikb-article-card institute-glass">
      <header className="ikb-article-card__head">
        <div>
          <h3>{article.title}</h3>
          <span className="ikb-article-card__category">{article.categoryTitle}</span>
        </div>
        <span className="ikb-article-card__badge">{article.articleLabel}</span>
      </header>
      <p className="ikb-article-card__summary">{article.summary}</p>
      <p className="ikb-article-card__status">{article.statusLabel}</p>
    </article>
  );
}
