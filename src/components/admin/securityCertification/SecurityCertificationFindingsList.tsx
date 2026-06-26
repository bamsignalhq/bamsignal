import type { SecurityCertificationFinding } from "../../../types/securityCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type SecurityCertificationFindingsListProps = {
  findings: SecurityCertificationFinding[];
};

export function SecurityCertificationFindingsList({ findings }: SecurityCertificationFindingsListProps) {
  const failed = findings.filter((item) => !item.passed);

  return (
    <section className="institutional-card security-certification-findings-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Security checks</h3>
        <p>
          {failed.length > 0
            ? `${failed.length} finding(s) require attention.`
            : "All certification checks passed."}
        </p>
      </header>
      <ul className="institutional-card__list">
        {findings.map((item) => (
          <li key={item.id}>
            <div className="institutional-card__row">
              <strong>{item.title}</strong>
              <InstitutionalStatusBadge status={item.passed ? "consistent" : "inconsistent"} />
            </div>
            <p>
              {item.checkId} · {item.severity.toUpperCase()}
              {item.owaspRef ? ` · OWASP ${item.owaspRef}` : ""}
            </p>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
