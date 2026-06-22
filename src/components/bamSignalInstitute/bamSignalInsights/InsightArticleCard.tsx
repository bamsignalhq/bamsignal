import {
  CONVERSATIONS_LABEL,
  INSIGHTS_LABEL,
  PERSPECTIVES_LABEL
} from "../../../constants/bamSignalInsights";
import type { InsightArticleViewModel } from "../../../utils/bamSignalInsightsLogic";

type InsightArticleCardProps = {
  article: InsightArticleViewModel;
};

export function InsightArticleCard({ article }: InsightArticleCardProps) {
  return (
    <article className="bsi-article-card institute-glass">
      <header className="bsi-article-card__head">
        <h3>{article.title}</h3>
        <span className="bsi-article-card__badge">{INSIGHTS_LABEL}</span>
      </header>

      <p className="bsi-article-card__labels">
        {PERSPECTIVES_LABEL} · {CONVERSATIONS_LABEL}
      </p>
      <p className="bsi-article-card__category">{article.categoryLabel}</p>
      <p className="bsi-article-card__summary">{article.summary}</p>
      <p className="bsi-article-card__status">{article.statusLabel}</p>
    </article>
  );
}
