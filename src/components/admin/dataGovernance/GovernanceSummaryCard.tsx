import type { DataGovernanceSummary } from "../../../types/dataGovernanceCenter";

type GovernanceSummaryCardProps = {
  summary: DataGovernanceSummary;
};

export function GovernanceSummaryCard({ summary }: GovernanceSummaryCardProps) {
  return (
    <section className="data-governance-card governance-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Governance overview</h3>
        <p>Consent, retention, privacy requests, legal holds, and audit exports at a glance.</p>
      </header>
      <div className="data-governance-card__grid">
        <article>
          <span>Open requests</span>
          <strong>{summary.openPrivacyRequests}</strong>
        </article>
        <article>
          <span>Active consents</span>
          <strong>{summary.activeConsents}</strong>
        </article>
        <article>
          <span>Retention policies</span>
          <strong>{summary.activeRetentionPolicies}</strong>
        </article>
        <article>
          <span>Legal holds</span>
          <strong>{summary.activeLegalHolds}</strong>
        </article>
        <article>
          <span>Audit exports</span>
          <strong>{summary.auditExportCount}</strong>
        </article>
        <article>
          <span>Policy versions</span>
          <strong>{summary.policyVersionCount}</strong>
        </article>
        <article>
          <span>Governance audit</span>
          <strong>{summary.governanceAuditCount}</strong>
        </article>
        <article>
          <span>Sensitive registers</span>
          <strong>{summary.sensitiveRegisters}</strong>
        </article>
      </div>
    </section>
  );
}
