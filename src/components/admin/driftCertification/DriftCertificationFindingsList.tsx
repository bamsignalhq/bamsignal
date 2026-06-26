import type { DriftCertificationFinding } from "../../../types/driftCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DriftCertificationFindingsListProps = {
  findings: DriftCertificationFinding[];
};

export function DriftCertificationFindingsList({ findings }: DriftCertificationFindingsListProps) {
  const visible = findings.filter((item) => !item.passed);

  return (
    <section className="institutional-card drift-certification-findings-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Configuration drift findings</h3>
        <p>Expected vs current, production vs staging, and live DB deltas.</p>
      </header>
      {visible.length ? (
        <ul className="institutional-card__fixes">
          {visible.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>{item.title}</strong>
                <InstitutionalStatusBadge
                  status={
                    item.severity === "critical"
                      ? "critical"
                      : item.severity === "high"
                        ? "warning"
                        : "partial"
                  }
                  label={item.severity}
                />
              </div>
              <span className="performance-center-card__detail">
                [{item.compareTarget}] {item.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No open drift findings.</p>
      )}
    </section>
  );
}
