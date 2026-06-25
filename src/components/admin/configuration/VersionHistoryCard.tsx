import type { ConfigurationVersionRecord } from "../../../types/configurationPlatform";

type VersionHistoryCardProps = {
  versions: ConfigurationVersionRecord[];
};

export function VersionHistoryCard({ versions }: VersionHistoryCardProps) {
  const sorted = [...versions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <section className="config-card version-history-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Version history</h3>
        <p>Every configuration change is versioned with rollback support.</p>
      </header>
      {sorted.length ? (
        <ol className="version-history-card__list">
          {sorted.map((version) => (
            <li key={version.id}>
              <div className="version-history-card__row">
                <strong>v{version.versionNumber}</strong>
                <span>{new Date(version.createdAt).toLocaleString()}</span>
              </div>
              <p>{JSON.stringify(version.value)}</p>
              {version.changeReason ? <p className="version-history-card__reason">{version.changeReason}</p> : null}
              <span className="version-history-card__actor">{version.changedBy}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="config-card__empty">No version history recorded yet.</p>
      )}
    </section>
  );
}
