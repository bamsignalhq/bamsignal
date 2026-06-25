import {
  GOVERNANCE_PERMISSION_LABELS,
  GOVERNANCE_PERMISSION_SLUGS,
  GOVERNANCE_POLICY_LABELS,
  GOVERNANCE_POLICY_SLUGS,
  GOVERNANCE_ROLE_LABELS,
  GOVERNANCE_ROLE_SLUGS,
  type GovernancePermissionSlug,
  type GovernanceRoleSlug
} from "../constants/institutionalGovernance";
import type {
  ApprovalHistoryRecord,
  ApprovalRequestRecord,
  AuthorityMatrixRecord,
  DelegationRecord,
  ExecutiveDecisionRecord,
  GovernanceAssignmentRecord,
  GovernancePermissionRecord,
  GovernanceRolePermissionRecord,
  GovernanceRoleRecord,
  InstitutionalPolicyRecord,
  PolicyAcknowledgementRecord
} from "../types/institutionalGovernance";

const NOW = "2026-06-25T12:00:00.000Z";

const ROLE_IDS: Record<GovernanceRoleSlug, string> = Object.fromEntries(
  GOVERNANCE_ROLE_SLUGS.map((slug, index) => [
    slug,
    `g1000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
  ])
) as Record<GovernanceRoleSlug, string>;

const PERMISSION_IDS: Record<GovernancePermissionSlug, string> = Object.fromEntries(
  GOVERNANCE_PERMISSION_SLUGS.map((slug, index) => [
    slug,
    `p1000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
  ])
) as Record<GovernancePermissionSlug, string>;

const ROLE_PARENT: Partial<Record<GovernanceRoleSlug, GovernanceRoleSlug>> = {
  "chief-executive-officer": "founder",
  "chief-operations-officer": "chief-executive-officer",
  "chief-technology-officer": "chief-executive-officer",
  "chief-relationship-officer": "chief-executive-officer",
  "chief-financial-officer": "chief-executive-officer",
  "chief-research-officer": "chief-executive-officer",
  "executive-assistant": "chief-executive-officer",
  "operations-director": "chief-operations-officer",
  "operations-coordinator": "operations-director",
  "relationship-consultant": "chief-relationship-officer",
  "senior-matchmaker": "chief-relationship-officer",
  "compatibility-specialist": "chief-relationship-officer",
  "family-values-advisor": "chief-relationship-officer",
  "diaspora-consultant": "chief-relationship-officer",
  "research-director": "chief-research-officer",
  "research-associate": "research-director",
  "community-director": "chief-operations-officer",
  "community-manager": "community-director",
  "support-manager": "chief-operations-officer",
  "support-specialist": "support-manager",
  "compliance-officer": "chief-executive-officer",
  "finance-manager": "chief-financial-officer",
  auditor: "compliance-officer",
  "safety-officer": "chief-operations-officer",
  "hr-director": "chief-operations-officer",
  "recruitment-manager": "hr-director",
  "read-only-executive": "chief-executive-officer",
  "guest-reviewer": "read-only-executive"
};

function roleLevel(slug: GovernanceRoleSlug, visited = new Set<GovernanceRoleSlug>()): number {
  if (visited.has(slug)) return 0;
  visited.add(slug);
  const parent = ROLE_PARENT[slug];
  if (!parent) return 0;
  return 1 + roleLevel(parent, visited);
}

export const GOVERNANCE_ROLE_SEED: GovernanceRoleRecord[] = GOVERNANCE_ROLE_SLUGS.map((slug) => ({
  id: ROLE_IDS[slug],
  slug,
  label: GOVERNANCE_ROLE_LABELS[slug],
  parentRoleId: ROLE_PARENT[slug] ? ROLE_IDS[ROLE_PARENT[slug]!] : undefined,
  hierarchyLevel: roleLevel(slug),
  isConfigurable: true,
  description: `${GOVERNANCE_ROLE_LABELS[slug]} — institutional governance role.`,
  createdAt: NOW,
  updatedAt: NOW,
  createdBy: "governance_seed",
  updatedBy: "governance_seed"
}));

export const GOVERNANCE_PERMISSION_SEED: GovernancePermissionRecord[] = GOVERNANCE_PERMISSION_SLUGS.map(
  (slug) => ({
    id: PERMISSION_IDS[slug],
    slug,
    label: GOVERNANCE_PERMISSION_LABELS[slug],
    moduleId: slug.split("-").slice(0, 2).join("-"),
    description: `Governance permission: ${GOVERNANCE_PERMISSION_LABELS[slug]}`,
    createdAt: NOW,
    updatedAt: NOW
  })
);

const FOUNDER_PERMISSIONS: GovernancePermissionSlug[] = [...GOVERNANCE_PERMISSION_SLUGS];

const ROLE_DIRECT_PERMISSIONS: Partial<Record<GovernanceRoleSlug, GovernancePermissionSlug[]>> = {
  founder: FOUNDER_PERMISSIONS,
  "chief-executive-officer": FOUNDER_PERMISSIONS.filter((slug) => slug !== "system-administration"),
  "chief-operations-officer": [
    "view-members",
    "edit-members",
    "assign-consultant",
    "transfer-journey",
    "approve-journey",
    "manage-operations",
    "manage-crm",
    "manage-scheduling",
    "manage-notifications",
    "manage-messaging",
    "manage-consultants",
    "manage-introductions",
    "manage-follow-ups",
    "manage-support",
    "manage-safety",
    "manage-careers",
    "manage-documents",
    "manage-compliance",
    "view-audit-logs",
    "export-reports",
    "manage-recovery"
  ],
  "chief-financial-officer": [
    "view-finance",
    "manage-finance",
    "approve-refund",
    "issue-refund",
    "manage-payments",
    "view-audit-logs",
    "export-reports"
  ],
  "chief-research-officer": [
    "manage-research",
    "publish-research",
    "manage-institute",
    "view-audit-logs"
  ],
  "read-only-executive": [
    "view-members",
    "view-finance",
    "view-executive-dashboard",
    "manage-archives",
    "manage-research",
    "view-audit-logs"
  ],
  "guest-reviewer": ["view-audit-logs"],
  "operations-director": [
    "view-members",
    "edit-members",
    "assign-consultant",
    "manage-operations",
    "manage-crm",
    "manage-scheduling",
    "manage-consultants",
    "manage-introductions",
    "manage-follow-ups"
  ],
  "operations-coordinator": ["manage-scheduling"],
  "relationship-consultant": [
    "view-members",
    "manage-introductions",
    "manage-follow-ups",
    "manage-scheduling"
  ],
  "support-manager": ["view-members", "manage-support", "manage-notifications"],
  auditor: ["view-audit-logs", "export-reports", "manage-compliance"],
  "compliance-officer": ["manage-compliance", "view-audit-logs", "manage-policies"]
};

export function buildGovernanceRolePermissionSeed(): GovernanceRolePermissionRecord[] {
  const records: GovernanceRolePermissionRecord[] = [];
  let counter = 1;
  for (const role of GOVERNANCE_ROLE_SEED) {
    const direct = ROLE_DIRECT_PERMISSIONS[role.slug] ?? [];
    for (const permissionSlug of direct) {
      records.push({
        id: `rp100000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
        roleId: role.id,
        permissionId: PERMISSION_IDS[permissionSlug],
        permissionSlug,
        granted: true,
        createdAt: NOW,
        updatedAt: NOW
      });
      counter += 1;
    }
  }
  return records;
}

export const GOVERNANCE_ROLE_PERMISSION_SEED = buildGovernanceRolePermissionSeed();

export const GOVERNANCE_ASSIGNMENT_SEED: GovernanceAssignmentRecord[] = [
  {
    id: "ga100000-0000-4000-8000-000000000001",
    roleId: ROLE_IDS.founder,
    roleSlug: "founder",
    operatorEmail: "founder@bamsignal.com",
    isPrimary: true,
    startsAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "ga100000-0000-4000-8000-000000000002",
    roleId: ROLE_IDS["operations-director"],
    roleSlug: "operations-director",
    operatorEmail: "ops@bamsignal.com",
    isPrimary: true,
    startsAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const GOVERNANCE_APPROVAL_SEED: ApprovalRequestRecord[] = [
  {
    id: "ap100000-0000-4000-8000-000000000001",
    domainId: "consultant-onboarding",
    moduleId: "concierge",
    entityRef: "sc_consultant_new",
    status: "pending",
    makerEmail: "ops@bamsignal.com",
    makerRoleId: ROLE_IDS["operations-director"],
    title: "Onboard consultant — Chidi Okonkwo",
    summary: "Maker/checker separation — requires different authorized approver.",
    payload: { consultantId: "sc_consultant_new" },
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "ap100000-0000-4000-8000-000000000002",
    domainId: "refund",
    moduleId: "finance",
    entityRef: "FIN-REF-2026-0042",
    status: "under-review",
    makerEmail: "finance@bamsignal.com",
    makerRoleId: ROLE_IDS["finance-manager"],
    title: "Refund approval — consultation fee",
    summary: "₦75,000 consultation refund pending CFO approval.",
    payload: { amountNgn: 75000 },
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const GOVERNANCE_APPROVAL_HISTORY_SEED: ApprovalHistoryRecord[] = [
  {
    id: "ah100000-0000-4000-8000-000000000001",
    requestId: "ap100000-0000-4000-8000-000000000002",
    approverEmail: "cfo@bamsignal.com",
    decision: "returned",
    reason: "Requires member journey reference",
    comments: "Attach journey ID before approval.",
    decidedAt: NOW,
    createdAt: NOW
  }
];

export const GOVERNANCE_DELEGATION_SEED: DelegationRecord[] = [
  {
    id: "dl100000-0000-4000-8000-000000000001",
    delegatorEmail: "ops-director@bamsignal.com",
    delegateEmail: "ops-coordinator@bamsignal.com",
    delegatorRoleId: ROLE_IDS["operations-director"],
    delegateRoleId: ROLE_IDS["operations-coordinator"],
    permissionSlugs: ["manage-operations", "manage-scheduling", "assign-consultant"],
    startsAt: "2026-06-20T00:00:00.000Z",
    endsAt: "2026-07-20T00:00:00.000Z",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const GOVERNANCE_DECISION_SEED: ExecutiveDecisionRecord[] = [
  {
    id: "ed100000-0000-4000-8000-000000000001",
    decisionRef: "GOV-DEC-2026-0001",
    category: "governance",
    title: "Establish Institutional Governance System",
    summary: "Constitutional authority layer becomes single source of truth for permissions.",
    decidedBy: "founder@bamsignal.com",
    decidedAt: NOW,
    linkedModule: "governance",
    linkedEntityRef: "institutional-governance-system",
    record: { appendOnly: true },
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const GOVERNANCE_POLICY_SEED: InstitutionalPolicyRecord[] = GOVERNANCE_POLICY_SLUGS.map(
  (slug, index) => ({
    id: `po100000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    slug,
    title: GOVERNANCE_POLICY_LABELS[slug],
    version: "2026.1",
    category: "institutional",
    body: `${GOVERNANCE_POLICY_LABELS[slug]} — employees must acknowledge before operational access.`,
    requiresAcknowledgement: true,
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW
  })
);

export const GOVERNANCE_POLICY_ACK_SEED: PolicyAcknowledgementRecord[] = [
  {
    id: "pa100000-0000-4000-8000-000000000001",
    policyId: GOVERNANCE_POLICY_SEED[0].id,
    policySlug: "privacy-policy",
    policyVersion: "2026.1",
    operatorEmail: "founder@bamsignal.com",
    acknowledgedAt: NOW,
    ipAddress: "10.0.0.1",
    digitalSignature: "sig_founder_privacy_2026_1",
    createdAt: NOW
  }
];

export const GOVERNANCE_AUTHORITY_MATRIX_SEED: AuthorityMatrixRecord[] = [
  {
    id: "am100000-0000-4000-8000-000000000001",
    roleId: ROLE_IDS.founder,
    roleSlug: "founder",
    responsibilities: ["Institutional vision", "Governance authority", "Executive oversight"],
    reportingLine: "Board (future)",
    approvalLimits: { refundNgn: 5000000, hiring: "unlimited" },
    approvalAuthority: ["All domains"],
    operationalScope: ["Institution-wide"],
    financialAuthority: { limitNgn: "unlimited" },
    memberAuthority: ["Full member lifecycle"],
    consultantAuthority: ["Full consultant lifecycle"],
    researchAuthority: ["Publish", "Institute oversight"],
    documentAuthority: ["Publish policies", "Manage repository"],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "am100000-0000-4000-8000-000000000002",
    roleId: ROLE_IDS["chief-operations-officer"],
    roleSlug: "chief-operations-officer",
    responsibilities: ["Operations oversight", "Concierge coordination", "Support escalation"],
    reportingLine: "Chief Executive Officer",
    approvalLimits: { refundNgn: 500000 },
    approvalAuthority: ["consultant-onboarding", "consultant-suspension"],
    operationalScope: ["Operations", "Concierge", "Support", "Workforce"],
    financialAuthority: { limitNgn: 500000 },
    memberAuthority: ["View", "Edit", "Assign"],
    consultantAuthority: ["Onboard", "Suspend", "Transfer"],
    researchAuthority: ["View"],
    documentAuthority: ["View", "Acknowledge"],
    createdAt: NOW,
    updatedAt: NOW
  }
];

export function buildGovernanceRoleBySlug(): Record<GovernanceRoleSlug, GovernanceRoleRecord> {
  return Object.fromEntries(GOVERNANCE_ROLE_SEED.map((role) => [role.slug, role])) as Record<
    GovernanceRoleSlug,
    GovernanceRoleRecord
  >;
}

export function buildGovernanceRolePermissionMap(): Record<GovernanceRoleSlug, GovernancePermissionSlug[]> {
  const directByRole = Object.fromEntries(
    GOVERNANCE_ROLE_SEED.map((role) => [role.slug, [] as GovernancePermissionSlug[]])
  ) as Record<GovernanceRoleSlug, GovernancePermissionSlug[]>;

  for (const mapping of GOVERNANCE_ROLE_PERMISSION_SEED) {
    const role = GOVERNANCE_ROLE_SEED.find((item) => item.id === mapping.roleId);
    if (!role || !mapping.granted) continue;
    if (!directByRole[role.slug].includes(mapping.permissionSlug)) {
      directByRole[role.slug].push(mapping.permissionSlug);
    }
  }

  return directByRole;
}
