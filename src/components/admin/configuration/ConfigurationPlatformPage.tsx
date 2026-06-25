import { useCallback, useMemo, useState } from "react";
import {
  CONFIGURATION_FUTURE_ARCHITECTURE,
  CONFIGURATION_PLATFORM_RULES,
  CONFIGURATION_SECTIONS
} from "../../../constants/configurationPlatform";
import {
  CONFIGURATION_PLATFORM_ADMIN_BRAND,
  CONFIGURATION_PLATFORM_ADMIN_PATH
} from "../../../constants/configurationPlatformAdmin";
import type { ConfigurationSectionId } from "../../../constants/configurationPlatform";
import { buildConfigurationPlatformBundle } from "../../../utils/configurationPlatformEngine";
import { emptyConfigurationFilters } from "../../../utils/configurationPlatformLogic";
import { AuditHistoryCard } from "./AuditHistoryCard";
import { BusinessRuleCard } from "./BusinessRuleCard";
import { ConfigurationCard } from "./ConfigurationCard";
import { FeatureFlagCard } from "./FeatureFlagCard";
import { InstitutionSettingsCard } from "./InstitutionSettingsCard";

export function ConfigurationPlatformPage() {
  const [section, setSection] = useState<ConfigurationSectionId | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const filters = useMemo(
    () => ({
      ...emptyConfigurationFilters(),
      sectionId: section
    }),
    [section]
  );

  const bundle = useMemo(() => {
    void refreshKey;
    return buildConfigurationPlatformBundle(filters);
  }, [filters, refreshKey]);

  const handleSectionSelect = useCallback((sectionId: ConfigurationSectionId | "all") => {
    setSection((current) => (current === sectionId ? "all" : sectionId));
  }, []);

  const showOverview = section === "all";
  const showInstitution = showOverview || section === "institution";
  const showBusinessRules = showOverview || section !== "feature-flags";
  const showFlags = showOverview || section === "feature-flags" || bundle.featureFlags.length > 0;
  const showAudit = showOverview || section !== "feature-flags";

  return (
    <div className="configuration-platform-page">
      <header className="configuration-platform-page__head">
        <div>
          <h2>{CONFIGURATION_PLATFORM_ADMIN_BRAND}</h2>
          <p>
            Centralized institutional configuration — no critical business rule should require
            developers to edit code. Operations configures consultation fees, working hours,
            assignment rules, notification templates, journey policies, feature flags, and audit
            history with rollback.
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

      <nav className="configuration-platform-page__sections" aria-label="Configuration sections">
        <button
          type="button"
          className={`configuration-platform-page__section-btn${section === "all" ? " is-active" : ""}`}
          onClick={() => handleSectionSelect("all")}
        >
          All
        </button>
        {CONFIGURATION_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`configuration-platform-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => handleSectionSelect(item.id)}
          >
            {item.label}
            {bundle.sectionCounts[item.id] ? ` (${bundle.sectionCounts[item.id]})` : ""}
          </button>
        ))}
      </nav>

      {showOverview ? (
        <ConfigurationCard
          metrics={bundle.metrics}
          pendingApprovals={bundle.pendingApprovals.length}
        />
      ) : null}

      <div className="configuration-platform-page__body">
        <div className="configuration-platform-page__column">
          {showInstitution ? <InstitutionSettingsCard entries={bundle.entries} /> : null}
          {showBusinessRules ? <BusinessRuleCard entries={bundle.entries} /> : null}
          {showFlags ? <FeatureFlagCard flags={bundle.featureFlags} /> : null}
        </div>
        <div className="configuration-platform-page__column">
          {showAudit ? (
            <AuditHistoryCard auditHistory={bundle.auditHistory} snapshots={bundle.snapshots} />
          ) : null}
        </div>
      </div>

      <footer className="configuration-platform-page__future">
        <h4>Future architecture (documented only)</h4>
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
