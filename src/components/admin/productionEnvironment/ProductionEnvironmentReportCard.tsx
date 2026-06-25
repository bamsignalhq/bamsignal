import { PRODUCTION_ENV_INTEGRATIONS } from "../../../constants/productionEnvironmentAudit";
import type { ProductionEnvironmentReport } from "../../../types/productionEnvironmentAudit";
import { formatProductionEnvironmentSummary } from "../../../utils/productionEnvironmentAuditLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type ProductionEnvironmentReportCardProps = {
  report: ProductionEnvironmentReport;
};

const STATUS_BADGE: Record<
  ProductionEnvironmentReport["overallStatus"],
  "consistent" | "review" | "inconsistent"
> = {
  ready: "consistent",
  warning: "review",
  critical: "inconsistent"
};

const STATUS_LABEL: Record<ProductionEnvironmentReport["overallStatus"], string> = {
  ready: "Ready",
  warning: "Warning",
  critical: "Critical"
};

export function ProductionEnvironmentReportCard({ report }: ProductionEnvironmentReportCardProps) {
  return (
    <section className="institutional-card production-env-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Production environment report</h3>
        <p>
          Every integration and environment variable — Supabase through webhooks. Ready, warning, or
          critical.
        </p>
      </header>

      <div className="production-env-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={STATUS_BADGE[report.overallStatus]}
          label={STATUS_LABEL[report.overallStatus]}
        />
      </div>

      <p className="production-env-report-card__line">{formatProductionEnvironmentSummary(report)}</p>

      <div className="production-env-report-card__metrics">
        <article>
          <span>Ready</span>
          <strong>{report.readyCount}</strong>
        </article>
        <article>
          <span>Warning</span>
          <strong>{report.warningCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.criticalCount}</strong>
        </article>
        <article>
          <span>Registry vars</span>
          <strong>{report.registryVariableCount}</strong>
        </article>
      </div>

      <footer className="production-env-report-card__foot">
        <p>
          .env.example documents {report.envExampleVariableCount} keys ·{" "}
          {PRODUCTION_ENV_INTEGRATIONS.length} integrations audited
        </p>
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}
