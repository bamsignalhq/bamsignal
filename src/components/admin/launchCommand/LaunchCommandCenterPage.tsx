import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LAUNCH_COMMAND_REFRESH_INTERVAL_MS,
  LAUNCH_COMMAND_SECTIONS
} from "../../../constants/launchCommandCenter";
import {
  LAUNCH_COMMAND_CENTER_ADMIN_BRAND,
  LAUNCH_COMMAND_CENTER_ADMIN_PATH
} from "../../../constants/launchCommandCenterAdmin";
import type { LaunchCommandSectionId } from "../../../constants/launchCommandCenter";
import { buildLiveLaunchCommandCenterBundle } from "../../../utils/launchCommandCenterEngine";
import { findSectionSnapshot } from "../../../utils/launchCommandCenterLogic";
import { LaunchCommandBoostIntegrityCard } from "./LaunchCommandBoostIntegrityCard";
import { LaunchCommandDiscoverCommerceCard } from "./LaunchCommandDiscoverCommerceCard";
import { LaunchCommandDiscreetMembershipCard } from "./LaunchCommandDiscreetMembershipCard";
import { LaunchCommandConciergeOpsCard } from "./LaunchCommandConciergeOpsCard";
import { LaunchCommandBlockersCard } from "./LaunchCommandBlockersCard";
import { LaunchCommandGoNoGoCard } from "./LaunchCommandGoNoGoCard";
import { LaunchCommandOperationsCard } from "./LaunchCommandOperationsCard";
import { LaunchCommandReadinessScoresCard } from "./LaunchCommandReadinessScoresCard";
import { LaunchCommandSectionCard } from "./LaunchCommandSectionCard";

export function LaunchCommandCenterPage() {
  const [section, setSection] = useState<LaunchCommandSectionId>("launch-readiness");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLiveLaunchCommandCenterBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, LAUNCH_COMMAND_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const activeSection = findSectionSnapshot(bundle.sections, section) ?? bundle.sections[0];

  return (
    <div className="launch-command-center-page">
      <header className="launch-command-center-page__head">
        <div>
          <h2>{LAUNCH_COMMAND_CENTER_ADMIN_BRAND}</h2>
          <p>
            Final operational command room for launch — one screen answering whether BamSignal can
            safely serve 100,000 members today. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      <LaunchCommandGoNoGoCard goNoGo={bundle.goNoGo} />
      <LaunchCommandReadinessScoresCard scores={bundle.readinessScores} />
      <LaunchCommandBlockersCard blockers={bundle.blockers} />

      <nav className="launch-command-center-page__sections" aria-label="Launch command sections">
        {LAUNCH_COMMAND_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`launch-command-center-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="launch-command-center-page__body">
        <div className="launch-command-center-page__column">
          {activeSection ? <LaunchCommandSectionCard section={activeSection} /> : null}
        </div>
        <div className="launch-command-center-page__column">
          <LaunchCommandOperationsCard
            services={bundle.criticalServices}
            incidents={bundle.incidents}
            deployments={bundle.deployments}
          />
          <LaunchCommandBoostIntegrityCard />
          <LaunchCommandDiscoverCommerceCard />
          <LaunchCommandDiscreetMembershipCard />
          <LaunchCommandConciergeOpsCard />
        </div>
      </div>

      <footer className="launch-command-center-page__foot">
        <span>Route: {LAUNCH_COMMAND_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
