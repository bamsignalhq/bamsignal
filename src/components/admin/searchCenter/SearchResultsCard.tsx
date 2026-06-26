import type { SearchResultGroup } from "../../../types/searchCenter";
import { HighlightedText } from "./HighlightedText";

type SearchResultsCardProps = {
  groups: SearchResultGroup[];
  onJump: (path: string) => void;
};

export function SearchResultsCard({ groups, onJump }: SearchResultsCardProps) {
  if (!groups.length) {
    return (
      <section className="search-results-card concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Results</h3>
          <p>No matches. Try a broader query or switch entity filter to All.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="search-results-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Results</h3>
        <p>Grouped, highlighted, with preview and direct jump.</p>
      </header>
      <div className="search-results-card__groups">
        {groups.map((group) => (
          <div key={group.entity} className="search-result-group">
            <h4>
              {group.label}{" "}
              <span className="search-result-group__count">({group.results.length})</span>
            </h4>
            <ul className="search-result-group__list">
              {group.results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="search-result-row"
                    onClick={() => onJump(result.jumpPath)}
                  >
                    <div className="search-result-row__head">
                      <strong>
                        <HighlightedText parts={result.highlightedTitle} />
                      </strong>
                      {result.subtitle ? <span>{result.subtitle}</span> : null}
                    </div>
                    <p className="search-result-row__preview">
                      <HighlightedText parts={result.highlightedPreview} />
                    </p>
                    <div className="search-result-row__meta">
                      <span>Score {result.score}</span>
                      <span>{new Date(result.updatedAt).toLocaleString()}</span>
                      <span className="search-result-row__jump">Jump →</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
