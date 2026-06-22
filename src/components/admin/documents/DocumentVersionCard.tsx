import type { DocumentVersionEntry } from "../../../types/documentCenter";

type DocumentVersionCardProps = {
  versions: DocumentVersionEntry[];
  currentVersion: string;
};

export function DocumentVersionCard({ versions, currentVersion }: DocumentVersionCardProps) {
  return (
    <section className="document-version-card concierge-consultant-card--glass cc-reveal">
      <header className="document-version-card__head">
        <h3>Version history</h3>
        <p>Current: v{currentVersion}</p>
      </header>

      {versions.length ? (
        <ol className="document-version-card__list">
          {[...versions].reverse().map((entry) => (
            <li key={`${entry.version}-${entry.updatedAt}`}>
              <strong>v{entry.version}</strong>
              <span>{entry.author}</span>
              <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="document-version-card__empty">No version history recorded.</p>
      )}
    </section>
  );
}
