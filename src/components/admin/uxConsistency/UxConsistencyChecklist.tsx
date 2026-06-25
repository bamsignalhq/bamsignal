import { UX_DOMAIN_LABELS } from "../../../constants/uxConsistency";
import type { UxChecklistItem, UxDomainResult } from "../../../types/uxConsistency";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type UxConsistencyChecklistProps = {
  checklist: UxChecklistItem[];
  domains: UxDomainResult[];
};

export function UxConsistencyChecklist({ checklist, domains }: UxConsistencyChecklistProps) {
  return (
    <section className="institutional-card ux-consistency-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>UX checklist</h3>
        <p>Standardization targets — institutional centers share one design language.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={item.passed ? "ux-consistency-checklist-card__item--passed" : "ux-consistency-checklist-card__item--failed"}
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span className={item.passed ? "ux-consistency-checklist-card__badge--pass" : "ux-consistency-checklist-card__badge--fail"}>
                {item.passed ? "Passed" : "Action needed"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{UX_DOMAIN_LABELS[item.domainId]}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="ux-consistency-checklist-card__domains">
        <h4>Domain scores</h4>
        <ul>
          {domains.map((domain) => (
            <li key={domain.id}>
              <span>{domain.label}</span>
              <InstitutionalStatusBadge status={domain.status} />
              <span>{domain.score}/100</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
