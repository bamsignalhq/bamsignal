import { useMemo, useState } from "react";
import {
  RECOVERY_CENTER_AREAS,
  RECOVERY_CENTER_FUTURE_ARCHITECTURE
} from "../../../constants/recoveryCenter";
import {
  RECOVERY_CENTER_ADMIN_BRAND,
  RECOVERY_CENTER_ADMIN_PATH
} from "../../../constants/recoveryCenterAdmin";
import type { RecoveryCenterAreaId } from "../../../constants/recoveryCenter";
import { buildRecoveryCenterBundle } from "../../../utils/recoveryCenterEngine";
import { BackupCard } from "./BackupCard";
import { PlaybookCard } from "./PlaybookCard";
import { RecoveryCard } from "./RecoveryCard";
import { RecoveryHealthCard } from "./RecoveryHealthCard";
import { RestoreHistoryCard } from "./RestoreHistoryCard";

export function RecoveryDashboardPage() {
  const [area, setArea] = useState<RecoveryCenterAreaId>("backups");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildRecoveryCenterBundle(area);
  }, [area, refreshKey]);

  const showOverview = area === "backups";
  const showBackupsCard = showOverview;
  const showRecovery = showOverview || area === "restore";
  const showPlaybooks = showOverview || area === "incident-playbooks" || area === "recovery-plans";
  const showHistory = showOverview || area === "restore" || area === "recovery-history";
  const showHealth = showOverview || area === "critical-systems";

  return (
    <div className="recovery-center-page">
      <header className="recovery-center-page__head">
        <div>
          <h2>{RECOVERY_CENTER_ADMIN_BRAND}</h2>
          <p>
            Assume failures will happen — design the institution to survive them. Centralized
            backups, restore operations, recovery plans, playbooks, critical systems, and
            dependency mapping.
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

      <nav className="recovery-center-page__areas" aria-label="Recovery areas">
        {RECOVERY_CENTER_AREAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`recovery-center-page__area-btn${area === item.id ? " is-active" : ""}`}
            onClick={() => setArea(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {showHealth ? <RecoveryHealthCard summary={bundle.summary} /> : null}

      {area === "recovery-testing" ? (
        <p className="recovery-center-page__note">
          Recovery testing runs: {bundle.recoveryTests.length} recorded —{" "}
          {bundle.recoveryTests.filter((item) => item.status === "passed").length} passed,{" "}
          {bundle.recoveryTests.filter((item) => item.status === "scheduled").length} scheduled.
        </p>
      ) : null}

      {area === "dependencies" ? (
        <ul className="recovery-center-page__deps">
          {bundle.dependencies.map((link) => (
            <li key={link.id}>
              <strong>{link.upstream}</strong> → {link.downstream}
              {link.critical ? " (critical)" : ""}
              {link.failoverAvailable ? " · failover available" : ""}
            </li>
          ))}
        </ul>
      ) : null}

      {area === "critical-systems" ? (
        <ul className="recovery-center-page__systems">
          {bundle.criticalSystems.map((system) => (
            <li key={system.id}>
              <strong>{system.name}</strong> — {system.tier}, RTO {system.rtoMinutes}m
            </li>
          ))}
        </ul>
      ) : null}

      <div className="recovery-center-page__body">
        <div className="recovery-center-page__column">
          {showBackupsCard ? <BackupCard backups={bundle.backups} /> : null}
          {showRecovery ? <RecoveryCard operations={bundle.operations} /> : null}
          {showPlaybooks ? <PlaybookCard playbooks={bundle.playbooks} /> : null}
        </div>
        <div className="recovery-center-page__column">
          {showHistory ? <RestoreHistoryCard history={bundle.restoreHistory} /> : null}
          {area !== "backups" && showHealth ? (
            <RecoveryHealthCard summary={bundle.summary} />
          ) : null}
        </div>
      </div>

      <footer className="recovery-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{RECOVERY_CENTER_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {RECOVERY_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
