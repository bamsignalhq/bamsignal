import type { PolicyVersionRecord } from "../../../types/dataGovernanceCenter";

type PolicyVersionsCardProps = {
  versions: PolicyVersionRecord[];
};

export function PolicyVersionsCard({ versions }: PolicyVersionsCardProps) {
  const sorted = [...versions].sort((left, right) => right.version - left.version);

  return (
    <section className="data-governance-card policy-versions-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Policy versions</h3>
        <p>Published privacy policy and terms versions with approval trail.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((version) => (
            <li key={version.id}>
              <div className="data-governance-card__row">
                <strong>
                  {version.name} v{version.version}
                </strong>
                <span className={`policy-versions-card__status${version.active ? " is-active" : ""}`}>
                  {version.active ? "Active" : "Superseded"}
                </span>
              </div>
              <div className="data-governance-card__meta">
                <span>{version.policyRef}</span>
                <span>{version.publishedBy}</span>
                <span>{new Date(version.publishedAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No policy versions published.</p>
      )}
    </section>
  );
}
