import type { ReadinessAuditDomainScore } from "../../../types/institutionalReadiness";
import { READINESS_RESULT_LABELS } from "../../../constants/institutionalReadiness";

type ReadinessAuditDomainsCardProps = {
  domains: ReadinessAuditDomainScore[];
};

export function ReadinessAuditDomainsCard({ domains }: ReadinessAuditDomainsCardProps) {
  return (
    <section className="readiness-verification-card readiness-audit-domains-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Audit</h3>
        <p>
          Every subsystem — infrastructure, security, payments, messaging, matching, concierge, and
          all institutional domains.
        </p>
      </header>
      <div className="readiness-audit-domains-card__grid">
        {domains.map((domain) => (
          <article
            key={domain.id}
            className={`readiness-audit-domains-card__item readiness-audit-domains-card__item--${domain.status}`}
          >
            <div className="readiness-audit-domains-card__headline">
              <strong>{domain.label}</strong>
              <span className={`readiness-audit-domains-card__trend readiness-audit-domains-card__trend--${domain.trend}`}>
                {domain.trend === "up" ? "↑" : domain.trend === "down" ? "↓" : "—"}{" "}
                {domain.trendDelta !== 0 ? `${domain.trendDelta}%` : ""}
              </span>
            </div>
            <div className="readiness-audit-domains-card__score">
              <strong>{domain.score}</strong>
              <span>{READINESS_RESULT_LABELS[domain.status]}</span>
            </div>
            <p>{domain.summary}</p>
            {domain.blockerCount > 0 ? (
              <small>{domain.blockerCount} blocker signal(s)</small>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
