import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_STATUS_LABELS } from "../../../constants/documentCenter";
import type { KnowledgeArticleRecord } from "../../../types/documentCenter";

type KnowledgeBaseCardProps = {
  articles: KnowledgeArticleRecord[];
};

export function KnowledgeBaseCard({ articles }: KnowledgeBaseCardProps) {
  return (
    <section className="document-card knowledge-base-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Knowledge base</h3>
        <p>Searchable articles with markdown, attachments, and version history.</p>
      </header>
      <ul className="knowledge-base-card__list">
        {articles.map((article) => (
          <li key={article.id} className="knowledge-base-card__item">
            <div>
              <strong>{article.title}</strong>
              <span>{DOCUMENT_CATEGORY_LABELS[article.categoryId]}</span>
            </div>
            <div className="knowledge-base-card__meta">
              <span className={`document-status document-status--${article.status}`}>
                {DOCUMENT_STATUS_LABELS[article.status]}
              </span>
              <span>v{article.currentVersion}</span>
              {article.attachments.length ? (
                <span>{article.attachments.length} attachment(s)</span>
              ) : null}
            </div>
            <pre className="knowledge-base-card__preview">{article.bodyMarkdown.slice(0, 180)}…</pre>
            {article.tags.length ? (
              <div className="document-tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="document-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
