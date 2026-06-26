import {
  SECURITY_OPS_MODULES,
  SECURITY_OPS_SCORE_DOMAINS,
  type SecurityOpsModuleId,
  type SecurityOpsScoreId
} from "../constants/securityOperationsCenter";
import type {
  SecurityOpsActionRecord,
  SecurityOpsEvent,
  SecurityOpsIncident,
  SecurityOpsScore
} from "../types/securityOperationsCenter";

const NOW = "2026-06-26T12:00:00.000Z";

const SCORE_VALUES: Record<SecurityOpsScoreId, number> = {
  authentication: 94,
  authorization: 91,
  infrastructure: 96,
  payments: 97,
  notifications: 92,
  storage: 95,
  database: 93
};

function scoreStatus(score: number): SecurityOpsScore["status"] {
  if (score >= 92) return "healthy";
  if (score >= 82) return "warning";
  return "critical";
}

export const SECURITY_OPS_SCORE_SEED: SecurityOpsScore[] = SECURITY_OPS_SCORE_DOMAINS.map(
  (domain) => ({
    id: domain.id,
    label: domain.label,
    score: SCORE_VALUES[domain.id],
    status: scoreStatus(SCORE_VALUES[domain.id])
  })
);

const MODULE_EVENTS: Record<SecurityOpsModuleId, Omit<SecurityOpsEvent, "id" | "eventRef" | "moduleId">[]> = {
  authentication: [
    {
      severity: "warning",
      title: "Repeated PIN failures from single subnet",
      actor: "system",
      target: "41.203.*.*",
      occurredAt: "2026-06-26T11:45:00.000Z",
      detail: "12 failed PIN attempts in 5 minutes — rate limit applied"
    }
  ],
  "suspicious-logins": [
    {
      severity: "warning",
      title: "Login from new device and country",
      actor: "member_***42",
      target: "Lagos → London",
      occurredAt: "2026-06-26T10:20:00.000Z",
      detail: "Impossible travel pattern flagged for review"
    }
  ],
  "permission-changes": [
    {
      severity: "healthy",
      title: "Governance role updated",
      actor: "governance@bamsignal.com",
      target: "ManageCompliance",
      occurredAt: "2026-06-25T16:00:00.000Z",
      detail: "Permission change audited and approved"
    }
  ],
  "privilege-escalation": [
    {
      severity: "critical",
      title: "Blocked admin route probe",
      actor: "unknown",
      target: "/hard/command",
      occurredAt: "2026-06-26T09:30:00.000Z",
      detail: "Unauthenticated request to protected admin path — blocked"
    }
  ],
  "api-abuse": [
    {
      severity: "warning",
      title: "API rate limit burst",
      actor: "client_***88",
      target: "/api/member/profile",
      occurredAt: "2026-06-26T08:15:00.000Z",
      detail: "240 requests/min exceeded threshold"
    }
  ],
  "token-anomalies": [
    {
      severity: "warning",
      title: "JWT replay attempt detected",
      actor: "system",
      target: "session_***19",
      occurredAt: "2026-06-26T07:50:00.000Z",
      detail: "Revoked token reuse blocked"
    }
  ],
  "session-anomalies": [
    {
      severity: "warning",
      title: "Concurrent sessions from 4 IPs",
      actor: "member_***55",
      target: "4 active sessions",
      occurredAt: "2026-06-26T06:40:00.000Z",
      detail: "Session hygiene alert — invalidate recommended"
    }
  ],
  "brute-force-attempts": [
    {
      severity: "critical",
      title: "OTP brute-force cluster",
      actor: "41.190.*.*",
      target: "otp_login",
      occurredAt: "2026-06-26T05:20:00.000Z",
      detail: "86 OTP attempts in 10 minutes — IP temporarily blocked"
    }
  ],
  "rate-limit-triggers": [
    {
      severity: "healthy",
      title: "Signup throttle activated",
      actor: "system",
      target: "signup",
      occurredAt: "2026-06-26T04:10:00.000Z",
      detail: "Abuse protection rate limit triggered and cleared"
    }
  ],
  "admin-activity": [
    {
      severity: "healthy",
      title: "Admin session started",
      actor: "ops@bamsignal.com",
      target: "security-ops-center",
      occurredAt: NOW,
      detail: "Admin accessed Security Operations Center"
    }
  ]
};

export const SECURITY_OPS_EVENT_SEED: SecurityOpsEvent[] = SECURITY_OPS_MODULES.flatMap(
  (module, moduleIndex) =>
    (MODULE_EVENTS[module.id] ?? []).map((event, eventIndex) => ({
      id: `soe_${moduleIndex + 1}_${eventIndex + 1}`,
      eventRef: `SOE-2026-${String(moduleIndex * 10 + eventIndex + 1).padStart(4, "0")}`,
      moduleId: module.id,
      ...event
    }))
);

export const SECURITY_OPS_INCIDENT_SEED: SecurityOpsIncident[] = [
  {
    id: "soi_001",
    incidentRef: "SEC-2026-0042",
    title: "OTP brute-force cluster — Lagos subnet",
    status: "contained",
    severity: "critical",
    openedAt: "2026-06-26T05:20:00.000Z",
    ownerEmail: "security@bamsignal.com",
    timeline: [
      { at: "2026-06-26T05:20:00.000Z", actor: "system", note: "Incident opened — brute-force detected" },
      { at: "2026-06-26T05:25:00.000Z", actor: "security@bamsignal.com", note: "Investigating — IP range identified" },
      { at: "2026-06-26T05:40:00.000Z", actor: "security@bamsignal.com", note: "Temporary block applied" },
      { at: "2026-06-26T06:10:00.000Z", actor: "security@bamsignal.com", note: "Contained — monitoring for recurrence" }
    ]
  },
  {
    id: "soi_002",
    incidentRef: "SEC-2026-0040",
    title: "Admin route probe attempt",
    status: "investigating",
    severity: "warning",
    openedAt: "2026-06-26T09:30:00.000Z",
    ownerEmail: "security@bamsignal.com",
    timeline: [
      { at: "2026-06-26T09:30:00.000Z", actor: "system", note: "Unauthenticated admin path access blocked" },
      { at: "2026-06-26T09:45:00.000Z", actor: "security@bamsignal.com", note: "Investigating source IP and patterns" }
    ]
  },
  {
    id: "soi_003",
    incidentRef: "SEC-2026-0038",
    title: "JWT replay attempt — resolved",
    status: "resolved",
    severity: "warning",
    openedAt: "2026-06-24T14:00:00.000Z",
    resolvedAt: "2026-06-24T15:30:00.000Z",
    ownerEmail: "security@bamsignal.com",
    timeline: [
      { at: "2026-06-24T14:00:00.000Z", actor: "system", note: "Revoked token reuse detected" },
      { at: "2026-06-24T15:30:00.000Z", actor: "security@bamsignal.com", note: "Sessions invalidated — resolved" }
    ]
  }
];

export const SECURITY_OPS_ACTION_SEED: SecurityOpsActionRecord[] = [
  {
    id: "soa_001",
    toolId: "temporary-block",
    target: "41.190.*.*",
    actor: "security@bamsignal.com",
    executedAt: "2026-06-26T05:40:00.000Z",
    result: "IP range blocked for 24 hours"
  },
  {
    id: "soa_002",
    toolId: "invalidate-sessions",
    target: "member_***55",
    actor: "security@bamsignal.com",
    executedAt: "2026-06-26T06:45:00.000Z",
    result: "4 sessions invalidated"
  }
];
