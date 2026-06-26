import type { ConfigurationEntryRecord } from "../../../types/configurationPlatform";

type InstitutionSettingsCardProps = {
  entries: ConfigurationEntryRecord[];
};

export function InstitutionSettingsCard({ entries }: InstitutionSettingsCardProps) {
  const institutionEntries = entries.filter((item) => item.categoryId === "discovery");

  return (
    <section className="config-card institution-settings-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Institution settings</h3>
        <p>Core institutional policies, archive rules, and governance configuration.</p>
      </header>
      {institutionEntries.length ? (
        <ul className="institution-settings-card__list">
          {institutionEntries.map((entry) => (
            <li key={entry.id}>
              <div className="institution-settings-card__row">
                <strong>{entry.label}</strong>
                <span className={`institution-settings-card__status institution-settings-card__status--${entry.status}`}>
                  {entry.status}
                </span>
              </div>
              <p className="institution-settings-card__key">{entry.configKey}</p>
              {entry.description ? <p>{entry.description}</p> : null}
              <code className="institution-settings-card__value">
                {typeof entry.value === "object"
                  ? JSON.stringify(entry.value)
                  : String(entry.value)}
              </code>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No institution settings in this view.</p>
      )}
    </section>
  );
}
