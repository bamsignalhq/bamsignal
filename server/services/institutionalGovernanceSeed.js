/**
 * Server-side governance seed — constitutional defaults (mirrors client seed).
 */

const NOW = "2026-06-25T12:00:00.000Z";

const ROLE_IDS = {
  founder: "g1000000-0000-4000-8000-000000000001",
  "chief-executive-officer": "g1000000-0000-4000-8000-000000000002",
  "chief-operations-officer": "g1000000-0000-4000-8000-000000000003",
  "operations-director": "g1000000-0000-4000-8000-000000000010",
  "operations-coordinator": "g1000000-0000-4000-8000-000000000011",
  "chief-financial-officer": "g1000000-0000-4000-8000-000000000006",
  "finance-manager": "g1000000-0000-4000-8000-000000000023",
  "read-only-executive": "g1000000-0000-4000-8000-000000000028",
  "guest-reviewer": "g1000000-0000-4000-8000-000000000029",
  "relationship-consultant": "g1000000-0000-4000-8000-000000000012"
};

const ALL_PERMISSIONS = [
  "view-members",
  "edit-members",
  "delete-members",
  "assign-consultant",
  "transfer-journey",
  "approve-journey",
  "approve-refund",
  "issue-refund",
  "view-finance",
  "manage-finance",
  "view-executive-dashboard",
  "manage-governance",
  "manage-operations",
  "manage-crm",
  "manage-careers",
  "manage-support",
  "manage-safety",
  "manage-research",
  "publish-research",
  "manage-events",
  "manage-institute",
  "manage-documents",
  "manage-policies",
  "manage-community",
  "manage-notifications",
  "manage-messaging",
  "manage-scheduling",
  "manage-payments",
  "manage-consultant-qa",
  "manage-executive-reports",
  "manage-archives",
  "manage-legacy",
  "manage-success-stories",
  "manage-compliance",
  "view-audit-logs",
  "export-reports",
  "system-administration",
  "manage-consultants",
  "manage-introductions",
  "manage-follow-ups",
  "manage-recovery"
];

const DIRECT_PERMISSIONS = {
  founder: ALL_PERMISSIONS,
  "chief-executive-officer": ALL_PERMISSIONS.filter((slug) => slug !== "system-administration"),
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
  "read-only-executive": [
    "view-members",
    "view-finance",
    "view-executive-dashboard",
    "manage-archives",
    "manage-research",
    "view-audit-logs"
  ],
  "guest-reviewer": ["view-audit-logs"],
  "relationship-consultant": [
    "view-members",
    "manage-introductions",
    "manage-follow-ups",
    "manage-scheduling"
  ]
};

const GOVERNANCE_ROLE_SEED = Object.entries(ROLE_IDS).map(([slug, id]) => ({
  id,
  slug,
  label: slug,
  parentRoleId:
    slug === "chief-executive-officer"
      ? ROLE_IDS.founder
      : slug === "operations-director"
        ? ROLE_IDS["chief-operations-officer"]
        : slug === "read-only-executive"
          ? ROLE_IDS["chief-executive-officer"]
          : slug === "guest-reviewer"
            ? ROLE_IDS["read-only-executive"]
            : slug === "relationship-consultant"
              ? ROLE_IDS["chief-operations-officer"]
              : undefined,
  hierarchyLevel: 0,
  isConfigurable: true,
  createdAt: NOW,
  updatedAt: NOW
}));

const GOVERNANCE_ROLE_PERMISSION_SEED = [];
let counter = 1;
for (const [roleSlug, permissions] of Object.entries(DIRECT_PERMISSIONS)) {
  const roleId = ROLE_IDS[roleSlug];
  if (!roleId) continue;
  for (const permissionSlug of permissions) {
    GOVERNANCE_ROLE_PERMISSION_SEED.push({
      id: `rp100000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
      roleId,
      permissionSlug,
      granted: true
    });
    counter += 1;
  }
}

export const GOVERNANCE_ASSIGNMENT_SEED = [
  {
    id: "ga100000-0000-4000-8000-000000000001",
    roleId: ROLE_IDS.founder,
    roleSlug: "founder",
    operatorEmail: "founder@bamsignal.com",
    isPrimary: true,
    startsAt: NOW
  }
];

export const GOVERNANCE_DELEGATION_SEED = [
  {
    id: "dl100000-0000-4000-8000-000000000001",
    delegatorEmail: "ops-director@bamsignal.com",
    delegateEmail: "ops-coordinator@bamsignal.com",
    permissionSlugs: ["manage-operations", "manage-scheduling", "assign-consultant"],
    startsAt: "2026-06-20T00:00:00.000Z",
    endsAt: "2026-07-20T00:00:00.000Z",
    status: "active"
  },
  {
    id: "dl100000-0000-4000-8000-000000000002",
    delegatorEmail: "ops-director@bamsignal.com",
    delegateEmail: "ops-coordinator@bamsignal.com",
    permissionSlugs: ["manage-operations"],
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2026-01-31T00:00:00.000Z",
    status: "active"
  }
];

export const GOVERNANCE_APPROVAL_SEED = [
  {
    id: "ap100000-0000-4000-8000-000000000001",
    domainId: "consultant-onboarding",
    moduleId: "concierge",
    entityRef: "sc_consultant_new",
    status: "pending",
    makerEmail: "ops@bamsignal.com",
    title: "Onboard consultant"
  }
];

export function getInstitutionalGovernanceSeedState() {
  return {
    roles: GOVERNANCE_ROLE_SEED,
    rolePermissions: GOVERNANCE_ROLE_PERMISSION_SEED,
    directPermissionsByRole: DIRECT_PERMISSIONS,
    assignments: GOVERNANCE_ASSIGNMENT_SEED,
    delegations: GOVERNANCE_DELEGATION_SEED,
    approvals: GOVERNANCE_APPROVAL_SEED,
    approvalHistory: [],
    decisions: [],
    policies: [],
    acknowledgements: [],
    authorityMatrix: []
  };
}
