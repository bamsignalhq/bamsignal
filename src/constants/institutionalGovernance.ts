/** Institutional Governance System™ — constitutional authority layer. */

export const INSTITUTIONAL_GOVERNANCE_BRAND = "Institutional Governance System™";

export const GOVERNANCE_APPROVAL_STATUSES = [
  "draft",
  "pending",
  "under-review",
  "approved",
  "rejected",
  "returned",
  "expired",
  "cancelled"
] as const;

export type GovernanceApprovalStatusId = (typeof GOVERNANCE_APPROVAL_STATUSES)[number];

export const GOVERNANCE_APPROVAL_STATUS_LABELS: Record<GovernanceApprovalStatusId, string> = {
  draft: "Draft",
  pending: "Pending",
  "under-review": "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
  expired: "Expired",
  cancelled: "Cancelled"
};

export const GOVERNANCE_APPROVAL_DOMAINS = [
  "consultant-onboarding",
  "consultant-suspension",
  "refund",
  "policy-publication",
  "research-publication",
  "legacy-archive",
  "success-story-publication",
  "executive-role-assignment",
  "finance-adjustment",
  "governance-update"
] as const;

export type GovernanceApprovalDomainId = (typeof GOVERNANCE_APPROVAL_DOMAINS)[number];

export const GOVERNANCE_APPROVAL_DOMAIN_LABELS: Record<GovernanceApprovalDomainId, string> = {
  "consultant-onboarding": "Consultant onboarding",
  "consultant-suspension": "Consultant suspension",
  refund: "Refund",
  "policy-publication": "Policy publication",
  "research-publication": "Research publication",
  "legacy-archive": "Legacy archive approval",
  "success-story-publication": "Success story publication",
  "executive-role-assignment": "Executive role assignment",
  "finance-adjustment": "Finance adjustment",
  "governance-update": "Governance update"
};

export const GOVERNANCE_PERMISSION_SLUGS = [
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
] as const;

export type GovernancePermissionSlug = (typeof GOVERNANCE_PERMISSION_SLUGS)[number];

export const GOVERNANCE_PERMISSION_LABELS: Record<GovernancePermissionSlug, string> = {
  "view-members": "View Members",
  "edit-members": "Edit Members",
  "delete-members": "Delete Members",
  "assign-consultant": "Assign Consultant",
  "transfer-journey": "Transfer Journey",
  "approve-journey": "Approve Journey",
  "approve-refund": "Approve Refund",
  "issue-refund": "Issue Refund",
  "view-finance": "View Finance",
  "manage-finance": "Manage Finance",
  "view-executive-dashboard": "View Executive Dashboard",
  "manage-governance": "Manage Governance",
  "manage-operations": "Manage Operations",
  "manage-crm": "Manage CRM",
  "manage-careers": "Manage Careers",
  "manage-support": "Manage Support",
  "manage-safety": "Manage Safety",
  "manage-research": "Manage Research",
  "publish-research": "Publish Research",
  "manage-events": "Manage Events",
  "manage-institute": "Manage Institute",
  "manage-documents": "Manage Documents",
  "manage-policies": "Manage Policies",
  "manage-community": "Manage Community",
  "manage-notifications": "Manage Notifications",
  "manage-messaging": "Manage Messaging",
  "manage-scheduling": "Manage Scheduling",
  "manage-payments": "Manage Payments",
  "manage-consultant-qa": "Manage Consultant QA",
  "manage-executive-reports": "Manage Executive Reports",
  "manage-archives": "Manage Archives",
  "manage-legacy": "Manage Legacy",
  "manage-success-stories": "Manage Success Stories",
  "manage-compliance": "Manage Compliance",
  "view-audit-logs": "View Audit Logs",
  "export-reports": "Export Reports",
  "system-administration": "System Administration",
  "manage-consultants": "Manage Consultants",
  "manage-introductions": "Manage Introductions",
  "manage-follow-ups": "Manage Follow-ups",
  "manage-recovery": "Manage Recovery"
};

export const GOVERNANCE_ROLE_SLUGS = [
  "founder",
  "chief-executive-officer",
  "chief-operations-officer",
  "chief-technology-officer",
  "chief-relationship-officer",
  "chief-financial-officer",
  "chief-research-officer",
  "executive-assistant",
  "operations-director",
  "operations-coordinator",
  "relationship-consultant",
  "senior-matchmaker",
  "compatibility-specialist",
  "family-values-advisor",
  "diaspora-consultant",
  "research-director",
  "research-associate",
  "community-director",
  "community-manager",
  "support-manager",
  "support-specialist",
  "compliance-officer",
  "finance-manager",
  "auditor",
  "safety-officer",
  "hr-director",
  "recruitment-manager",
  "read-only-executive",
  "guest-reviewer"
] as const;

export type GovernanceRoleSlug = (typeof GOVERNANCE_ROLE_SLUGS)[number];

export const GOVERNANCE_ROLE_LABELS: Record<GovernanceRoleSlug, string> = {
  founder: "Founder",
  "chief-executive-officer": "Chief Executive Officer",
  "chief-operations-officer": "Chief Operations Officer",
  "chief-technology-officer": "Chief Technology Officer",
  "chief-relationship-officer": "Chief Relationship Officer",
  "chief-financial-officer": "Chief Financial Officer",
  "chief-research-officer": "Chief Research Officer",
  "executive-assistant": "Executive Assistant",
  "operations-director": "Operations Director",
  "operations-coordinator": "Operations Coordinator",
  "relationship-consultant": "Relationship Consultant",
  "senior-matchmaker": "Senior Matchmaker",
  "compatibility-specialist": "Compatibility Specialist",
  "family-values-advisor": "Family Values Advisor",
  "diaspora-consultant": "Diaspora Consultant",
  "research-director": "Research Director",
  "research-associate": "Research Associate",
  "community-director": "Community Director",
  "community-manager": "Community Manager",
  "support-manager": "Support Manager",
  "support-specialist": "Support Specialist",
  "compliance-officer": "Compliance Officer",
  "finance-manager": "Finance Manager",
  auditor: "Auditor",
  "safety-officer": "Safety Officer",
  "hr-director": "HR Director",
  "recruitment-manager": "Recruitment Manager",
  "read-only-executive": "Read-only Executive",
  "guest-reviewer": "Guest Reviewer"
};

/** Maps legacy operator session roles to governance role slugs. */
export const LEGACY_ROLE_TO_GOVERNANCE_SLUG: Record<string, GovernanceRoleSlug> = {
  Admin: "founder",
  Executive: "read-only-executive",
  Operations: "operations-director",
  Consultant: "relationship-consultant",
  "Senior Matchmaker": "senior-matchmaker",
  "Compatibility Specialist": "compatibility-specialist",
  "Family Values Advisor": "family-values-advisor",
  "Diaspora Consultant": "diaspora-consultant",
  Support: "support-manager",
  Research: "research-director"
};

/** Maps legacy Permission union values to governance permission slugs. */
export const LEGACY_PERMISSION_TO_GOVERNANCE_SLUG: Record<string, GovernancePermissionSlug> = {
  ViewMembers: "view-members",
  EditMembers: "edit-members",
  DeleteMembers: "delete-members",
  AssignConsultants: "assign-consultant",
  TransferJourney: "transfer-journey",
  ApproveJourney: "approve-journey",
  ManageConsultants: "manage-consultants",
  ManagePayments: "manage-payments",
  ApproveRefund: "approve-refund",
  IssueRefund: "issue-refund",
  ManageScheduling: "manage-scheduling",
  ManageNotifications: "manage-notifications",
  ManageIntroductions: "manage-introductions",
  ManageFollowUps: "manage-follow-ups",
  ViewArchives: "manage-archives",
  ManageArchives: "manage-archives",
  ViewFinance: "view-finance",
  ManageFinance: "manage-finance",
  ViewResearch: "manage-research",
  PublishResearch: "publish-research",
  ViewExecutiveDashboard: "view-executive-dashboard",
  ManageGovernance: "manage-governance",
  ManageSupport: "manage-support",
  ManageSafety: "manage-safety",
  ManageDocuments: "manage-documents",
  ManagePolicies: "manage-policies",
  ManageCareers: "manage-careers",
  ManageOperations: "manage-operations",
  ManageCrm: "manage-crm",
  ManageEvents: "manage-events",
  ManageInstitute: "manage-institute",
  ManageCommunity: "manage-community",
  ManageMessaging: "manage-messaging",
  ManageConsultantQa: "manage-consultant-qa",
  ManageExecutiveReports: "manage-executive-reports",
  ManageLegacy: "manage-legacy",
  ManageSuccessStories: "manage-success-stories",
  ManageCompliance: "manage-compliance",
  ViewAuditLogs: "view-audit-logs",
  ExportReports: "export-reports",
  SystemAdministration: "system-administration",
  ManageRecovery: "manage-recovery"
};

export const GOVERNANCE_POLICY_SLUGS = [
  "privacy-policy",
  "code-of-conduct",
  "consultant-ethics",
  "relationship-standards",
  "security-policy",
  "confidentiality-agreement",
  "operations-manual",
  "research-standards"
] as const;

export type GovernancePolicySlug = (typeof GOVERNANCE_POLICY_SLUGS)[number];

export const GOVERNANCE_POLICY_LABELS: Record<GovernancePolicySlug, string> = {
  "privacy-policy": "Privacy Policy",
  "code-of-conduct": "Code of Conduct",
  "consultant-ethics": "Consultant Ethics",
  "relationship-standards": "Relationship Standards",
  "security-policy": "Security Policy",
  "confidentiality-agreement": "Confidentiality Agreement",
  "operations-manual": "Operations Manual",
  "research-standards": "Research Standards"
};

/** Documented only — not implemented. */
export const GOVERNANCE_FUTURE_ARCHITECTURE = [
  { id: "board-of-directors", label: "Board of Directors" },
  { id: "regional-governance", label: "Regional Governance" },
  { id: "independent-review-board", label: "Independent Review Board" },
  { id: "country-governance", label: "Country Governance" },
  { id: "external-advisors", label: "External Advisors" },
  { id: "advisory-council", label: "Advisory Council" }
] as const;

export const GOVERNANCE_DB_TABLES = [
  "governance_roles",
  "governance_permissions",
  "governance_role_permissions",
  "governance_assignments",
  "approval_requests",
  "approval_steps",
  "approval_history",
  "delegations",
  "executive_decisions",
  "policy_acknowledgements",
  "authority_matrix",
  "institutional_policies"
] as const;

export const GOVERNANCE_AUDIT_ACTIONS = [
  "governance-role-created",
  "governance-role-updated",
  "governance-permission-changed",
  "governance-approval-granted",
  "governance-approval-denied",
  "governance-delegation-created",
  "governance-delegation-expired",
  "governance-policy-acknowledged",
  "governance-authority-changed",
  "governance-decision-registered"
] as const;

export type GovernanceAuditActionId = (typeof GOVERNANCE_AUDIT_ACTIONS)[number];
