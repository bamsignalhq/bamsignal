import { INSTITUTIONAL_AUDIT_APPEND_ONLY_RULES } from "../../../constants/institutionalAuditCompliance";
import type { InstitutionalComplianceMetric } from "../../../types/auditEngine";

type ComplianceOverviewCardProps = {
  metrics: InstitutionalComplianceMetric[];
};

export function ComplianceOverviewCard({ metrics }: ComplianceOverviewCardProps) {
  return (
    <section className="institutional-compliance-overview concierge-consultant-card--glass cc-reveal">
      <header className="institutional-compliance-overview__head">
        <h3>Compliance overview</h3>
        <p>Permanent institutional audit metrics across access, finance, concierge, and safety.</p>
      </header>

      <div className="institutional-compliance-overview__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="institutional-audit-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <footer className="institutional-compliance-overview__rules">
        <h4>Rules</h4>
        <ul>
          {INSTITUTIONAL_AUDIT_APPEND_ONLY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
