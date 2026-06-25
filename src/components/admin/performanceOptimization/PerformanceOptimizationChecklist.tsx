import { PERFORMANCE_DOMAIN_LABELS, PERFORMANCE_STATUS_LABELS } from "../../../constants/productionPerformance";
import type { PerformanceChecklistItem, PerformanceDomainResult } from "../../../types/productionPerformance";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PerformanceOptimizationChecklistProps = {
  checklist: PerformanceChecklistItem[];
  domains: PerformanceDomainResult[];
};

export function PerformanceOptimizationChecklist({
  checklist,
  domains
}: PerformanceOptimizationChecklistProps) {
  return (
    <section className="institutional-card performance-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Performance checklist</h3>
        <p>Optimization controls verified — functionality preserved.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={item.passed ? "performance-checklist-card__item--passed" : "performance-checklist-card__item--failed"}
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span className={item.passed ? "performance-checklist-card__badge--pass" : "performance-checklist-card__badge--fail"}>
                {item.passed ? "Passed" : "Action needed"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{PERFORMANCE_DOMAIN_LABELS[item.domainId]}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="performance-checklist-card__domains">
        <h4>Domain scores</h4>
        <ul>
          {domains.map((domain) => (
            <li key={domain.id}>
              <span>{domain.label}</span>
              <InstitutionalStatusBadge
                status={domain.status}
                label={PERFORMANCE_STATUS_LABELS[domain.status]}
              />
              <span>{domain.score}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
