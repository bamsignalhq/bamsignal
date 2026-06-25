import type { DocumentVersionEntry } from "../../../types/documentCenter";

type VersionHistoryCardProps = {
  versions: DocumentVersionEntry[];
  currentVersion: string;
};

export function VersionHistoryCard({ versions, currentVersion }: VersionHistoryCardProps) {
  return (
    <section className="document-card version-history-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Version history</h3>
        <p>Current version: {currentVersion}</p>
      </header>
      {versions.length ? (
        <ol className="version-history-card__list">
          {[...versions].reverse().map((entry) => (
            <li key={`${entry.version}_${entry.updatedAt}`}>
              <div className="version-history-card__row">
                <strong>v{entry.version}</strong>
                <span>{entry.author}</span>
                <time>{new Date(entry.updatedAt).toLocaleString()}</time>
              </div>
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="document-center-page__empty">No version history recorded.</p>
      )}
    </section>
  );
}
