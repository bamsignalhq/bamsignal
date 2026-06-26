import {
  READINESS_BLOCKER_SEVERITIES,
  READINESS_BLOCKER_SEVERITY_LABELS
} from "../../../constants/institutionalReadiness";
import type { ReadinessBlocker, ReadinessBlockerCounts } from "../../../types/institutionalReadiness";
import { filterBlockersBySeverity } from "../../../utils/institutionalReadinessLogic";

type ReadinessBlockersCardProps = {
  blockers: ReadinessBlocker[];
  blockerCounts: ReadinessBlockerCounts;
};

export function ReadinessBlockersCard({ blockers, blockerCounts }: ReadinessBlockersCardProps) {
  return (
    <section className="readiness-verification-card readiness-blockers-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Critical blockers</h3>
        <p>Critical, high, medium, and low priority blockers across all audit domains.</p>
      </header>
      <div className="readiness-blockers-card__counts">
        <span>Critical {blockerCounts.critical}</span>
        <span>High {blockerCounts.high}</span>
        <span>Medium {blockerCounts.medium}</span>
        <span>Low {blockerCounts.low}</span>
      </div>
      {READINESS_BLOCKER_SEVERITIES.map((severity) => {
        const items = filterBlockersBySeverity(blockers, severity.id);
        return (
          <div key={severity.id} className="readiness-blockers-card__section">
            <h4>{READINESS_BLOCKER_SEVERITY_LABELS[severity.id]}</h4>
            {items.length ? (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.auditDomainId}</span>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="readiness-verification-card__empty">No {severity.label.toLowerCase()} blockers.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
