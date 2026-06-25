import { useMemo, useState } from "react";
import { PRODUCTION_SECURITY_ADMIN_PATH } from "../../../constants/productionSecurityAdmin";
import {
  PRODUCTION_ENVIRONMENT_ADMIN_PATH,
  PRODUCTION_ENVIRONMENT_BRAND
} from "../../../constants/productionEnvironmentAdmin";
import { SYSTEM_HEALTH_ADMIN_PATH } from "../../../constants/systemHealthAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildProductionEnvironmentAudit } from "../../../utils/productionEnvironmentAuditEngine";
import { productionEnvironmentConsolidationChecks } from "../../../utils/productionEnvironmentAuditLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { ProductionEnvironmentChecklist } from "./ProductionEnvironmentChecklist";
import { ProductionEnvironmentReportCard } from "./ProductionEnvironmentReportCard";

const DOMAIN_STATUS_BADGE: Record<
  "ready" | "warning" | "critical",
  "consistent" | "review" | "inconsistent"
> = {
  ready: "consistent",
  warning: "review",
  critical: "inconsistent"
};

export function ProductionEnvironmentDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildProductionEnvironmentAudit();
  }, [refreshKey]);

  const consolidation = useMemo(() => productionEnvironmentConsolidationChecks(), []);

  return (
    <div className="institutional-page production-environment-page">
      <header className="institutional-page__head">
        <div>
          <h2>{PRODUCTION_ENVIRONMENT_BRAND}</h2>
          <p>
            Audit every production environment variable and integration — Supabase, Paystack, Resend,
            Sendchamp, Google, Zoom, storage, JWT, secrets, mobile, PWA, cron, and webhooks.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(SYSTEM_HEALTH_ADMIN_PATH)}
          >
            System health
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_SECURITY_ADMIN_PATH)}
          >
            Security audit
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-audit
          </button>
        </div>
      </header>

      <ProductionEnvironmentReportCard report={report} />

      <div className="institutional-page__body">
        <ProductionEnvironmentChecklist checklist={report.checklist} integrations={report.integrations} />

        <div className="institutional-page__column">
          <section className="institutional-card production-env-integrations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Integration scores</h3>
              <p>Ready, warning, or critical per production integration.</p>
            </header>
            <ul className="institutional-card__list">
              {report.integrations.map((integration) => (
                <li key={integration.id}>
                  <div className="institutional-card__row">
                    <strong>{integration.label}</strong>
                    <InstitutionalStatusBadge status={DOMAIN_STATUS_BADGE[integration.status]} />
                    <span>{integration.score}/100</span>
                  </div>
                  <p>{integration.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card production-env-duplicates-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Duplicate variables</h3>
              <p>Canonical names — set duplicates to the same value or remove unused aliases.</p>
            </header>
            <ul className="institutional-card__list">
              {report.duplicates.map((item) => (
                <li key={item.id}>
                  <div className="institutional-card__row">
                    <strong>{item.label}</strong>
                    <span className="production-env-canonical">→ {item.canonical}</span>
                  </div>
                  <p>{item.summary}</p>
                  <div className="institutional-card__meta">
                    {item.variables.map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card production-env-findings-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Findings</h3>
              <p>Missing docs, dev-only secrets, placeholder patterns.</p>
            </header>
            <ul className="institutional-card__list">
              {report.findings.map((finding) => (
                <li key={finding.id}>
                  <div className="institutional-card__row">
                    <strong>{finding.label}</strong>
                    <InstitutionalStatusBadge status={DOMAIN_STATUS_BADGE[finding.status]} />
                  </div>
                  <p>{finding.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card production-env-consolidation-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Consolidation verification</h3>
              <p>Buildtime vs runtime, webhook auth, no VAPID drift.</p>
            </header>
            <ul className="institutional-card__fixes">
              {consolidation.map((item) => (
                <li key={item.id}>
                  {item.passed ? "✓" : "○"} {item.label}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {PRODUCTION_ENVIRONMENT_ADMIN_PATH}</span>
        <span>See PRODUCTION_ENVIRONMENT_REPORT.md in repository root</span>
      </footer>
    </div>
  );
}
