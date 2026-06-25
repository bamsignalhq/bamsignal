import type {
  BackupRecord,
  CriticalSystemRecord,
  DependencyLinkRecord,
  IncidentRecoveryRecord,
  PlaybookRecord,
  RecoveryOperationRecord,
  RecoveryTestRecord,
  RestoreHistoryRecord
} from "../types/recoveryCenter";
import { BACKUP_CATEGORIES, INCIDENT_PLAYBOOKS } from "../constants/recoveryCenter";

const NOW = "2026-06-25T12:00:00.000Z";

export const BACKUP_RECORD_SEED: BackupRecord[] = BACKUP_CATEGORIES.map((category, index) => ({
  id: `bkp_${index + 1}`,
  backupRef: `BKP-${category.id.toUpperCase().replace(/-/g, "_")}`,
  categoryId: category.id,
  status: index === 4 ? "warning" : "healthy",
  lastBackupAt: "2026-06-22T23:00:00.000Z",
  frequencyLabel: index === 5 ? "Weekly" : index < 2 ? "Every 6 hours" : "Daily",
  retentionDays: [30, 90, 90, 60, 365, 180][index] ?? 30,
  verifiedAt: index === 4 ? "2026-06-20T14:00:00.000Z" : "2026-06-22T23:30:00.000Z",
  sizeLabel: ["4.2 GB", "12 GB", "820 MB", "48 MB", "1.1 GB", "Encrypted"][index] ?? "—",
  nextScheduledAt: "2026-06-25T18:00:00.000Z"
}));

export const RECOVERY_OPERATION_SEED: RecoveryOperationRecord[] = [
  {
    id: "rop_001",
    operationRef: "ROP-PIT-001",
    modeId: "point-in-time-restore",
    target: "Postgres primary — 2026-06-10 16:00 UTC",
    status: "verified",
    initiatedAt: "2026-06-10T16:45:00.000Z",
    completedAt: "2026-06-10T17:30:00.000Z",
    initiatedBy: "ops@bamsignal.com",
    checklistComplete: true
  },
  {
    id: "rop_002",
    operationRef: "ROP-FULL-001",
    modeId: "full-restore",
    target: "Document Center export bundle",
    status: "completed",
    initiatedAt: "2026-06-15T10:00:00.000Z",
    completedAt: "2026-06-15T11:20:00.000Z",
    initiatedBy: "ops@bamsignal.com",
    checklistComplete: true
  },
  {
    id: "rop_003",
    operationRef: "ROP-PARTIAL-001",
    modeId: "partial-restore",
    target: "Audit logs — June 2026 slice",
    status: "in-progress",
    initiatedAt: "2026-06-25T09:00:00.000Z",
    initiatedBy: "ops@bamsignal.com",
    checklistComplete: false
  }
];

export const PLAYBOOK_RECORD_SEED: PlaybookRecord[] = INCIDENT_PLAYBOOKS.map((playbook, index) => ({
  id: `pb_${index + 1}`,
  playbookRef: `PB-${playbook.id.toUpperCase().replace(/-/g, "_")}`,
  playbookId: playbook.id,
  title: `${playbook.label} playbook`,
  owner: index < 4 ? "ops@bamsignal.com" : "founder@bamsignal.com",
  status: index === 6 ? "draft" : index % 2 === 0 ? "tested" : "ready",
  rtoMinutes: [30, 60, 45, 60, 90, 120, 240][index] ?? 60,
  rpoMinutes: [15, 30, 15, 30, 60, 60, 60][index] ?? 30,
  lastTestedAt: index === 6 ? null : "2026-06-01T14:00:00.000Z",
  steps: [
    `Detect ${playbook.label.toLowerCase()} via monitoring center.`,
    "Declare incident and notify leadership channel.",
    "Execute isolation and rollback procedures.",
    "Verify recovery checklist and member smoke path.",
    "Close incident with post-recovery audit note."
  ]
}));

export const RESTORE_HISTORY_SEED: RestoreHistoryRecord[] = [
  {
    id: "rst_001",
    restoreRef: "RST-2026-0012",
    modeId: "point-in-time-restore",
    categoryId: "database",
    status: "verified",
    startedAt: "2026-06-10T16:45:00.000Z",
    completedAt: "2026-06-10T17:30:00.000Z",
    verifiedAt: "2026-06-10T17:45:00.000Z",
    initiatedBy: "ops@bamsignal.com",
    notes: "Connection pool exhaustion — PITR to pre-incident state."
  },
  {
    id: "rst_002",
    restoreRef: "RST-2026-0011",
    modeId: "full-restore",
    categoryId: "documents",
    status: "verified",
    startedAt: "2026-06-15T10:00:00.000Z",
    completedAt: "2026-06-15T11:20:00.000Z",
    verifiedAt: "2026-06-15T11:30:00.000Z",
    initiatedBy: "ops@bamsignal.com"
  },
  {
    id: "rst_003",
    restoreRef: "RST-2026-0013",
    modeId: "partial-restore",
    categoryId: "audit-logs",
    status: "in-progress",
    startedAt: "2026-06-25T09:00:00.000Z",
    initiatedBy: "ops@bamsignal.com",
    notes: "Audit backup verification remediation in progress."
  }
];

export const RECOVERY_TEST_SEED: RecoveryTestRecord[] = [
  {
    id: "tst_001",
    testRef: "TST-DB-2026-Q2",
    playbookId: "database-failure",
    status: "passed",
    runAt: "2026-06-01T14:00:00.000Z",
    durationMinutes: 45,
    notes: "Tabletop simulation — RTO met."
  },
  {
    id: "tst_002",
    testRef: "TST-PAY-2026-Q2",
    playbookId: "payment-failure",
    status: "passed",
    runAt: "2026-06-05T10:00:00.000Z",
    durationMinutes: 30
  },
  {
    id: "tst_003",
    testRef: "TST-SEC-2026-Q3",
    playbookId: "security-incident",
    status: "scheduled",
    runAt: "2026-07-01T09:00:00.000Z",
    durationMinutes: 0,
    notes: "Quarterly security incident drill scheduled."
  }
];

export const CRITICAL_SYSTEM_SEED: CriticalSystemRecord[] = [
  {
    id: "sys_001",
    systemRef: "SYS-DB-PRIMARY",
    name: "Postgres primary database",
    tier: "tier-1",
    rtoMinutes: 30,
    backupCategoryId: "database",
    lastVerifiedAt: NOW
  },
  {
    id: "sys_002",
    systemRef: "SYS-PAYSTACK",
    name: "Paystack payment path",
    tier: "tier-1",
    rtoMinutes: 60,
    backupCategoryId: "configurations",
    lastVerifiedAt: NOW
  },
  {
    id: "sys_003",
    systemRef: "SYS-SUPABASE",
    name: "Supabase platform layer",
    tier: "tier-1",
    rtoMinutes: 45,
    backupCategoryId: "database",
    lastVerifiedAt: NOW
  },
  {
    id: "sys_004",
    systemRef: "SYS-STORAGE",
    name: "Member photo storage",
    tier: "tier-2",
    rtoMinutes: 120,
    backupCategoryId: "storage",
    lastVerifiedAt: NOW
  }
];

export const DEPENDENCY_LINK_SEED: DependencyLinkRecord[] = [
  {
    id: "dep_001",
    linkRef: "DEP-API-DB",
    upstream: "API server",
    downstream: "Postgres database",
    critical: true,
    failoverAvailable: false
  },
  {
    id: "dep_002",
    linkRef: "DEP-API-SUPABASE",
    upstream: "API server",
    downstream: "Supabase",
    critical: true,
    failoverAvailable: false
  },
  {
    id: "dep_003",
    linkRef: "DEP-PAY-API",
    upstream: "Paystack webhooks",
    downstream: "Payment API",
    critical: true,
    failoverAvailable: true
  },
  {
    id: "dep_004",
    linkRef: "DEP-NOTIFY-RESEND",
    upstream: "Notification queue",
    downstream: "Resend",
    critical: false,
    failoverAvailable: true
  }
];

export const INCIDENT_RECOVERY_SEED: IncidentRecoveryRecord[] = [
  {
    id: "incident_001",
    incidentRef: "REC-2026-0012",
    levelId: "minor-incident",
    title: "Notification queue lag spike",
    status: "recovered",
    startedAt: "2026-06-19T08:15:00.000Z",
    resolvedAt: "2026-06-19T09:05:00.000Z",
    owner: "ops@bamsignal.com",
    summary: "Delivery retries backed up after provider rate limit.",
    timeline: [
      {
        id: "rec_tl_0001",
        phase: "Detect",
        actor: "monitoring",
        timestamp: "2026-06-19T08:15:00.000Z",
        note: "Notification reliability metric crossed warning threshold."
      },
      {
        id: "rec_tl_0002",
        phase: "Recover",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-19T09:05:00.000Z",
        note: "Queue drained; delivery latency returned to baseline."
      }
    ]
  },
  {
    id: "incident_002",
    incidentRef: "REC-2026-0013",
    levelId: "major-incident",
    title: "Database connection pool exhaustion",
    status: "closed",
    startedAt: "2026-06-10T14:00:00.000Z",
    resolvedAt: "2026-06-10T17:30:00.000Z",
    owner: "ops@bamsignal.com",
    summary: "Restored from point-in-time database backup.",
    timeline: [
      {
        id: "rec_tl_0003",
        phase: "Restore",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-10T16:45:00.000Z",
        note: "Point-in-time restore initiated."
      }
    ]
  }
];

/** @deprecated use BACKUP_RECORD_SEED */
export const BACKUP_STATUS_SEED = BACKUP_RECORD_SEED.map((item) => ({
  ...item,
  areaId: item.categoryId
}));

/** @deprecated use PLAYBOOK_RECORD_SEED */
export const RECOVERY_PLANS_SEED = PLAYBOOK_RECORD_SEED;
