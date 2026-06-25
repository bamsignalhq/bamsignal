import { ENGINEERING_DOMAIN_LABELS } from "../../../constants/enterpriseCodebaseCleanup";
import type { EngineeringHealthCheck, EngineeringHealthDomainResult } from "../../../types/enterpriseCodebaseCleanup";

type EnterpriseCleanupChecklistProps = {
  checklist: EngineeringHealthCheck[];
  domains: EngineeringHealthDomainResult[];
};

export function EnterpriseCleanupChecklist({ checklist, domains }: EnterpriseCleanupChecklistProps) {
  return (
    <section className="institutional-card enterprise-cleanup-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Cleanup checklist</h3>
        <p>Audit, standardize, verify — every file has one clear responsibility.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={
              item.passed
                ? "enterprise-cleanup-checklist-card__item--passed"
                : "enterprise-cleanup-checklist-card__item--failed"
            }
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span
                className={
                  item.passed
                    ? "enterprise-cleanup-checklist-card__badge--pass"
                    : "enterprise-cleanup-checklist-card__badge--fail"
                }
              >
                {item.passed ? "Verified" : "Action needed"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{ENGINEERING_DOMAIN_LABELS[item.domainId]}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="enterprise-cleanup-checklist-card__domains">
        <h4>Domain scores</h4>
        <ul>
          {domains.map((domainItem) => (
            <li key={domainItem.id}>
              <span>{domainItem.label}</span>
              <span>{domainItem.score}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
