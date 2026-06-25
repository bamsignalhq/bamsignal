import { CONFIGURATION_BUSINESS_RULE_LABELS } from "../../../constants/configurationPlatform";
import type { ConfigurationEntryRecord } from "../../../types/configurationPlatform";

type BusinessRuleCardProps = {
  entries: ConfigurationEntryRecord[];
};

export function BusinessRuleCard({ entries }: BusinessRuleCardProps) {
  const rules = entries.filter((item) => item.businessRuleId);

  return (
    <section className="config-card business-rule-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Business rules</h3>
        <p>
          Consultation fee, working hours, duration, buffers, assignments, templates, journey
          rules, milestones, archive, and success story policies.
        </p>
      </header>
      {rules.length ? (
        <ul className="business-rule-card__list">
          {rules.map((entry) => (
            <li key={entry.id}>
              <div className="business-rule-card__row">
                <strong>
                  {entry.businessRuleId
                    ? CONFIGURATION_BUSINESS_RULE_LABELS[entry.businessRuleId]
                    : entry.label}
                </strong>
                {entry.critical ? (
                  <span className="business-rule-card__critical">Critical</span>
                ) : null}
              </div>
              <p className="business-rule-card__key">{entry.configKey}</p>
              <code className="business-rule-card__value">
                {typeof entry.value === "object"
                  ? JSON.stringify(entry.value)
                  : String(entry.value)}
              </code>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No business rules in this section.</p>
      )}
    </section>
  );
}
