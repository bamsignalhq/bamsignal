import type { AccessibilityCertificationFinding } from "../../../types/accessibilityCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AccessibilityCertificationFindingsListProps = {
  findings: AccessibilityCertificationFinding[];
};

export function AccessibilityCertificationFindingsList({
  findings
}: AccessibilityCertificationFindingsListProps) {
  const visible = findings.filter((item) => !item.passed || item.severity !== "low");

  return (
    <section className="institutional-card accessibility-certification-findings-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Accessibility findings</h3>
        <p>Keyboard, ARIA, contrast, forms, modals, motion, and touch targets.</p>
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
        <p className="performance-center-card__empty">No open accessibility findings.</p>
      )}
    </section>
  );
}
