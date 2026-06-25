import { SECURITY_DOMAIN_LABELS, SECURITY_STATUS_LABELS } from "../../../constants/productionSecurity";
import type { SecurityChecklistItem, SecurityDomainResult } from "../../../types/productionSecurity";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type SecurityChecklistProps = {
  checklist: SecurityChecklistItem[];
  domains: SecurityDomainResult[];
};

export function SecurityChecklist({ checklist, domains }: SecurityChecklistProps) {
  return (
    <section className="institutional-card security-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Security checklist</h3>
        <p>Hardening controls verified — fixes applied without architecture redesign.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={item.passed ? "security-checklist-card__item--passed" : "security-checklist-card__item--failed"}
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span className={item.passed ? "security-checklist-card__badge--pass" : "security-checklist-card__badge--fail"}>
                {item.passed ? "Passed" : "Action needed"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{SECURITY_DOMAIN_LABELS[item.domainId]}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="security-checklist-card__domains">
        <h4>Domain scores</h4>
        <ul>
          {domains.map((domain) => (
            <li key={domain.id}>
              <span>{domain.label}</span>
              <InstitutionalStatusBadge
                status={domain.status}
                label={SECURITY_STATUS_LABELS[domain.status]}
              />
              <span>{domain.score}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
