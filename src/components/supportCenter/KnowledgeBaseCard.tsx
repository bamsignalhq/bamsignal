import { SUPPORT_TICKET_CATEGORY_LABELS } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import type { KnowledgeBaseArticle } from "../../types/supportCenter";

type KnowledgeBaseCardProps = {
  article: KnowledgeBaseArticle;
};

export function KnowledgeBaseCard({ article }: KnowledgeBaseCardProps) {
  const open = () => {
    if (article.href) {
      navigateToPath(article.href);
      return;
    }
    navigateToPath(`/help/${article.slug}`);
  };

  return (
    <article className="support-kb-card cc-reveal">
      <p className="support-kb-card__category">{SUPPORT_TICKET_CATEGORY_LABELS[article.categoryId]}</p>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <button type="button" className="support-center-btn support-center-btn--ghost" onClick={open}>
        Read article
      </button>
    </article>
  );
}
