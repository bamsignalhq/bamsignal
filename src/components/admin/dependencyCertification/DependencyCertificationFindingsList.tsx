import type { DependencyCertificationFinding } from "../../../types/dependencyCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DependencyCertificationFindingsListProps = {
  findings: DependencyCertificationFinding[];
};

export function DependencyCertificationFindingsList({
  findings
}: DependencyCertificationFindingsListProps) {
  const visible = findings.filter((item) => !item.passed || item.severity !== "low");

  return (
    <section className="institutional-card dependency-certification-findings-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Supply chain findings</h3>
        <p>CVEs, drift, duplicates, licenses, and SDK verification.</p>
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
                        : item.passed
                          ? "healthy"
                          : "partial"
                  }
                  label={item.severity}
                />
              </div>
              <span className="performance-center-card__detail">{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No open dependency findings.</p>
      )}
    </section>
  );
}
