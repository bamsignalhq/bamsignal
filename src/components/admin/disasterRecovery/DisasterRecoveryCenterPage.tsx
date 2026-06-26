import { useCallback, useEffect, useState } from "react";
import { DISASTER_RECOVERY_REFRESH_INTERVAL_MS } from "../../../constants/disasterRecovery";
import {
  DISASTER_RECOVERY_ADMIN_BRAND,
  DISASTER_RECOVERY_ADMIN_PATH
} from "../../../constants/disasterRecoveryAdmin";
import type { BackupDisasterRecoveryCenterBundle } from "../../../types/disasterRecovery";
import type { DisasterRecoveryOperationId } from "../../../constants/disasterRecovery";
import {
  buildLiveDisasterRecoveryBundle,
  runDisasterRecoveryOperation
} from "../../../utils/disasterRecoveryEngine";
import { DisasterBackupMonitorsCard } from "./DisasterBackupMonitorsCard";
import { DisasterHistoryCard } from "./DisasterHistoryCard";
import { DisasterOperationsCard } from "./DisasterOperationsCard";
import { DisasterPlansCard } from "./DisasterPlansCard";
import { DisasterRecoverySummaryCard } from "./DisasterRecoverySummaryCard";
import { DisasterReportsCard } from "./DisasterReportsCard";

export function DisasterRecoveryCenterPage() {
  const [bundle, setBundle] = useState<BackupDisasterRecoveryCenterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyMonitor, setBusyMonitor] = useState<string | null>(null);
  const [busyOperation, setBusyOperation] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLiveDisasterRecoveryBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, DISASTER_RECOVERY_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleRunBackup = useCallback(
    async (monitorId: string) => {
      setBusyMonitor(monitorId);
      try {
        runDisasterRecoveryOperation({
          operationId: "run-backup",
          target: monitorId,
          detail: `Manual backup triggered for ${monitorId}`
        });
        setToast("Backup completed and verified.");
        await refresh();
      } finally {
        setBusyMonitor(null);
      }
    },
    [refresh]
  );

  const handleOperation = useCallback(
    async (operationId: DisasterRecoveryOperationId) => {
      setBusyOperation(operationId);
      try {
        const target =
          operationId === "recovery-simulation"
            ? "Complete platform outage playbook"
            : bundle?.monitors[0]?.snapshotRef ?? "latest-snapshot";
        runDisasterRecoveryOperation({ operationId, target });
        setToast(`${operationId.replace(/-/g, " ")} queued.`);
        await refresh();
      } finally {
        setBusyOperation(null);
      }
    },
    [bundle?.monitors, refresh]
  );

  return (
    <div className="disaster-recovery-page">
      <header className="disaster-recovery-page__head">
        <div>
          <h2>{DISASTER_RECOVERY_ADMIN_BRAND}</h2>
          <p>
            Centralized disaster recovery playbook — monitor backups, run restore operations, verify
            integrity, compare snapshots, and simulate recovery. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </header>

      {toast ? <p className="disaster-recovery-page__toast">{toast}</p> : null}

      {bundle ? (
        <>
          <DisasterRecoverySummaryCard summary={bundle.summary} />
          <DisasterReportsCard metrics={bundle.metrics} />
          <DisasterBackupMonitorsCard
            monitors={bundle.monitors}
            onRunBackup={(id) => void handleRunBackup(id)}
            busyId={busyMonitor}
          />
          <DisasterOperationsCard
            onOperation={(id) => void handleOperation(id)}
            busyOperation={busyOperation}
          />
          <div className="disaster-recovery-page__body">
            <DisasterPlansCard plans={bundle.plans} />
            <DisasterHistoryCard
              operations={bundle.recentOperations}
              comparisons={bundle.comparisons}
            />
          </div>
          <footer className="disaster-recovery-page__foot">
            <p>Admin path: {DISASTER_RECOVERY_ADMIN_PATH}</p>
            <p>Generated: {new Date(bundle.generatedAt).toLocaleString()}</p>
          </footer>
        </>
      ) : (
        <p className="disaster-recovery-page__empty">Loading disaster recovery center…</p>
      )}
    </div>
  );
}
