import { DATABASE_AUDIT_ADMIN_PATH } from "../constants/databaseAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "../constants/launchReadiness";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../constants/permissionsAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import type { RemediationFindingSeed } from "../types/remediationBoard";

/** Canonical findings seeded from institutional audits 1–5. */
export const REMEDIATION_FINDINGS_SEED: RemediationFindingSeed[] = [
  {
    id: "perm-cron-secret-bypass",
    title: "CRON_SECRET bypasses admin auth",
    detail:
      "server/adminAuth.js requireAdmin accepts x-bamsignal-secret matching CRON_SECRET — grants full admin API access without operator session.",
    severity: "P0",
    category: "permissions",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open",
    launchBlocker: true
  },
  {
    id: "crm-consultant-shared-pin",
    title: "Consultant portal uses shared local PIN",
    detail:
      "consultantSession.ts authenticates with a fixed demo PIN and localStorage — not per-consultant Supabase credentials.",
    severity: "P0",
    category: "crm",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open",
    launchBlocker: true
  },
  {
    id: "launch-payment-fulfillment-race",
    title: "Payment fulfillment race",
    detail:
      "Concurrent webhook + verify paths can double-fulfill city boost and spotlight entitlements at scale.",
    severity: "P1",
    category: "launch",
    auditSource: "Operations & Launch Readiness Audit™",
    auditPath: LAUNCH_READINESS_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "perm-username-email-exposure",
    title: "Public username-to-email exposure",
    detail: "Legacy resolve-login path can leak member emails from valid usernames.",
    severity: "P1",
    category: "permissions",
    auditSource: "Operations & Launch Readiness Audit™",
    auditPath: LAUNCH_READINESS_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-concierge-localstorage",
    title: "Concierge admin data in localStorage",
    detail:
      "15 admin engines and 28 concierge keys — browser storage will not scale to 10k institutional records.",
    severity: "P1",
    category: "persistence",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-schema-unverified",
    title: "Concierge schema not startup-verified",
    detail: "12 concierge_* tables absent from REQUIRED_SCHEMA_TABLES startup verification.",
    severity: "P1",
    category: "persistence",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "perm-gate-unused",
    title: "PermissionGate not used in admin pages",
    detail:
      "RequirePermission wraps AdminHub at route level; sensitive sub-sections within tabs lack component guards.",
    severity: "P1",
    category: "permissions",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "perm-server-role-gaps",
    title: "Server admin APIs lack role enforcement",
    detail:
      "requireAdmin allowlist does not enforce operator RolePermissions on all endpoints.",
    severity: "P1",
    category: "permissions",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-support-local",
    title: "Support Center admin is localStorage-only",
    detail: "No Postgres tables for support tickets in migrations — supportCenterEngine.ts is local-only.",
    severity: "P1",
    category: "operations",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "safety-local-only",
    title: "Safety Center admin is localStorage-only",
    detail: "Safety incidents are not persisted in Postgres migrations — safetyCenterEngine.ts is local-only.",
    severity: "P1",
    category: "safety",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "notify-queue-local",
    title: "Notification delivery queue in localStorage",
    detail:
      "Delivery engines present but institutional notification queue remains browser-local until Postgres cutover.",
    severity: "P1",
    category: "notifications",
    auditSource: "Operations & Launch Readiness Audit™",
    auditPath: LAUNCH_READINESS_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "launch-no-go-verdict",
    title: "Launch readiness NO-GO at 10k scale",
    detail:
      "Composite score 86/100 with 2 critical blockers — institutional operations not ready for 10,000 members.",
    severity: "P1",
    category: "launch",
    auditSource: "Operations & Launch Readiness Audit™",
    auditPath: LAUNCH_READINESS_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-client-cutover",
    title: "Client repository cutover incomplete",
    detail: "noopSupabaseWrite — server Postgres writes exist but browser reads localStorage.",
    severity: "P2",
    category: "persistence",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "journey-finance-ref-gaps",
    title: "Finance records missing journeyRef",
    detail: "4 finance operation records with journeyRef: null — breaks journey-to-finance traceability.",
    severity: "P2",
    category: "journey-integrity",
    auditSource: "Journey Integrity Audit™",
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-no-rls",
    title: "No RLS on concierge tables",
    detail: "Access control is server-only via requireAdmin; direct Supabase client access would be unscoped.",
    severity: "P2",
    category: "persistence",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "routes-nested-nav-gaps",
    title: "Nested admin views missing from navigation",
    detail:
      "6 nested /hard workspaces reachable by URL but not listed in ADMIN_NAV_SECTIONS (operations, intelligence, audit views).",
    severity: "P2",
    category: "routes",
    auditSource: "Route & Navigation Integrity Audit™",
    auditPath: ROUTE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "journey-orphan-seeds",
    title: "Orphan journey references in demo seeds",
    detail: "7 external journey IDs in finance and audit seeds — expected demo data, not production member app.",
    severity: "P2",
    category: "journey-integrity",
    auditSource: "Journey Integrity Audit™",
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
    defaultStatus: "deferred"
  },
  {
    id: "perm-operations-broad",
    title: "Operations role spans finance, safety, documents, support",
    detail:
      "Operations RolePermissions includes ManageSafety, ManageDocuments, ManageSupport, ManageCareers without sub-role isolation.",
    severity: "P2",
    category: "permissions",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "perm-executive-finance-overlap",
    title: "Executive and Finance dashboards overlap",
    detail: "Executive Dashboard and Finance Operations both expose revenue — ViewFinance shared across roles.",
    severity: "P2",
    category: "executive",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "deferred"
  },
  {
    id: "routes-sitemap-gaps",
    title: "Signal Concierge public sitemap gaps",
    detail: "/signal-concierge/privacy and /signal-concierge/faq missing from sitemap.xml generation.",
    severity: "P2",
    category: "routes",
    auditSource: "Route & Navigation Integrity Audit™",
    auditPath: ROUTE_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "crm-capability-isolation",
    title: "Consultant capability isolation partial",
    detail:
      "ConsultantCapabilityGate covers workspace pages but /consultant/members and /consultant/regions isolation is partial.",
    severity: "P2",
    category: "crm",
    auditSource: "Permission & Security Audit™",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    defaultStatus: "open"
  },
  {
    id: "persist-dual-audit-tables",
    title: "Parallel audit table families",
    detail: "audit_logs, platform_audit_log, and moderation_audit_log overlap — consolidation needed.",
    severity: "P2",
    category: "persistence",
    auditSource: "Supabase & Persistence Audit™",
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    defaultStatus: "deferred"
  }
];
