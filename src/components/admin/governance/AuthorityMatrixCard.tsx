import { GOVERNANCE_ROLE_LABELS } from "../../../constants/institutionalGovernance";
import type { AuthorityMatrixRecord } from "../../../types/institutionalGovernance";

type AuthorityMatrixCardProps = {
  matrix: AuthorityMatrixRecord[];
};

export function AuthorityMatrixCard({ matrix }: AuthorityMatrixCardProps) {
  return (
    <section className="governance-card authority-matrix-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Authority matrix</h3>
        <p>Responsibilities, reporting lines, approval limits, and operational scope per role.</p>
      </header>
      <ul className="authority-matrix-card__list">
        {matrix.map((entry) => (
          <li key={entry.id}>
            <strong>{GOVERNANCE_ROLE_LABELS[entry.roleSlug]}</strong>
            <span>{entry.reportingLine}</span>
            <p>{entry.responsibilities.join(" · ")}</p>
            <div className="authority-matrix-card__scopes">
              <span>Approval: {entry.approvalAuthority.join(", ")}</span>
              <span>Scope: {entry.operationalScope.join(", ")}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
