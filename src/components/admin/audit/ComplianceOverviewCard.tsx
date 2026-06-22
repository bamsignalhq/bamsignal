import { AUDIT_APPEND_ONLY_RULES } from "../../../constants/auditCenter";
import type { AuditComplianceMetric } from "../../../types/auditCenter";

type ComplianceOverviewCardProps = {
  metrics: AuditComplianceMetric[];
};

export function ComplianceOverviewCard({ metrics }: ComplianceOverviewCardProps) {
  return (
    <section className="audit-compliance-overview concierge-consultant-card--glass cc-reveal">
      <header className="audit-compliance-overview__head">
        <h3>Compliance overview</h3>
        <p>Centralized audit metrics across concierge operations.</p>
      </header>

      <div className="audit-compliance-overview__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="audit-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <footer className="audit-compliance-overview__rules">
        <h4>Rules</h4>
        <ul>
          {AUDIT_APPEND_ONLY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
