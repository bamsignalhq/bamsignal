import type {
  LaunchApprovalRecord,
  LaunchBlockerRecord,
  LaunchChecklistEntry,
  LaunchDependencyRecord,
  LaunchReadinessItem,
  LaunchRiskRecord,
  LaunchTimelineEvent
} from "../types/launchControlCenter";
import { LAUNCH_READINESS_DOMAINS } from "../constants/launchControlCenter";

const NOW = "2026-06-25T12:00:00.000Z";

const STATUS_CYCLE = ["ready", "ready", "needs-attention", "ready", "blocked", "not-started"] as const;

export const LAUNCH_READINESS_SEED: LaunchReadinessItem[] = LAUNCH_READINESS_DOMAINS.map(
  (domain, index) => ({
    id: `lr_${index + 1}`,
    readinessRef: `LR-${domain.id.toUpperCase().replace(/-/g, "_")}`,
    domainId: domain.id,
    status: STATUS_CYCLE[index % STATUS_CYCLE.length],
    score: domain.id === "payments" ? 72 : domain.id === "training" ? 65 : 88 + (index % 3),
    ownerEmail: index < 8 ? "ops@bamsignal.com" : "founder@bamsignal.com",
    lastReviewedAt: NOW,
    notes:
      domain.id === "payments"
        ? "Paystack webhook verification pending final production drill"
        : domain.id === "training"
          ? "Consultant academy onboarding runbook needs final sign-off"
          : undefined
  })
);

export const LAUNCH_CHECKLIST_SEED: LaunchChecklistEntry[] = LAUNCH_READINESS_DOMAINS.map(
  (domain, index) => ({
    id: `lc_${index + 1}`,
    checklistRef: `LC-${domain.id.toUpperCase().replace(/-/g, "_")}`,
    systemName: `${domain.label} institutional center`,
    domainId: domain.id,
    status: STATUS_CYCLE[index % STATUS_CYCLE.length],
    ownerEmail: "ops@bamsignal.com",
    updatedAt: NOW
  })
);

export const LAUNCH_BLOCKER_SEED: LaunchBlockerRecord[] = [
  {
    id: "blk_001",
    blockerRef: "BLK-2026-0003",
    title: "Payment webhook signature verification drill incomplete",
    severity: "critical",
    domainId: "payments",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-24T10:00:00.000Z"
  },
  {
    id: "blk_002",
    blockerRef: "BLK-2026-0002",
    title: "Consultant training completion below launch threshold",
    severity: "high",
    domainId: "training",
    status: "open",
    ownerEmail: "founder@bamsignal.com",
    openedAt: "2026-06-23T14:00:00.000Z"
  },
  {
    id: "blk_003",
    blockerRef: "BLK-2026-0001",
    title: "Android AAB asset verification stale",
    severity: "high",
    domainId: "infrastructure",
    status: "resolved",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-20T09:00:00.000Z",
    resolvedAt: "2026-06-22T16:00:00.000Z"
  }
];

export const LAUNCH_RISK_SEED: LaunchRiskRecord[] = [
  {
    id: "risk_001",
    riskRef: "RISK-2026-0005",
    title: "Sendchamp WhatsApp delivery rate variability",
    severity: "medium",
    domainId: "operations",
    status: "open",
    mitigation: "Fallback to email for critical concierge notifications",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-21T11:00:00.000Z"
  },
  {
    id: "risk_002",
    riskRef: "RISK-2026-0004",
    title: "Regional SEO pages not yet indexed for all launch cities",
    severity: "low",
    domainId: "documentation",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-19T08:00:00.000Z"
  },
  {
    id: "risk_003",
    riskRef: "RISK-2026-0003",
    title: "Database migration 0015 not yet applied in production",
    severity: "high",
    domainId: "infrastructure",
    status: "resolved",
    mitigation: "Applied during Coolify deploy window",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-18T10:00:00.000Z",
    resolvedAt: "2026-06-20T12:00:00.000Z"
  }
];

export const LAUNCH_DEPENDENCY_SEED: LaunchDependencyRecord[] = [
  {
    id: "dep_001",
    dependencyRef: "DEP-PAY-AUTH",
    name: "Payments require authentication",
    upstream: "Authentication",
    downstream: "Payments (Paystack)",
    critical: true,
    status: "ready"
  },
  {
    id: "dep_002",
    dependencyRef: "DEP-CONSULT-SCHED",
    name: "Consultations require scheduling",
    upstream: "Scheduling (Google Calendar)",
    downstream: "Signal Concierge",
    critical: true,
    status: "ready"
  },
  {
    id: "dep_003",
    dependencyRef: "DEP-MONITOR-OPS",
    name: "Operations depends on monitoring",
    upstream: "Monitoring Center",
    downstream: "Operations Center",
    critical: true,
    status: "needs-attention"
  },
  {
    id: "dep_004",
    dependencyRef: "DEP-BACKUP-DB",
    name: "Database depends on backup verification",
    upstream: "Recovery Center backups",
    downstream: "Database",
    critical: true,
    status: "ready"
  }
];

export const LAUNCH_TIMELINE_SEED: LaunchTimelineEvent[] = [
  {
    id: "tl_001",
    eventRef: "TL-001",
    title: "Final institutional audit bundle complete",
    phase: "Readiness",
    scheduledAt: "2026-06-20T00:00:00.000Z",
    completedAt: "2026-06-20T18:00:00.000Z",
    ownerEmail: "ops@bamsignal.com",
    status: "completed"
  },
  {
    id: "tl_002",
    eventRef: "TL-002",
    title: "Payment production drill",
    phase: "Verification",
    scheduledAt: "2026-06-26T10:00:00.000Z",
    ownerEmail: "ops@bamsignal.com",
    status: "scheduled"
  },
  {
    id: "tl_003",
    eventRef: "TL-003",
    title: "Executive Go/No-Go review",
    phase: "Approval",
    scheduledAt: "2026-06-27T14:00:00.000Z",
    ownerEmail: "founder@bamsignal.com",
    status: "scheduled"
  },
  {
    id: "tl_004",
    eventRef: "TL-004",
    title: "Public launch window",
    phase: "Launch",
    scheduledAt: "2026-07-01T06:00:00.000Z",
    ownerEmail: "founder@bamsignal.com",
    status: "scheduled"
  }
];

export const LAUNCH_APPROVAL_SEED: LaunchApprovalRecord[] = [
  {
    id: "appr_exec",
    role: "executive",
    status: "pending",
    notes: "Awaiting payment drill completion"
  },
  {
    id: "appr_founder",
    role: "founder",
    status: "pending",
    notes: "Conditional on critical blocker resolution"
  }
];

export const LAUNCH_RECOMMENDATIONS_SEED = [
  "Complete Paystack webhook production drill before Go decision.",
  "Resolve consultant training threshold — currently below launch bar.",
  "Verify Android release assets are fresh before store submission.",
  "Confirm all 6 disaster recovery backup categories show healthy status.",
  "Executive and founder sign-off required for public launch window."
];
