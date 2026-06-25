import {
  CONFIGURATION_CATEGORIES,
  CONFIGURATION_CATEGORY_LABELS,
  FEATURE_FLAG_MODE_LABELS
} from "../../../constants/configurationPlatform";
import type { ConfigurationCategoryId } from "../../../constants/configurationPlatform";
import type { FeatureFlagRecord } from "../../../types/configurationPlatform";

type FeatureFlagsCardProps = {
  flags: FeatureFlagRecord[];
};

export function FeatureFlagsCard({ flags }: FeatureFlagsCardProps) {
  return (
    <section className="config-card feature-flags-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Feature flags</h3>
        <p>Enable, disable, gradual rollout, region rollout, role rollout, and future rollout.</p>
      </header>
      {flags.length ? (
        <ul className="feature-flags-card__list">
          {flags.map((flag) => (
            <li key={flag.id}>
              <div className="feature-flags-card__row">
                <strong>{flag.label}</strong>
                <span className={`feature-flags-card__mode feature-flags-card__mode--${flag.mode}`}>
                  {FEATURE_FLAG_MODE_LABELS[flag.mode]}
                </span>
              </div>
              <p className="feature-flags-card__key">{flag.flagKey}</p>
              {flag.description ? <p>{flag.description}</p> : null}
              <span className="feature-flags-card__category">
                {CONFIGURATION_CATEGORY_LABELS[flag.categoryId as ConfigurationCategoryId]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No feature flags configured.</p>
      )}
      <footer className="feature-flags-card__footer">
        <span>{CONFIGURATION_CATEGORIES.length} configuration categories available</span>
      </footer>
    </section>
  );
}
