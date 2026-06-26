import { CONFIGURATION_SECTION_LABELS } from "../../../constants/configurationPlatform";
import type { ConfigurationEntryRecord } from "../../../types/configurationPlatform";

type RemoteConfigEntriesCardProps = {
  entries: ConfigurationEntryRecord[];
  onSaveDraft: (entryId: string) => void;
  onPublish: (entryId: string) => void;
  onRollback: (entryId: string, version: number) => void;
};

function formatValue(value: ConfigurationEntryRecord["value"] | undefined) {
  if (value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function RemoteConfigEntriesCard({
  entries,
  onSaveDraft,
  onPublish,
  onRollback
}: RemoteConfigEntriesCardProps) {
  return (
    <section className="config-card remote-config-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Remote settings</h3>
        <p>Typed values with draft, publish, version history, and rollback — no redeploy required.</p>
      </header>
      {entries.length ? (
        <ul className="remote-config-card__list">
          {entries.map((entry) => (
            <li key={entry.id} className="remote-config-card__item">
              <div className="remote-config-card__row">
                <div>
                  <strong>{entry.label}</strong>
                  <p className="remote-config-card__key">{entry.configKey}</p>
                </div>
                <span className={`remote-config-card__status remote-config-card__status--${entry.status}`}>
                  {entry.status}
                </span>
              </div>
              <p className="remote-config-card__section">
                {CONFIGURATION_SECTION_LABELS[entry.categoryId]} · {entry.valueType}
                {entry.critical ? " · critical" : ""}
              </p>
              {entry.description ? <p>{entry.description}</p> : null}
              <div className="remote-config-card__values">
                <div>
                  <span>Published</span>
                  <code>{formatValue(entry.value)}</code>
                </div>
                {entry.draftValue !== undefined ? (
                  <div>
                    <span>Draft</span>
                    <code>{formatValue(entry.draftValue)}</code>
                  </div>
                ) : null}
              </div>
              <div className="remote-config-card__actions">
                {entry.status === "draft" ? (
                  <button type="button" className="concierge-consultant-btn" onClick={() => onPublish(entry.id)}>
                    Publish
                  </button>
                ) : (
                  <button
                    type="button"
                    className="concierge-consultant-btn concierge-consultant-btn--ghost"
                    onClick={() => onSaveDraft(entry.id)}
                  >
                    Save draft
                  </button>
                )}
                {entry.activeVersion > 1 ? (
                  <button
                    type="button"
                    className="concierge-consultant-btn concierge-consultant-btn--ghost"
                    onClick={() => onRollback(entry.id, entry.activeVersion - 1)}
                  >
                    Rollback v{entry.activeVersion - 1}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No remote settings in this section.</p>
      )}
    </section>
  );
}
