import { DOCUMENT_CATEGORY_LABELS } from "../../../constants/documentCenter";
import type { DocumentMetric, DocumentRecord } from "../../../types/documentCenter";

type KnowledgeOverviewCardProps = {
  metrics: DocumentMetric[];
  recentUpdates: DocumentRecord[];
  mostViewed: DocumentRecord[];
};

export function KnowledgeOverviewCard({ metrics, recentUpdates, mostViewed }: KnowledgeOverviewCardProps) {
  return (
    <section className="knowledge-overview-card concierge-consultant-card--glass cc-reveal" aria-label="Knowledge overview">
      <header className="knowledge-overview-card__head">
        <h3>Knowledge overview</h3>
        <p>Institutional knowledge management — policies, SOPs, guides, and procedures in one home.</p>
      </header>

      <div className="knowledge-overview-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="knowledge-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="knowledge-overview-card__columns">
        <div>
          <h4>Recent updates</h4>
          {recentUpdates.length ? (
            <ul>
              {recentUpdates.slice(0, 4).map((document) => (
                <li key={document.id}>
                  <strong>{document.title}</strong>
                  <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="knowledge-overview-card__empty">No recent updates.</p>
          )}
        </div>

        <div>
          <h4>Most viewed</h4>
          {mostViewed.length ? (
            <ul>
              {mostViewed.map((document) => (
                <li key={document.id}>
                  <strong>{document.title}</strong>
                  <span>
                    {DOCUMENT_CATEGORY_LABELS[document.categoryId]} · {document.viewCount} views
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="knowledge-overview-card__empty">No view data yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
