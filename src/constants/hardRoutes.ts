import type { HardTab } from "../components/admin/adminConsoleNav";
import { normalizePath } from "./routes";
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
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "./operationsCenter";
import {
  JOURNEY_INTELLIGENCE_PATH
} from "./journeyIntelligence";
import { WORKFORCE_MANAGEMENT_ADMIN_PATH } from "./workforceAdmin";
import { BUSINESS_CONTINUITY_ADMIN_PATH } from "./businessContinuityAdmin";
import { INSTITUTIONAL_POLICIES_ADMIN_PATH } from "./institutionalPoliciesAdmin";
import { DOCUMENT_CENTER_ADMIN_PATH } from "./documentCenterAdmin";
import { INSTITUTIONAL_GOVERNANCE_ADMIN_PATH } from "./institutionalGovernanceAdmin";
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

export type ConciergeAdminView = "dashboard" | "operations-center" | "journey-intelligence";
export type AuditAdminView = "compliance" | "routes" | "database" | "security" | "journeys";

const TAB_SLUGS: Record<HardTab, string> = {
  command: "command",
  overview: "metrics",
  business: "business",
  users: "users",
  reports: "reports",
  cities: "cities",
  discover: "discover",
  cityhome: "city-home",
  pricing: "pricing",
  verifications: "verify",
  content: "content",
  email: "email",
  ads: "home-ads",
  leads: "leads",
  concierge: "concierge",
  talent: "talent",
  support: "support",
  audit: "audit",
  compliance: "compliance",
  systemhealth: "system-health",
  notifications: "notifications",
  documents: "document-center",
  policies: "policies",
  safety: "safety",
  academy: "academy",
  quality: "quality",
  finance: "finance",
  messages: "messages",
  executive: "executive",
  launch: "launch",
  remediation: "remediation",
  readiness: "readiness",
  dataintegrity: "data-integrity",
  recovery: "recovery",
  workforce: "workforce",
  governance: "governance",
  businesscontinuity: "business-continuity",
  configuration: "configuration",
  monitoring: "monitoring",
  datagovernance: "data-governance",
  apiplatform: "api-platform",
  launchcontrol: "launch-control",
  performance: "performance",
  workflows: "workflows",
  securitydashboard: "security-dashboard",
  uxconsistency: "ux-consistency",
  performanceoptimization: "performance-optimization"
};

const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab as HardTab])
) as Record<string, HardTab>;

export function hardPathForTab(tab: HardTab): string {
  if (tab === "command") return "/hard/command";
  const slug = TAB_SLUGS[tab];
  return `/hard/${slug}`;
}

export function parseHardTabFromPath(pathname = window.location.pathname): HardTab | null {
  const path = normalizePath(pathname);
  if (path === "/hard" || path === "/hard/command") return "command";
  if (
    path === CONCIERGE_ADMIN_DASHBOARD_PATH ||
    path.startsWith(CONCIERGE_ADMIN_DASHBOARD_PATH + "/")
  ) {
    return "concierge";
  }
  if (path === AUDIT_CENTER_ADMIN_PATH || path.startsWith(`${AUDIT_CENTER_ADMIN_PATH}/`)) {
    return "audit";
  }
  if (path === LAUNCH_READINESS_ADMIN_PATH || path.startsWith(`${LAUNCH_READINESS_ADMIN_PATH}/`)) {
    return "launch";
  }
  if (path === REMEDIATION_BOARD_ADMIN_PATH || path.startsWith(`${REMEDIATION_BOARD_ADMIN_PATH}/`)) {
    return "remediation";
  }
  if (path === INSTITUTIONAL_READINESS_ADMIN_PATH || path.startsWith(`${INSTITUTIONAL_READINESS_ADMIN_PATH}/`)) {
    return "readiness";
  }
  if (path === DATA_INTEGRITY_ADMIN_PATH || path.startsWith(`${DATA_INTEGRITY_ADMIN_PATH}/`)) {
    return "dataintegrity";
  }
  if (path === INSTITUTIONAL_COMPLIANCE_ADMIN_PATH || path.startsWith(`${INSTITUTIONAL_COMPLIANCE_ADMIN_PATH}/`)) {
    return "compliance";
  }
  if (path === SYSTEM_HEALTH_ADMIN_PATH || path.startsWith(`${SYSTEM_HEALTH_ADMIN_PATH}/`)) {
    return "systemhealth";
  }
  if (path === NOTIFICATION_RELIABILITY_ADMIN_PATH || path.startsWith(`${NOTIFICATION_RELIABILITY_ADMIN_PATH}/`)) {
    return "notifications";
  }
  if (
    path === DOCUMENT_CENTER_ADMIN_PATH ||
    path.startsWith(`${DOCUMENT_CENTER_ADMIN_PATH}/`) ||
    path === "/hard/documents" ||
    path.startsWith("/hard/documents/")
  ) {
    return "documents";
  }
  if (path === INSTITUTIONAL_POLICIES_ADMIN_PATH || path.startsWith(`${INSTITUTIONAL_POLICIES_ADMIN_PATH}/`)) {
    return "policies";
  }
  if (path === CONFIGURATION_PLATFORM_ADMIN_PATH || path.startsWith(`${CONFIGURATION_PLATFORM_ADMIN_PATH}/`)) {
    return "configuration";
  }
  if (path === MONITORING_CENTER_ADMIN_PATH || path.startsWith(`${MONITORING_CENTER_ADMIN_PATH}/`)) {
    return "monitoring";
  }
  if (
    path === DATA_GOVERNANCE_CENTER_ADMIN_PATH ||
    path.startsWith(`${DATA_GOVERNANCE_CENTER_ADMIN_PATH}/`)
  ) {
    return "datagovernance";
  }
  if (path === API_PLATFORM_ADMIN_PATH || path.startsWith(`${API_PLATFORM_ADMIN_PATH}/`)) {
    return "apiplatform";
  }
  if (
    path === LAUNCH_CONTROL_CENTER_ADMIN_PATH ||
    path.startsWith(`${LAUNCH_CONTROL_CENTER_ADMIN_PATH}/`)
  ) {
    return "launchcontrol";
  }
  if (path === PERFORMANCE_CENTER_ADMIN_PATH || path.startsWith(`${PERFORMANCE_CENTER_ADMIN_PATH}/`)) {
    return "performance";
  }
  if (path === WORKFLOW_ENGINE_ADMIN_PATH || path.startsWith(`${WORKFLOW_ENGINE_ADMIN_PATH}/`)) {
    return "workflows";
  }

  const match = path.match(/^\/hard\/([^/]+)$/);
  if (!match) return null;
  return SLUG_TO_TAB[match[1]] ?? null;
}

export function parseConciergeAdminViewFromPath(
  pathname = window.location.pathname
): ConciergeAdminView {
  const path = normalizePath(pathname);
  if (path === OPERATIONS_CENTER_PATH || path.startsWith(OPERATIONS_CENTER_PATH + "/")) {
    return "operations-center";
  }
  if (path === JOURNEY_INTELLIGENCE_PATH || path.startsWith(JOURNEY_INTELLIGENCE_PATH + "/")) {
    return "journey-intelligence";
  }
  return "dashboard";
}

export function hardPathForConciergeView(view: ConciergeAdminView): string {
  if (view === "operations-center") return OPERATIONS_CENTER_PATH;
  if (view === "journey-intelligence") return JOURNEY_INTELLIGENCE_PATH;
  return CONCIERGE_ADMIN_DASHBOARD_PATH;
}

export function parseAuditAdminViewFromPath(pathname = window.location.pathname): AuditAdminView {
  const path = normalizePath(pathname);
  if (path === JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH || path.startsWith(`${JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH}/`)) {
    return "journeys";
  }
  if (path === PERMISSIONS_AUDIT_ADMIN_PATH || path.startsWith(`${PERMISSIONS_AUDIT_ADMIN_PATH}/`)) {
    return "security";
  }
  if (path === DATABASE_AUDIT_ADMIN_PATH || path.startsWith(`${DATABASE_AUDIT_ADMIN_PATH}/`)) {
    return "database";
  }
  if (path === ROUTE_AUDIT_ADMIN_PATH || path.startsWith(`${ROUTE_AUDIT_ADMIN_PATH}/`)) {
    return "routes";
  }
  return "compliance";
}

export function hardPathForAuditView(view: AuditAdminView): string {
  if (view === "journeys") return JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH;
  if (view === "security") return PERMISSIONS_AUDIT_ADMIN_PATH;
  if (view === "database") return DATABASE_AUDIT_ADMIN_PATH;
  if (view === "routes") return ROUTE_AUDIT_ADMIN_PATH;
  return AUDIT_CENTER_ADMIN_PATH;
}

export function isHardHubPath(pathname = window.location.pathname): boolean {
  const path = normalizePath(pathname);
  if (path === "/hard/auth") return false;
  return path === "/hard" || path.startsWith("/hard/");
}
