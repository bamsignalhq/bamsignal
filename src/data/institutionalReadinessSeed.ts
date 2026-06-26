import type { ReadinessAuditDomainId, ReadinessSubsystemId } from "../types/institutionalReadiness";

export type ReadinessDependencySeed = {
  id: string;
  dependencyRef: string;
  upstreamId: ReadinessSubsystemId;
  downstreamId: ReadinessSubsystemId;
  critical: boolean;
};

export const READINESS_DEPENDENCY_SEED: ReadinessDependencySeed[] = [
  {
    id: "dep_001",
    dependencyRef: "DEP-PAY-SUPA",
    upstreamId: "supabase",
    downstreamId: "payments",
    critical: true
  },
  {
    id: "dep_002",
    dependencyRef: "DEP-PAY-AUTH",
    upstreamId: "authentication",
    downstreamId: "payments",
    critical: true
  },
  {
    id: "dep_003",
    dependencyRef: "DEP-NOTIF-SUPA",
    upstreamId: "supabase",
    downstreamId: "notifications",
    critical: true
  },
  {
    id: "dep_004",
    dependencyRef: "DEP-SCHED-NOTIF",
    upstreamId: "notifications",
    downstreamId: "scheduling",
    critical: true
  },
  {
    id: "dep_005",
    dependencyRef: "DEP-CRM-OPS",
    upstreamId: "operations",
    downstreamId: "crm",
    critical: true
  },
  {
    id: "dep_006",
    dependencyRef: "DEP-OPS-PERM",
    upstreamId: "permissions",
    downstreamId: "operations",
    critical: true
  },
  {
    id: "dep_007",
    dependencyRef: "DEP-JOURNEY-SUPA",
    upstreamId: "supabase",
    downstreamId: "journey-engine",
    critical: true
  },
  {
    id: "dep_008",
    dependencyRef: "DEP-INTRO-JOURNEY",
    upstreamId: "journey-engine",
    downstreamId: "introductions",
    critical: true
  },
  {
    id: "dep_009",
    dependencyRef: "DEP-INTRO-CRM",
    upstreamId: "crm",
    downstreamId: "introductions",
    critical: false
  },
  {
    id: "dep_010",
    dependencyRef: "DEP-FOLLOW-JOURNEY",
    upstreamId: "journey-engine",
    downstreamId: "follow-ups",
    critical: true
  },
  {
    id: "dep_011",
    dependencyRef: "DEP-FOLLOW-NOTIF",
    upstreamId: "notifications",
    downstreamId: "follow-ups",
    critical: false
  },
  {
    id: "dep_012",
    dependencyRef: "DEP-ARCHIVE-JOURNEY",
    upstreamId: "journey-engine",
    downstreamId: "archive",
    critical: true
  },
  {
    id: "dep_013",
    dependencyRef: "DEP-LEGACY-ARCHIVE",
    upstreamId: "archive",
    downstreamId: "legacy",
    critical: true
  },
  {
    id: "dep_014",
    dependencyRef: "DEP-SEC-PERM",
    upstreamId: "permissions",
    downstreamId: "security",
    critical: true
  },
  {
    id: "dep_015",
    dependencyRef: "DEP-SEC-AUTH",
    upstreamId: "authentication",
    downstreamId: "security",
    critical: true
  },
  {
    id: "dep_016",
    dependencyRef: "DEP-COMP-SEC",
    upstreamId: "security",
    downstreamId: "compliance",
    critical: true
  },
  {
    id: "dep_017",
    dependencyRef: "DEP-BACKUP-SUPA",
    upstreamId: "supabase",
    downstreamId: "backups",
    critical: true
  },
  {
    id: "dep_018",
    dependencyRef: "DEP-MON-SUPA",
    upstreamId: "supabase",
    downstreamId: "monitoring",
    critical: false
  },
  {
    id: "dep_019",
    dependencyRef: "DEP-EXEC-OPS",
    upstreamId: "operations",
    downstreamId: "executive-dashboard",
    critical: true
  },
  {
    id: "dep_020",
    dependencyRef: "DEP-EXEC-PAY",
    upstreamId: "payments",
    downstreamId: "executive-dashboard",
    critical: false
  },
  {
    id: "dep_021",
    dependencyRef: "DEP-ROUTE-PERM",
    upstreamId: "permissions",
    downstreamId: "routing",
    critical: false
  }
];

export const READINESS_SUBSYSTEM_CONTRACTS: Record<ReadinessSubsystemId, ReadinessSubsystemId[]> =
  READINESS_DEPENDENCY_SEED.reduce(
    (acc, dep) => {
      if (!acc[dep.downstreamId]) acc[dep.downstreamId] = [];
      acc[dep.downstreamId].push(dep.upstreamId);
      return acc;
    },
    {} as Record<ReadinessSubsystemId, ReadinessSubsystemId[]>
  );

/** Maps internal subsystem evaluators to founder audit domains. */
export const READINESS_AUDIT_DOMAIN_SUBSYSTEM_MAP: Record<
  ReadinessAuditDomainId,
  ReadinessSubsystemId[]
> = {
  infrastructure: ["routing", "supabase", "legacy"],
  security: ["security", "authentication", "permissions", "compliance"],
  payments: ["payments"],
  messaging: ["notifications"],
  matching: ["introductions", "journey-engine", "follow-ups"],
  concierge: ["crm", "scheduling"],
  support: ["operations"],
  operations: ["operations"],
  research: ["executive-dashboard"],
  communities: ["routing"],
  events: ["operations"],
  documentation: ["compliance", "archive"],
  release: ["monitoring"],
  backups: ["backups"],
  monitoring: ["monitoring"],
  abuse: ["security"],
  performance: ["monitoring", "executive-dashboard"]
};

/** Baseline scores for domains without dedicated subsystem evaluators. */
export const READINESS_AUDIT_DOMAIN_BASELINES: Partial<Record<ReadinessAuditDomainId, number>> = {
  research: 88,
  communities: 86,
  events: 84,
  documentation: 82,
  release: 90,
  abuse: 87,
  support: 85
};
