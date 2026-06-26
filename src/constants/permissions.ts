import type { AuditAdminView, ConciergeAdminView } from "./hardRoutes";
import { hardPathForTab } from "./hardRoutes";
import type { HardTab } from "../components/admin/adminConsoleNav";
import { normalizePath } from "./routePath";
import { NOTIFICATION_RELIABILITY_ADMIN_PATH } from "./notificationReliabilityAdmin";
import { SYSTEM_HEALTH_ADMIN_PATH } from "./systemHealthAdmin";
import { INSTITUTIONAL_COMPLIANCE_ADMIN_PATH } from "./institutionalComplianceAdmin";
import { AUDIT_CENTER_ADMIN_PATH } from "./auditCenterAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "./routeAudit";
import { DATABASE_AUDIT_ADMIN_PATH } from "./databaseAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "./permissionsAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "./journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "./launchReadiness";
import { REMEDIATION_BOARD_ADMIN_PATH } from "./remediationBoardAdmin";
import { INSTITUTIONAL_READINESS_ADMIN_PATH } from "./institutionalReadinessAdmin";
import { DATA_INTEGRITY_ADMIN_PATH } from "./dataIntegrityAdmin";
import { RECOVERY_CENTER_ADMIN_PATH } from "./recoveryCenterAdmin";
import { INSTITUTIONAL_GOVERNANCE_ADMIN_PATH } from "./institutionalGovernanceAdmin";
import { WORKFORCE_MANAGEMENT_ADMIN_PATH } from "./workforceAdmin";
import { BUSINESS_CONTINUITY_ADMIN_PATH } from "./businessContinuityAdmin";
import { DOCUMENT_CENTER_ADMIN_PATH } from "./documentCenterAdmin";
import { INSTITUTIONAL_POLICIES_ADMIN_PATH } from "./institutionalPoliciesAdmin";
import { CONFIGURATION_PLATFORM_ADMIN_PATH } from "./configurationPlatformAdmin";
import { MONITORING_CENTER_ADMIN_PATH } from "./monitoringCenterAdmin";
import { DATA_GOVERNANCE_CENTER_ADMIN_PATH } from "./dataGovernanceCenterAdmin";
import { API_PLATFORM_ADMIN_PATH } from "./apiPlatformAdmin";
import { LAUNCH_CONTROL_CENTER_ADMIN_PATH } from "./launchControlCenterAdmin";
import { PERFORMANCE_CENTER_ADMIN_PATH } from "./performanceCenterAdmin";
import { WORKFLOW_ENGINE_ADMIN_PATH } from "./workflowEngineAdmin";
import { PRODUCTION_SECURITY_ADMIN_PATH } from "./productionSecurityAdmin";
import { UX_CONSISTENCY_ADMIN_PATH } from "./uxConsistencyAdmin";
import { PRODUCTION_PERFORMANCE_ADMIN_PATH } from "./productionPerformanceAdmin";
import { LAUNCH_CERTIFICATION_ADMIN_PATH } from "./launchCertificationAdmin";
import { PERFORMANCE_CERTIFICATION_ADMIN_PATH } from "./performanceCertificationAdmin";
import { SECURITY_CERTIFICATION_ADMIN_PATH } from "./securityCertificationAdmin";
import { RELIABILITY_CERTIFICATION_ADMIN_PATH } from "./reliabilityCertificationAdmin";
import { FOUNDER_CERTIFICATION_ADMIN_PATH } from "./founderCertificationAdmin";
import { DEPENDENCY_CERTIFICATION_ADMIN_PATH } from "./dependencyCertificationAdmin";
import { DRIFT_CERTIFICATION_ADMIN_PATH } from "./driftCertificationAdmin";
import { ENTERPRISE_CODEBASE_CLEANUP_ADMIN_PATH } from "./enterpriseCodebaseCleanupAdmin";
import { PRODUCTION_ENVIRONMENT_ADMIN_PATH } from "./productionEnvironmentAdmin";
import { LAUNCH_INFRASTRUCTURE_ADMIN_PATH } from "./launchInfrastructureAdmin";
import { FOUNDER_ACCEPTANCE_ADMIN_PATH } from "./founderAcceptanceAdmin";
import { PRODUCTION_OBSERVABILITY_ADMIN_PATH } from "./productionObservabilityAdmin";
import { FEATURE_FLAG_PLATFORM_ADMIN_PATH } from "./featureFlagPlatformAdmin";
import { PLATFORM_HEALTH_ADMIN_PATH } from "./platformHealthAdmin";
import { ABUSE_PROTECTION_ADMIN_PATH } from "./abuseProtectionAdmin";
import { SEARCH_CENTER_ADMIN_PATH } from "./searchCenterAdmin";
import { DISASTER_RECOVERY_ADMIN_PATH } from "./disasterRecoveryAdmin";
import { LAUNCH_COMMAND_CENTER_ADMIN_PATH } from "./launchCommandCenterAdmin";
import { QA_CERTIFICATION_CENTER_ADMIN_PATH } from "./qualityAssuranceCenterAdmin";
import { SECURITY_OPERATIONS_CENTER_ADMIN_PATH } from "./securityOperationsCenterAdmin";
import { ENTERPRISE_API_CENTER_ADMIN_PATH } from "./enterpriseApiCenterAdmin";
import { REPORTING_CENTER_ADMIN_PATH } from "./reportingCenterAdmin";
import { buildLegacyRolePermissionMap } from "../utils/governancePermissionEngine";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "./operationsCenter";
import { JOURNEY_INTELLIGENCE_PATH } from "./journeyIntelligence";
import { PERMISSIONS, ROLES } from "./permissionTypes";
import type { Permission as PermissionSlug, Role as RoleSlug } from "./permissionTypes";

export { PERMISSIONS, ROLES } from "./permissionTypes";
export type Role = RoleSlug;
export type Permission = PermissionSlug;

export const ROLE_LABELS: Record<Role, string> = {
  Admin: "Admin",
  Executive: "Executive",
  Operations: "Operations",
  Consultant: "Consultant",
  "Senior Matchmaker": "Senior Matchmaker",
  "Compatibility Specialist": "Compatibility Specialist",
  "Family Values Advisor": "Family Values Advisor",
  "Diaspora Consultant": "Diaspora Consultant",
  Support: "Support",
  Research: "Research"
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  ViewMembers: "View members",
  EditMembers: "Edit members",
  DeleteMembers: "Delete members",
  AssignConsultants: "Assign consultants",
  TransferJourney: "Transfer journey",
  ApproveJourney: "Approve journey",
  ManageConsultants: "Manage consultants",
  ManagePayments: "Manage payments",
  ApproveRefund: "Approve refund",
  IssueRefund: "Issue refund",
  ManageScheduling: "Manage scheduling",
  ManageNotifications: "Manage notifications",
  ManageIntroductions: "Manage introductions",
  ManageFollowUps: "Manage follow-ups",
  ViewArchives: "View archives",
  ManageArchives: "Manage archives",
  ViewFinance: "View finance",
  ManageFinance: "Manage finance",
  ViewResearch: "View research",
  PublishResearch: "Publish research",
  ViewExecutiveDashboard: "View executive dashboard",
  ManageGovernance: "Manage governance",
  ManageSupport: "Manage support",
  ManageSafety: "Manage safety",
  ManageDocuments: "Manage documents",
  ManagePolicies: "Manage policies",
  ManageCareers: "Manage careers",
  ManageOperations: "Manage operations",
  ManageCrm: "Manage CRM",
  ManageEvents: "Manage events",
  ManageInstitute: "Manage institute",
  ManageCommunity: "Manage community",
  ManageMessaging: "Manage messaging",
  ManageConsultantQa: "Manage consultant QA",
  ManageExecutiveReports: "Manage executive reports",
  ManageLegacy: "Manage legacy",
  ManageSuccessStories: "Manage success stories",
  ManageCompliance: "Manage compliance",
  ViewAuditLogs: "View audit logs",
  ExportReports: "Export reports",
  SystemAdministration: "System administration",
  ManageRecovery: "Manage recovery"
};

const ALL_PERMISSIONS: Permission[] = [...PERMISSIONS];

export const RolePermissions: Record<Role, readonly Permission[]> = buildLegacyRolePermissionMap();

/** @deprecated use RolePermissions */
export const ROLE_PERMISSIONS = RolePermissions;

const HARD_TAB_PERMISSIONS: Record<HardTab, Permission | Permission[]> = {
  command: "ManageOperations",
  overview: "ManageOperations",
  business: "ViewFinance",
  users: "ViewMembers",
  reports: ["ManageOperations", "ViewExecutiveDashboard", "ExportReports"],
  cities: "ManageOperations",
  discover: "ManageOperations",
  cityhome: "ManageOperations",
  pricing: "ManagePayments",
  verifications: "ManageOperations",
  content: "ManageOperations",
  email: "ManageNotifications",
  ads: "ManageOperations",
  leads: "ManageOperations",
  concierge: "ManageConsultants",
  talent: "ManageCareers",
  support: "ManageSupport",
  audit: "ViewArchives",
  compliance: "ViewArchives",
  systemhealth: "ManageOperations",
  notifications: "ManageNotifications",
  documents: "ManageDocuments",
  policies: "ManageDocuments",
  safety: "ManageSafety",
  academy: "ManageConsultants",
  quality: "ManageConsultants",
  finance: "ViewFinance",
  messages: "ManageNotifications",
  executive: "ViewExecutiveDashboard",
  launch: "ManageOperations",
  remediation: "ManageOperations",
  readiness: "ManageOperations",
  dataintegrity: "ManageOperations",
  recovery: "ManageRecovery",
  workforce: "ManageOperations",
  governance: "ManageGovernance",
  businesscontinuity: "ManageOperations",
  configuration: "SystemAdministration",
  monitoring: "ManageOperations",
  datagovernance: "ManageGovernance",
  apiplatform: "SystemAdministration",
  launchcontrol: "ManageOperations",
  performance: "ManageOperations",
  workflows: "ManageOperations",
  securitydashboard: ["ManageOperations", "ManageSafety", "SystemAdministration"],
  uxconsistency: "ManageOperations",
  performanceoptimization: "ManageOperations",
  launchcertification: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  performancecertification: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  securitycertification: ["ManageOperations", "ManageSafety", "SystemAdministration", "ViewExecutiveDashboard"],
  reliabilitycertification: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  dependencycertification: ["ManageOperations", "ManageSafety", "SystemAdministration", "ViewExecutiveDashboard"],
  driftcertification: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  foundercertification: ["ViewExecutiveDashboard", "SystemAdministration", "ManageOperations"],
  enterprisecleanup: "ManageOperations",
  productionenvironment: "ManageOperations",
  launchinfrastructure: "ManageOperations",
  founderacceptance: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  observability: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  featureflags: ["SystemAdministration", "ManageGovernance", "ManageOperations"],
  platformhealth: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  abuseprotection: ["ManageSafety", "ManageOperations", "SystemAdministration"],
  search: ["ManageOperations", "SystemAdministration", "ViewMembers"],
  disasterrecovery: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  launchcommand: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  qualityassurance: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"],
  securityops: ["ManageOperations", "ManageSafety", "SystemAdministration"],
  enterpriseapi: ["ManageOperations", "SystemAdministration", "ViewExecutiveDashboard"]
};

const CONCIERGE_VIEW_PERMISSIONS: Record<ConciergeAdminView, Permission | Permission[]> = {
  dashboard: "ManageConsultants",
  "operations-center": "ManageOperations",
  "journey-intelligence": "ViewResearch"
};

const AUDIT_VIEW_PERMISSIONS: Record<AuditAdminView, Permission | Permission[]> = {
  compliance: "ViewArchives",
  routes: "ViewArchives",
  database: "ManageOperations",
  security: "ManageOperations",
  journeys: "ViewArchives"
};

/** Canonical /hard route → required permission(s). Longest path wins at runtime. */
export const HARD_ROUTE_PERMISSIONS: Record<string, Permission | Permission[]> = {
  "/hard/command": HARD_TAB_PERMISSIONS.command,
  "/hard/metrics": HARD_TAB_PERMISSIONS.overview,
  "/hard/business": HARD_TAB_PERMISSIONS.business,
  "/hard/users": HARD_TAB_PERMISSIONS.users,
  [REPORTING_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.reports,
  "/hard/cities": HARD_TAB_PERMISSIONS.cities,
  "/hard/discover": HARD_TAB_PERMISSIONS.discover,
  "/hard/city-home": HARD_TAB_PERMISSIONS.cityhome,
  "/hard/pricing": HARD_TAB_PERMISSIONS.pricing,
  "/hard/verify": HARD_TAB_PERMISSIONS.verifications,
  "/hard/content": HARD_TAB_PERMISSIONS.content,
  "/hard/email": HARD_TAB_PERMISSIONS.email,
  "/hard/home-ads": HARD_TAB_PERMISSIONS.ads,
  "/hard/leads": HARD_TAB_PERMISSIONS.leads,
  [CONCIERGE_ADMIN_DASHBOARD_PATH]: CONCIERGE_VIEW_PERMISSIONS.dashboard,
  [OPERATIONS_CENTER_PATH]: CONCIERGE_VIEW_PERMISSIONS["operations-center"],
  [JOURNEY_INTELLIGENCE_PATH]: CONCIERGE_VIEW_PERMISSIONS["journey-intelligence"],
  "/hard/talent": HARD_TAB_PERMISSIONS.talent,
  "/hard/support": HARD_TAB_PERMISSIONS.support,
  [AUDIT_CENTER_ADMIN_PATH]: AUDIT_VIEW_PERMISSIONS.compliance,
  [INSTITUTIONAL_COMPLIANCE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.compliance,
  [SYSTEM_HEALTH_ADMIN_PATH]: HARD_TAB_PERMISSIONS.systemhealth,
  [NOTIFICATION_RELIABILITY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.notifications,
  [ROUTE_AUDIT_ADMIN_PATH]: AUDIT_VIEW_PERMISSIONS.routes,
  [DATABASE_AUDIT_ADMIN_PATH]: AUDIT_VIEW_PERMISSIONS.database,
  [PERMISSIONS_AUDIT_ADMIN_PATH]: AUDIT_VIEW_PERMISSIONS.security,
  [JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH]: AUDIT_VIEW_PERMISSIONS.journeys,
  "/hard/documents": HARD_TAB_PERMISSIONS.documents,
  [DOCUMENT_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.documents,
  [INSTITUTIONAL_POLICIES_ADMIN_PATH]: HARD_TAB_PERMISSIONS.policies,
  "/hard/safety": HARD_TAB_PERMISSIONS.safety,
  "/hard/academy": HARD_TAB_PERMISSIONS.academy,
  "/hard/quality": HARD_TAB_PERMISSIONS.quality,
  "/hard/finance": HARD_TAB_PERMISSIONS.finance,
  "/hard/messages": HARD_TAB_PERMISSIONS.messages,
  "/hard/executive": HARD_TAB_PERMISSIONS.executive,
  [LAUNCH_READINESS_ADMIN_PATH]: HARD_TAB_PERMISSIONS.launch,
  [REMEDIATION_BOARD_ADMIN_PATH]: HARD_TAB_PERMISSIONS.remediation,
  [INSTITUTIONAL_READINESS_ADMIN_PATH]: HARD_TAB_PERMISSIONS.readiness,
  [DATA_INTEGRITY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.dataintegrity,
  [RECOVERY_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.recovery,
  [WORKFORCE_MANAGEMENT_ADMIN_PATH]: HARD_TAB_PERMISSIONS.workforce,
  [INSTITUTIONAL_GOVERNANCE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.governance,
  [BUSINESS_CONTINUITY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.businesscontinuity,
  [CONFIGURATION_PLATFORM_ADMIN_PATH]: HARD_TAB_PERMISSIONS.configuration,
  [MONITORING_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.monitoring,
  [DATA_GOVERNANCE_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.datagovernance,
  [API_PLATFORM_ADMIN_PATH]: HARD_TAB_PERMISSIONS.apiplatform,
  [LAUNCH_CONTROL_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.launchcontrol,
  [PERFORMANCE_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.performance,
  [WORKFLOW_ENGINE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.workflows,
  [PRODUCTION_SECURITY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.securitydashboard,
  [UX_CONSISTENCY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.uxconsistency,
  [PRODUCTION_PERFORMANCE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.performanceoptimization,
  [LAUNCH_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.launchcertification,
  [PERFORMANCE_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.performancecertification,
  [SECURITY_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.securitycertification,
  [RELIABILITY_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.reliabilitycertification,
  [DEPENDENCY_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.dependencycertification,
  [DRIFT_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.driftcertification,
  [FOUNDER_CERTIFICATION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.foundercertification,
  [ENTERPRISE_CODEBASE_CLEANUP_ADMIN_PATH]: HARD_TAB_PERMISSIONS.enterprisecleanup,
  [PRODUCTION_ENVIRONMENT_ADMIN_PATH]: HARD_TAB_PERMISSIONS.productionenvironment,
  [LAUNCH_INFRASTRUCTURE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.launchinfrastructure,
  [FOUNDER_ACCEPTANCE_ADMIN_PATH]: HARD_TAB_PERMISSIONS.founderacceptance,
  [PRODUCTION_OBSERVABILITY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.observability,
  [FEATURE_FLAG_PLATFORM_ADMIN_PATH]: HARD_TAB_PERMISSIONS.featureflags,
  [PLATFORM_HEALTH_ADMIN_PATH]: HARD_TAB_PERMISSIONS.platformhealth,
  [ABUSE_PROTECTION_ADMIN_PATH]: HARD_TAB_PERMISSIONS.abuseprotection,
  [SEARCH_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.search,
  [DISASTER_RECOVERY_ADMIN_PATH]: HARD_TAB_PERMISSIONS.disasterrecovery,
  [LAUNCH_COMMAND_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.launchcommand,
  [QA_CERTIFICATION_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.qualityassurance,
  [SECURITY_OPERATIONS_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.securityops,
  [ENTERPRISE_API_CENTER_ADMIN_PATH]: HARD_TAB_PERMISSIONS.enterpriseapi
};

/** Every protected /hard workspace path — used for audits and enforcement tests. */
export const ENFORCED_HARD_ROUTE_PATHS = [
  "/hard/command",
  "/hard/metrics",
  "/hard/business",
  "/hard/users",
  "/hard/reports",
  "/hard/cities",
  "/hard/discover",
  "/hard/city-home",
  "/hard/pricing",
  "/hard/verify",
  "/hard/content",
  "/hard/email",
  "/hard/home-ads",
  "/hard/leads",
  "/hard/concierge",
  "/hard/concierge/operations",
  "/hard/concierge/intelligence",
  "/hard/talent",
  "/hard/support",
  "/hard/audit",
  "/hard/audit/routes",
  "/hard/audit/database",
  "/hard/audit/security",
  "/hard/audit/journeys",
  "/hard/compliance",
  "/hard/system-health",
  "/hard/notifications",
  "/hard/documents",
  "/hard/document-center",
  "/hard/policies",
  "/hard/safety",
  "/hard/academy",
  "/hard/quality",
  "/hard/finance",
  "/hard/messages",
  "/hard/executive",
  "/hard/launch",
  "/hard/remediation",
  "/hard/readiness",
  "/hard/data-integrity",
  "/hard/recovery",
  "/hard/workforce",
  "/hard/governance",
  "/hard/business-continuity",
  "/hard/configuration",
  "/hard/monitoring",
  "/hard/data-governance",
  "/hard/api-platform",
  "/hard/launch-control",
  "/hard/performance",
  "/hard/workflows",
  "/hard/security-dashboard",
  "/hard/ux-consistency",
  "/hard/performance-optimization",
  "/hard/launch-certification",
  "/hard/performance-certification",
  "/hard/security-certification",
  "/hard/reliability-certification",
  "/hard/dependency-certification",
  "/hard/drift-certification",
  "/hard/founder-certification",
  "/hard/enterprise-cleanup",
  "/hard/production-environment",
  "/hard/launch-infrastructure",
  "/hard/founder-acceptance",
  "/hard/observability",
  "/hard/feature-flags",
  "/hard/platform-health",
  "/hard/abuse-protection",
  "/hard/search",
  "/hard/disaster-recovery",
  "/hard/launch-command",
  "/hard/quality-assurance",
  "/hard/security",
  "/hard/api"
] as const;

const ROLE_DB_ALIASES: Record<string, Role> = {
  admin: "Admin",
  "super-admin": "Admin",
  executive: "Executive",
  operations: "Operations",
  consultant: "Consultant",
  "senior-matchmaker": "Senior Matchmaker",
  "compatibility-specialist": "Compatibility Specialist",
  "family-values-advisor": "Family Values Advisor",
  "diaspora-consultant": "Diaspora Consultant",
  support: "Support",
  research: "Research"
};

export function normalizeOperatorRole(value: string | null | undefined): Role {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return "Admin";
  if (ROLE_DB_ALIASES[raw]) return ROLE_DB_ALIASES[raw];
  const pascal = raw
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return (ROLES as readonly string[]).includes(pascal) ? (pascal as Role) : "Admin";
}

export function permissionsForRole(role: Role): readonly Permission[] {
  return RolePermissions[role] ?? [];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
}

export function roleHasAnyPermission(role: Role, permissions: Permission | Permission[]): boolean {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  return required.some((permission) => roleHasPermission(role, permission));
}

function asPermissionList(value: Permission | Permission[]): Permission[] {
  return Array.isArray(value) ? value : [value];
}

export function permissionsForHardTab(tab: HardTab): Permission[] {
  return asPermissionList(HARD_TAB_PERMISSIONS[tab]);
}

export function permissionsForConciergeView(view: ConciergeAdminView): Permission[] {
  return asPermissionList(CONCIERGE_VIEW_PERMISSIONS[view]);
}

export function permissionsForAuditView(view: AuditAdminView): Permission[] {
  return asPermissionList(AUDIT_VIEW_PERMISSIONS[view]);
}

export function permissionsForHardPath(pathname = window.location.pathname): Permission[] {
  const path = normalizePath(pathname);
  const entries = Object.entries(HARD_ROUTE_PERMISSIONS).sort(
    (left, right) => right[0].length - left[0].length
  );
  for (const [routePath, permission] of entries) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return asPermissionList(permission);
    }
  }
  const tab = Object.keys(HARD_TAB_PERMISSIONS).find((key) => {
    const tabPath = hardPathForTab(key as HardTab);
    return path === tabPath || path.startsWith(`${tabPath}/`);
  }) as HardTab | undefined;
  if (tab) return permissionsForHardTab(tab);
  return ["ManageOperations"];
}

export function roleCanAccessPath(role: Role, pathname = window.location.pathname): boolean {
  const required = permissionsForHardPath(pathname);
  return roleHasAnyPermission(role, required);
}

export function listEnforcedHardRoutes(): string[] {
  return [...ENFORCED_HARD_ROUTE_PATHS].sort();
}
