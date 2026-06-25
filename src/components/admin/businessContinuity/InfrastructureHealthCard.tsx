import { CONTINUITY_HEALTH_STATUS_LABELS } from "../../../constants/businessContinuity";
import type { SystemHealthSnapshotRecord } from "../../../types/businessContinuity";
import { formatProviderLabel } from "../../../utils/businessContinuityLogic";

type InfrastructureHealthCardProps = {
  snapshot?: SystemHealthSnapshotRecord;
};

export function InfrastructureHealthCard({ snapshot }: InfrastructureHealthCardProps) {
  if (!snapshot) {
    return (
      <section className="continuity-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>Infrastructure health</h3>
          <p>No health snapshot available.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Infrastructure health</h3>
        <p>
          Latest system health snapshot —{" "}
          <span className={`continuity-pill continuity-pill--${snapshot.overallStatus}`}>
            {CONTINUITY_HEALTH_STATUS_LABELS[snapshot.overallStatus]}
          </span>
        </p>
      </header>
      <div className="continuity-snapshot-grid">
        <div>
          <h4>Services</h4>
          <ul className="continuity-snapshot-services">
            {snapshot.services.map((service) => (
              <li key={service.providerId} className={`continuity-pill continuity-pill--${service.status}`}>
                {formatProviderLabel(service.providerId)} — {CONTINUITY_HEALTH_STATUS_LABELS[service.status]}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Dependencies</h4>
          <ul className="continuity-deps-list">
            {Object.entries(snapshot.dependencies).map(([key, value]) => (
              <li key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="continuity-snapshot-footer">
        Snapshot {new Date(snapshot.snapshotAt).toLocaleString()}
      </footer>
    </section>
  );
}
