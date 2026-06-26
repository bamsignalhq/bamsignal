import { FEATURE_FLAG_ROLLOUT_SCOPE_LABELS } from "../../../constants/featureFlagPlatform";
import type { EnterpriseFeatureFlagRecord } from "../../../types/featureFlagPlatform";
import { formatFeatureFlagRollout } from "../../../utils/featureFlagPlatformLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type FeatureFlagListCardProps = {
  flags: EnterpriseFeatureFlagRecord[];
  onToggle: (flagId: string, enabled: boolean) => void;
};

export function FeatureFlagListCard({ flags, onToggle }: FeatureFlagListCardProps) {
  return (
    <section className="feature-flag-card concierge-consultant-card--glass cc-reveal">
      <header className="feature-flag-card__head">
        <h3>Supported flags</h3>
        <p>Toggle major product features remotely — no deployment required.</p>
      </header>
      <ul className="feature-flag-card__list">
        {flags.map((flag) => (
          <li key={flag.id} className="feature-flag-card__item">
            <div className="feature-flag-card__row">
              <div>
                <strong>{flag.label}</strong>
                <p className="feature-flag-card__key">{flag.key}</p>
              </div>
              <InstitutionalStatusBadge
                status={flag.enabled ? "healthy" : flag.active ? "warning" : "broken"}
                label={flag.enabled ? "Enabled" : flag.active ? "Partial" : "Disabled"}
              />
            </div>
            {flag.description ? <p>{flag.description}</p> : null}
            <p className="feature-flag-card__meta">
              {FEATURE_FLAG_ROLLOUT_SCOPE_LABELS[flag.rollout.scope]} · {formatFeatureFlagRollout(flag)}
            </p>
            <div className="feature-flag-card__actions">
              <button
                type="button"
                className="concierge-consultant-btn"
                onClick={() => onToggle(flag.id, !flag.enabled)}
              >
                {flag.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
