import { SECURITY_DOMAIN_LABELS, SECURITY_STATUS_LABELS } from "../../../constants/productionSecurity";
import type { SecurityDomainResult } from "../../../types/productionSecurity";

type SecurityChecklistProps = {
  checklist: import("../../../types/productionSecurity").SecurityChecklistItem[];
  domains: SecurityDomainResult[];
};

export function SecurityChecklist({ checklist, domains }: SecurityChecklistProps) {
  return (
    <section className="production-security-card security-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="production-security-card__head">
        <h3>Security checklist</h3>
        <p>Hardening controls verified — fixes applied without architecture redesign.</p>
      </header>

      <ul className="production-security-card__list">
        {checklist.map((item) => (
          <li key={item.id} className={item.passed ? "security-checklist-card__item--passed" : "security-checklist-card__item--failed"}>
            <div className="production-security-card__row">
              <strong>{item.label}</strong>
              <span className={item.passed ? "security-checklist-card__badge--pass" : "security-checklist-card__badge--fail"}>
                {item.passed ? "Passed" : "Action needed"}
              </span>
            </div>
            <div className="production-security-card__meta">
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
              <span className={`security-status-badge security-status-badge--${domain.status}`}>
                {SECURITY_STATUS_LABELS[domain.status]}
              </span>
              <span>{domain.score}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
