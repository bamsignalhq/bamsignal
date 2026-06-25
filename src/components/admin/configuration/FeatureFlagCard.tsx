import {
  CONFIGURATION_SECTION_LABELS,
  FEATURE_FLAG_MODE_LABELS
} from "../../../constants/configurationPlatform";
import type { FeatureFlagRecord } from "../../../types/configurationPlatform";

type FeatureFlagCardProps = {
  flags: FeatureFlagRecord[];
};

export function FeatureFlagCard({ flags }: FeatureFlagCardProps) {
  return (
    <section className="config-card feature-flag-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Feature flags</h3>
        <p>Enable, disable, preview, internal only, beta, and maintenance modes.</p>
      </header>
      {flags.length ? (
        <ul className="feature-flag-card__list">
          {flags.map((flag) => (
            <li key={flag.id}>
              <div className="feature-flag-card__row">
                <strong>{flag.label}</strong>
                <span className={`feature-flag-card__mode feature-flag-card__mode--${flag.mode}`}>
                  {FEATURE_FLAG_MODE_LABELS[flag.mode]}
                </span>
              </div>
              <p className="feature-flag-card__key">{flag.flagKey}</p>
              {flag.description ? <p>{flag.description}</p> : null}
              <span className="feature-flag-card__section">
                {CONFIGURATION_SECTION_LABELS[flag.categoryId]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No feature flags in this section.</p>
      )}
    </section>
  );
}
