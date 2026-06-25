import { PRODUCTION_ENV_INTEGRATIONS } from "../../../constants/productionEnvironmentAudit";
import type { ProductionEnvCheck, ProductionEnvIntegrationResult } from "../../../types/productionEnvironmentAudit";

type ProductionEnvironmentChecklistProps = {
  checklist: ProductionEnvCheck[];
  integrations: ProductionEnvIntegrationResult[];
};

const INTEGRATION_LABELS = Object.fromEntries(
  PRODUCTION_ENV_INTEGRATIONS.map((item) => [item.id, item.label])
) as Record<string, string>;

export function ProductionEnvironmentChecklist({
  checklist,
  integrations
}: ProductionEnvironmentChecklistProps) {
  return (
    <section className="institutional-card production-env-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Environment checklist</h3>
        <p>No placeholders, no duplicate secrets, no dev keys in production paths.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={
              item.passed
                ? "production-env-checklist-card__item--passed"
                : "production-env-checklist-card__item--failed"
            }
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span
                className={
                  item.passed
                    ? "production-env-checklist-card__badge--pass"
                    : "production-env-checklist-card__badge--fail"
                }
              >
                {item.passed ? "Verified" : "Review"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{INTEGRATION_LABELS[item.integrationId]}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="production-env-checklist-card__integrations">
        <h4>Integration status</h4>
        <ul>
          {integrations.map((integration) => (
            <li key={integration.id}>
              <span>{integration.label}</span>
              <span className={`production-env-status production-env-status--${integration.status}`}>
                {integration.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
