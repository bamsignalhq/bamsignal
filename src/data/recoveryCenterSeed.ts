import type {
  BackupStatusRecord,
  IncidentRecoveryRecord,
  RecoveryPlanRecord
} from "../types/recoveryCenter";

export const BACKUP_STATUS_SEED: BackupStatusRecord[] = [
  {
    id: "backup_001",
    areaId: "database-backups",
    status: "healthy",
    lastBackupAt: "2026-06-22T23:00:00.000Z",
    frequencyLabel: "Every 6 hours",
    retentionDays: 30,
    verifiedAt: "2026-06-22T23:30:00.000Z",
    sizeLabel: "4.2 GB",
    nextScheduledAt: "2026-06-23T05:00:00.000Z"
  },
  {
    id: "backup_002",
    areaId: "document-backups",
    status: "healthy",
    lastBackupAt: "2026-06-22T18:00:00.000Z",
    frequencyLabel: "Daily",
    retentionDays: 90,
    verifiedAt: "2026-06-22T19:00:00.000Z",
    sizeLabel: "820 MB",
    nextScheduledAt: "2026-06-23T18:00:00.000Z"
  },
  {
    id: "backup_003",
    areaId: "audit-backups",
    status: "warning",
    lastBackupAt: "2026-06-21T12:00:00.000Z",
    frequencyLabel: "Daily",
    retentionDays: 365,
    verifiedAt: "2026-06-20T14:00:00.000Z",
    sizeLabel: "1.1 GB",
    nextScheduledAt: "2026-06-23T12:00:00.000Z"
  },
  {
    id: "backup_004",
    areaId: "archive-backups",
    status: "healthy",
    lastBackupAt: "2026-06-22T06:00:00.000Z",
    frequencyLabel: "Weekly",
    retentionDays: 730,
    verifiedAt: "2026-06-22T08:00:00.000Z",
    sizeLabel: "2.6 GB",
    nextScheduledAt: "2026-06-29T06:00:00.000Z"
  },
  {
    id: "backup_005",
    areaId: "configuration-backups",
    status: "healthy",
    lastBackupAt: "2026-06-22T22:00:00.000Z",
    frequencyLabel: "Every 12 hours",
    retentionDays: 60,
    verifiedAt: "2026-06-22T22:15:00.000Z",
    sizeLabel: "48 MB",
    nextScheduledAt: "2026-06-23T10:00:00.000Z"
  }
];

export const RECOVERY_PLANS_SEED: RecoveryPlanRecord[] = [
  {
    id: "plan_001",
    levelId: "minor-incident",
    title: "Single-service rollback",
    owner: "ops@bamsignal.com",
    status: "tested",
    rtoMinutes: 30,
    rpoMinutes: 15,
    lastTestedAt: "2026-06-15T10:00:00.000Z",
    steps: [
      "Identify degraded service via system health dashboard.",
      "Rollback to last known good deployment.",
      "Verify /ready and member login smoke path.",
      "Post incident note to internal messaging."
    ]
  },
  {
    id: "plan_002",
    levelId: "major-incident",
    title: "Multi-service coordinated recovery",
    owner: "ops@bamsignal.com",
    status: "ready",
    rtoMinutes: 120,
    rpoMinutes: 60,
    lastTestedAt: "2026-06-01T14:00:00.000Z",
    steps: [
      "Declare major incident and notify leadership channel.",
      "Pause non-critical cron jobs and payment webhooks.",
      "Restore database from latest verified snapshot.",
      "Replay notification queue from audit backups.",
      "Run institutional readiness checklist before reopening."
    ]
  },
  {
    id: "plan_003",
    levelId: "critical-incident",
    title: "Data integrity and payment path recovery",
    owner: "founder@bamsignal.com",
    status: "tested",
    rtoMinutes: 240,
    rpoMinutes: 30,
    lastTestedAt: "2026-05-20T09:00:00.000Z",
    steps: [
      "Freeze member-facing writes and payment callbacks.",
      "Isolate corrupted tables using data integrity center.",
      "Restore from point-in-time database backup.",
      "Reconcile Paystack ledger against audit backups.",
      "Executive sign-off before traffic restoration."
    ]
  },
  {
    id: "plan_004",
    levelId: "disaster-recovery",
    title: "Full institution failover",
    owner: "founder@bamsignal.com",
    status: "draft",
    rtoMinutes: 480,
    rpoMinutes: 60,
    lastTestedAt: null,
    steps: [
      "Activate disaster recovery runbook and leadership bridge.",
      "Provision cold standby from archive and config backups.",
      "Restore all five backup areas in dependency order.",
      "Validate SEO public routes remain isolated from member shell.",
      "Communicate member status via announcements channel."
    ]
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
    summary: "Delivery retries backed up after provider rate limit. Cleared via queue drain.",
    timeline: [
      {
        id: "rec_tl_0001",
        phase: "Detect",
        actor: "system-health",
        timestamp: "2026-06-19T08:15:00.000Z",
        note: "Notification reliability metric crossed warning threshold."
      },
      {
        id: "rec_tl_0002",
        phase: "Triage",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-19T08:25:00.000Z",
        note: "Minor incident declared — no member data loss."
      },
      {
        id: "rec_tl_0003",
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
    summary: "Connection leak during audit export caused login failures. Restored from snapshot.",
    timeline: [
      {
        id: "rec_tl_0001",
        phase: "Detect",
        actor: "system-health",
        timestamp: "2026-06-10T14:00:00.000Z",
        note: "/ready returned 503 — database dependency degraded."
      },
      {
        id: "rec_tl_0002",
        phase: "Escalate",
        actor: "founder@bamsignal.com",
        timestamp: "2026-06-10T14:20:00.000Z",
        note: "Major incident declared — member login impacted."
      },
      {
        id: "rec_tl_0003",
        phase: "Restore",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-10T16:45:00.000Z",
        note: "Database restored from verified 6-hour snapshot."
      },
      {
        id: "rec_tl_0004",
        phase: "Close",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-10T17:30:00.000Z",
        note: "Recovery testing checklist completed — incident closed."
      }
    ]
  },
  {
    id: "incident_003",
    incidentRef: "REC-2026-0014",
    levelId: "critical-incident",
    title: "Audit backup verification overdue",
    status: "recovering",
    startedAt: "2026-06-21T12:00:00.000Z",
    resolvedAt: null,
    owner: "ops@bamsignal.com",
    summary: "Audit backup area in warning — verification past SLA. Recovery in progress.",
    timeline: [
      {
        id: "rec_tl_0001",
        phase: "Detect",
        actor: "recovery-center",
        timestamp: "2026-06-21T12:00:00.000Z",
        note: "Backup verification policy breach on audit-backups area."
      },
      {
        id: "rec_tl_0002",
        phase: "Remediate",
        actor: "ops@bamsignal.com",
        timestamp: "2026-06-22T10:00:00.000Z",
        note: "Manual verification run initiated — awaiting checksum confirmation."
      }
    ]
  }
];
