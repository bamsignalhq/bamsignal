import { SEARCH_ENTITY_LABELS } from "../../../constants/searchCenter";
import type { SearchCenterSummary } from "../../../types/searchCenter";

type SearchSummaryCardProps = {
  summary: SearchCenterSummary;
};

export function SearchSummaryCard({ summary }: SearchSummaryCardProps) {
  return (
    <section className="search-summary-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Search index</h3>
        <p>
          {summary.indexSize.toLocaleString()} indexed records across{" "}
          {Object.values(summary.entityCounts).filter((count) => count > 0).length} entity types.
          Last indexed {new Date(summary.lastIndexedAt).toLocaleString()}.
        </p>
      </header>
      <div className="search-summary-card__grid">
        {Object.entries(summary.entityCounts)
          .filter(([, count]) => count > 0)
          .map(([entity, count]) => (
            <div key={entity} className="search-summary-chip">
              <strong>{count}</strong>
              <span>{SEARCH_ENTITY_LABELS[entity as keyof typeof SEARCH_ENTITY_LABELS]}</span>
            </div>
          ))}
      </div>
    </section>
  );
}
