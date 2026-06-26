import { useCallback, useMemo, useState } from "react";
import { CONFIGURATION_PLATFORM_ADMIN_PATH } from "../../../constants/configurationPlatformAdmin";
import { FEATURE_FLAG_ENVIRONMENTS } from "../../../constants/featureFlagPlatform";
import {
  FEATURE_FLAG_PLATFORM_ADMIN_BRAND,
  FEATURE_FLAG_PLATFORM_ADMIN_PATH
} from "../../../constants/featureFlagPlatformAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildFeatureFlagPlatformDashboard } from "../../../utils/featureFlagPlatformEngine";
import { toggleFeatureFlag } from "../../../utils/featureFlagPlatformStore";
import { FeatureFlagAuditCard } from "./FeatureFlagAuditCard";
import { FeatureFlagListCard } from "./FeatureFlagListCard";
import { FeatureFlagSummaryCards } from "./FeatureFlagSummaryCards";

export function FeatureFlagPlatformPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [environment, setEnvironment] = useState<(typeof FEATURE_FLAG_ENVIRONMENTS)[number]>("production");

  const bundle = useMemo(() => {
    void refreshKey;
    return buildFeatureFlagPlatformDashboard(environment);
  }, [refreshKey, environment]);

  const handleToggle = useCallback((flagId: string, enabled: boolean) => {
    toggleFeatureFlag({
      flagId,
      enabled,
      actor: "ops@bamsignal.com",
      reason: enabled ? "Enabled from Feature Flag Platform" : "Disabled from Feature Flag Platform"
    });
    setRefreshKey((value) => value + 1);
  }, []);

  return (
    <div className="feature-flag-platform-page">
      <header className="feature-flag-platform-page__head">
        <div>
          <h2>{FEATURE_FLAG_PLATFORM_ADMIN_BRAND}</h2>
          <p>
            Remotely enable or disable major product features without deployment. Supports global,
            geographic, percentage, and ID-based rollouts with full audit history.
          </p>
        </div>
        <div className="feature-flag-platform-page__actions">
          <label>
            Environment
            <select value={environment} onChange={(event) => setEnvironment(event.target.value as typeof environment)}>
              {FEATURE_FLAG_ENVIRONMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(CONFIGURATION_PLATFORM_ADMIN_PATH)}
          >
            Configuration
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh
          </button>
        </div>
      </header>

      <FeatureFlagSummaryCards summary={bundle.summary} environment={bundle.environment} />

      <div className="feature-flag-platform-page__body">
        <FeatureFlagListCard flags={bundle.flags} onToggle={handleToggle} />
        <FeatureFlagAuditCard audits={bundle.audits} />
      </div>

      <footer className="feature-flag-platform-page__foot">
        <span>Route: {FEATURE_FLAG_PLATFORM_ADMIN_PATH}</span>
        <span>SDK: useFeatureFlag() · FeatureGate · GET /api/feature-flags</span>
        <span>Offline cache: bamsignal.featureFlags.v1</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
