import { useCallback, useMemo, useState } from "react";
import {
  CONFIGURATION_FUTURE_ARCHITECTURE,
  CONFIGURATION_PLATFORM_RULES
} from "../../../constants/configurationPlatform";
import {
  CONFIGURATION_PLATFORM_ADMIN_BRAND,
  CONFIGURATION_PLATFORM_ADMIN_PATH
} from "../../../constants/configurationPlatformAdmin";
import type { ConfigurationCategoryId } from "../../../constants/configurationPlatform";
import { buildConfigurationPlatformBundle } from "../../../utils/configurationPlatformEngine";
import { emptyConfigurationFilters } from "../../../utils/configurationPlatformLogic";
import { ApprovalQueueCard } from "./ApprovalQueueCard";
import { CategoryExplorerCard } from "./CategoryExplorerCard";
import { ConfigurationOverviewCard } from "./ConfigurationOverviewCard";
import { FeatureFlagsCard } from "./FeatureFlagsCard";
import { RollbackCard } from "./RollbackCard";
import { RuntimeSettingsCard } from "./RuntimeSettingsCard";
import { VersionHistoryCard } from "./VersionHistoryCard";

export function ConfigurationPlatformPage() {
  const [filters, setFilters] = useState(() => emptyConfigurationFilters());
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildConfigurationPlatformBundle(filters);
  }, [filters, refreshKey]);

  const handleCategorySelect = useCallback((categoryId: ConfigurationCategoryId) => {
    setFilters((current) => ({
      ...current,
      categoryId: current.categoryId === categoryId ? "all" : categoryId
    }));
  }, []);

  return (
    <div className="configuration-platform-page">
      <header className="configuration-platform-page__head">
        <div>
          <h2>{CONFIGURATION_PLATFORM_ADMIN_BRAND}</h2>
          <p>
            Centralized system configuration — feature flags, runtime limits, pricing, journey
            settings, approvals, versioning, and rollback. Every change is audit logged.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <ConfigurationOverviewCard metrics={bundle.metrics} />

      <CategoryExplorerCard
        categoryCounts={bundle.categoryCounts}
        activeCategoryId={filters.categoryId}
        onSelectCategory={handleCategorySelect}
      />

      <div className="configuration-platform-page__body">
        <div className="configuration-platform-page__column">
          <RuntimeSettingsCard entries={bundle.entries} />
          <FeatureFlagsCard flags={bundle.featureFlags} />
          <ApprovalQueueCard approvals={bundle.approvals} />
        </div>
        <div className="configuration-platform-page__column">
          <VersionHistoryCard versions={bundle.versions} />
          <RollbackCard snapshots={bundle.snapshots} />
        </div>
      </div>

      <footer className="configuration-platform-page__future">
        <h4>Future-ready (documented only)</h4>
        <p>{CONFIGURATION_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <ul>
          {CONFIGURATION_PLATFORM_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <span>Route: {CONFIGURATION_PLATFORM_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
