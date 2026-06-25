import {
  CONFIGURATION_CATEGORY_LABELS,
  RUNTIME_CONFIG_DOMAIN_LABELS
} from "../../../constants/configurationPlatform";
import type { ConfigurationEntryRecord } from "../../../types/configurationPlatform";

type RuntimeSettingsCardProps = {
  entries: ConfigurationEntryRecord[];
};

function formatValue(value: ConfigurationEntryRecord["value"]) {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function RuntimeSettingsCard({ entries }: RuntimeSettingsCardProps) {
  return (
    <section className="config-card runtime-settings-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Runtime configuration</h3>
        <p>Limits, pricing, journey settings, timings, durations, cadence, archive, and retention.</p>
      </header>
      {entries.length ? (
        <ul className="runtime-settings-card__list">
          {entries.map((entry) => (
            <li key={entry.id} className={entry.critical ? "is-critical" : undefined}>
              <div className="runtime-settings-card__row">
                <strong>{entry.label}</strong>
                {entry.critical ? <span className="runtime-settings-card__critical">Critical</span> : null}
              </div>
              <p className="runtime-settings-card__key">{entry.configKey}</p>
              <p className="runtime-settings-card__value">{formatValue(entry.value)}</p>
              <div className="runtime-settings-card__meta">
                <span>{CONFIGURATION_CATEGORY_LABELS[entry.categoryId]}</span>
                {entry.domainId ? <span>{RUNTIME_CONFIG_DOMAIN_LABELS[entry.domainId]}</span> : null}
                <span>v{entry.activeVersion}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No runtime settings match the current filters.</p>
      )}
    </section>
  );
}
