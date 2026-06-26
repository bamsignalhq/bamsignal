import type {
  DisasterBackupMonitorRecord,
  DisasterPlanRecord,
  DisasterRecoveryOperationRecord,
  DisasterSnapshotComparison
} from "../types/disasterRecovery";
import {
  DISASTER_BACKUP_MONITORS,
  DISASTER_PLANS,
  type DisasterBackupMonitorId
} from "../constants/disasterRecovery";

const NOW = "2026-06-26T06:00:00.000Z";

const MONITOR_META: Record<
  DisasterBackupMonitorId,
  { sizeLabel: string; retentionDays: number; frequencyLabel: string; snapshotRef: string }
> = {
  "database-backups": {
    sizeLabel: "4.8 GB",
    retentionDays: 30,
    frequencyLabel: "Every 6 hours",
    snapshotRef: "dr-db-20260626-0600"
  },
  "storage-backups": {
    sizeLabel: "18.2 GB",
    retentionDays: 90,
    frequencyLabel: "Daily",
    snapshotRef: "dr-stg-20260626-0000"
  },
  "configuration-backups": {
    sizeLabel: "12 MB",
    retentionDays: 60,
    frequencyLabel: "Daily",
    snapshotRef: "dr-cfg-20260626-0000"
  },
  "feature-flag-snapshots": {
    sizeLabel: "840 KB",
    retentionDays: 30,
    frequencyLabel: "Every 12 hours",
    snapshotRef: "dr-ff-20260626-0000"
  },
  "remote-config-snapshots": {
    sizeLabel: "1.2 MB",
    retentionDays: 30,
    frequencyLabel: "Every 12 hours",
    snapshotRef: "dr-rc-20260626-0000"
  },
  "release-snapshots": {
    sizeLabel: "220 MB",
    retentionDays: 14,
    frequencyLabel: "Per deploy",
    snapshotRef: "dr-rel-20260625-1842"
  }
};

export const DISASTER_BACKUP_MONITOR_SEED: DisasterBackupMonitorRecord[] =
  DISASTER_BACKUP_MONITORS.map((monitor, index) => {
    const meta = MONITOR_META[monitor.id];
    return {
      id: monitor.id,
      label: monitor.label,
      status: index === 3 ? "warning" : "healthy",
      lastBackupAt: index === 5 ? "2026-06-25T18:42:00.000Z" : NOW,
      lastVerifiedAt: index === 3 ? "2026-06-24T12:00:00.000Z" : NOW,
      sizeLabel: meta.sizeLabel,
      retentionDays: meta.retentionDays,
      frequencyLabel: meta.frequencyLabel,
      nextScheduledAt: "2026-06-26T12:00:00.000Z",
      snapshotRef: meta.snapshotRef
    };
  });

export const DISASTER_PLAN_SEED: DisasterPlanRecord[] = DISASTER_PLANS.map((plan, index) => ({
  id: plan.id,
  label: plan.label,
  status: index === 5 ? "draft" : index % 2 === 0 ? "tested" : "ready",
  rtoMinutes: [30, 60, 90, 45, 60, 240][index] ?? 60,
  rpoMinutes: [15, 30, 60, 15, 30, 60][index] ?? 30,
  owner: index >= 4 ? "founder@bamsignal.com" : "ops@bamsignal.com",
  lastTestedAt: index === 5 ? null : "2026-06-20T14:00:00.000Z",
  steps: [
    `Detect ${plan.label.toLowerCase()} via platform health and observability.`,
    "Activate incident channel and assign recovery commander.",
    "Isolate blast radius and preserve forensic snapshots.",
    "Execute restore or failover per runbook with integrity verification.",
    "Run member smoke path and close with post-incident report."
  ]
}));

export const DISASTER_OPERATION_SEED: DisasterRecoveryOperationRecord[] = [
  {
    id: "dro-001",
    operationId: "recovery-simulation",
    label: "Recovery simulation",
    target: "Database failure playbook",
    status: "completed",
    initiatedBy: "ops@bamsignal.com",
    initiatedAt: "2026-06-22T10:00:00.000Z",
    completedAt: "2026-06-22T10:42:00.000Z",
    detail: "Simulated PITR restore — 42 minutes, integrity verified."
  },
  {
    id: "dro-002",
    operationId: "verify-integrity",
    label: "Verify integrity",
    target: "Storage backups — dr-stg-20260626-0000",
    status: "completed",
    initiatedBy: "ops@bamsignal.com",
    initiatedAt: "2026-06-26T06:30:00.000Z",
    completedAt: "2026-06-26T06:45:00.000Z",
    detail: "Checksum match — 18.2 GB verified."
  },
  {
    id: "dro-003",
    operationId: "compare-snapshots",
    label: "Compare snapshots",
    target: "Feature flags — dr-ff-20260625 vs dr-ff-20260626",
    status: "completed",
    initiatedBy: "ops@bamsignal.com",
    initiatedAt: "2026-06-26T07:00:00.000Z",
    completedAt: "2026-06-26T07:05:00.000Z",
    detail: "2 flag diffs — expected rollout changes."
  }
];

export const DISASTER_COMPARISON_SEED: DisasterSnapshotComparison[] = [
  {
    id: "cmp-001",
    leftRef: "dr-ff-20260625-1200",
    rightRef: "dr-ff-20260626-0000",
    monitorId: "feature-flag-snapshots",
    diffCount: 2,
    comparedAt: "2026-06-26T07:05:00.000Z",
    summary: "2 flag changes — concierge_beta, android_push_v2"
  },
  {
    id: "cmp-002",
    leftRef: "dr-cfg-20260625-0000",
    rightRef: "dr-cfg-20260626-0000",
    monitorId: "configuration-backups",
    diffCount: 0,
    comparedAt: "2026-06-26T06:15:00.000Z",
    summary: "No configuration drift detected."
  }
];
