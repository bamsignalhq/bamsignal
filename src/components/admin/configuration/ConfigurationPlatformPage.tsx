import { useCallback, useMemo, useState } from "react";
import { FEATURE_FLAG_PLATFORM_ADMIN_PATH } from "../../../constants/featureFlagPlatformAdmin";
import {
  CONFIGURATION_FUTURE_ARCHITECTURE,
  CONFIGURATION_PLATFORM_RULES,
  CONFIGURATION_SECTIONS,
  REMOTE_CONFIG_DEFAULTS
} from "../../../constants/configurationPlatform";
import {
  CONFIGURATION_PLATFORM_ADMIN_BRAND,
  CONFIGURATION_PLATFORM_ADMIN_PATH
} from "../../../constants/configurationPlatformAdmin";
import type { ConfigurationSectionId } from "../../../constants/configurationPlatform";
import { navigateToPath } from "../../../constants/routes";
import { buildConfigurationPlatformBundle } from "../../../utils/configurationPlatformEngine";
import { emptyConfigurationFilters } from "../../../utils/configurationPlatformLogic";
import {
  publishConfigurationDraftEntry,
  rollbackConfigurationEntry,
  saveConfigurationDraftValue
} from "../../../utils/configurationPlatformStore";
import { AuditHistoryCard } from "./AuditHistoryCard";
import { ConfigurationCard } from "./ConfigurationCard";
import { RemoteConfigEntriesCard } from "./RemoteConfigEntriesCard";

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

  const handleSaveDraft = useCallback((entryId: string) => {
    const entry = bundle.entries.find((item) => item.id === entryId);
    if (!entry) return;
    const nextValue =
      typeof entry.value === "number"
        ? entry.value + 1
        : entry.value;
    saveConfigurationDraftValue(entryId, nextValue, "ops@bamsignal.com", "Draft from Remote Config Center");
    setRefreshKey((value) => value + 1);
  }, [bundle.entries]);

  const handlePublish = useCallback((entryId: string) => {
    publishConfigurationDraftEntry(entryId, "ops@bamsignal.com", "Published from Remote Config Center");
    setRefreshKey((value) => value + 1);
  }, []);

  const handleRollback = useCallback((entryId: string, version: number) => {
    rollbackConfigurationEntry(entryId, version, "ops@bamsignal.com");
    setRefreshKey((value) => value + 1);
  }, []);

  return (
    <div className="configuration-platform-page">
      <header className="configuration-platform-page__head">
        <div>
          <h2>{CONFIGURATION_PLATFORM_ADMIN_BRAND}</h2>
          <p>
            Move operational settings out of the codebase. Administrators change discovery, messaging,
            signals, consultations, payments, notifications, verification, moderation, matching, and AI
            behavior without redeploying.
          </p>
        </div>
        <div className="configuration-platform-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(FEATURE_FLAG_PLATFORM_ADMIN_PATH)}
          >
            Feature flags
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

      <ConfigurationCard metrics={bundle.metrics} pendingApprovals={bundle.pendingApprovals.length} />

      <div className="configuration-platform-page__body">
        <RemoteConfigEntriesCard
          entries={bundle.entries}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onRollback={handleRollback}
        />
        <AuditHistoryCard auditHistory={bundle.auditHistory} snapshots={bundle.snapshots} />
      </div>

      <footer className="configuration-platform-page__future">
        <h4>SDK & safeguards</h4>
        <p>
          Client: <code>useRemoteConfig(key)</code> · Server cache · Offline fallback ·{" "}
          {Object.keys(REMOTE_CONFIG_DEFAULTS).length} default keys
        </p>
        <ul>
          {CONFIGURATION_PLATFORM_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p>{CONFIGURATION_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {CONFIGURATION_PLATFORM_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
