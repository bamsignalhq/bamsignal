import { CONSULTANT_ROUTES } from "../constants/consultantRoutes";
import { hardPathForTab } from "../constants/hardRoutes";
import {
  HARD_ROUTE_PERMISSIONS,
  permissionsForHardPath,
  RolePermissions,
  type Permission,
  type Role
} from "../constants/permissions";
import type { HardTab } from "../components/admin/adminConsoleNav";
import { HARD_TAB_TITLES } from "../components/admin/adminConsoleNav";
import {
  PERMISSIONS_AUDIT_ADMIN_PATH,
  type PermissionRoleId,
  type PermissionSecurityStatusId,
  type PermissionVerifyAreaId
} from "../constants/permissionsAudit";
import { DATABASE_AUDIT_ADMIN_PATH } from "../constants/databaseAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "../constants/launchReadiness";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import { AUDIT_CENTER_ADMIN_PATH } from "../constants/auditCenterAdmin";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "../constants/operationsCenter";
import { JOURNEY_INTELLIGENCE_PATH } from "../constants/journeyIntelligence";
import type { PermissionMatrixCell, RoleAccessRecord, RouteAccessRecord } from "../types/permissionsAudit";

const MEMBER_ROUTES = [
  "/home",
  "/discover",
  "/chats",
  "/signals",
  "/profile",
  "/settings",
  "/subscription",
  "/onboarding"
];

const ADMIN_TABS: HardTab[] = Object.keys(HARD_TAB_TITLES) as HardTab[];

type RoleManifest = {
  roleId: PermissionRoleId;
  label: string;
  routes: string[];
  apis: string[];
  dashboards: string[];
  areas: Partial<Record<PermissionVerifyAreaId, PermissionSecurityStatusId>>;
  note: string | null;
};

const ROLE_MANIFEST: RoleManifest[] = [
  {
    roleId: "member",
    label: "Member",
    routes: MEMBER_ROUTES,
    apis: ["/api/auth/pin-login", "/api/member/*"],
    dashboards: ["/home"],
    areas: {
      "route-access": "secure",
      "api-access": "secure",
      "dashboard-access": "secure",
      "document-access": "secure",
      "finance-access": "warning",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Member routes gated by pin auth and member restore blocking"
  },
  {
    roleId: "consultant",
    label: "Consultant",
    routes: Object.values(CONSULTANT_ROUTES),
    apis: ["/api/concierge/persistence (admin only)"],
    dashboards: [CONSULTANT_ROUTES.portfolio],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Consultant portal uses local PIN session — not Supabase consultant auth"
  },
  {
    roleId: "senior-matchmaker",
    label: "Senior Matchmaker",
    routes: [CONSULTANT_ROUTES.members, CONSULTANT_ROUTES.introductions],
    apis: [],
    dashboards: [CONSULTANT_ROUTES.portfolio],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Capability: legacy-members, global-members — UI enforcement partial"
  },
  {
    roleId: "compatibility-specialist",
    label: "Compatibility Specialist",
    routes: [CONSULTANT_ROUTES.assist, CONSULTANT_ROUTES.members],
    apis: [],
    dashboards: [CONSULTANT_ROUTES.assist],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Capability: review-applications"
  },
  {
    roleId: "family-values-advisor",
    label: "Family Values Advisor",
    routes: [CONSULTANT_ROUTES.members, CONSULTANT_ROUTES.followups],
    apis: [],
    dashboards: [CONSULTANT_ROUTES.members],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Capability: view-family-journeys"
  },
  {
    roleId: "diaspora-consultant",
    label: "Diaspora Consultant",
    routes: [CONSULTANT_ROUTES.regions, CONSULTANT_ROUTES.members],
    apis: [],
    dashboards: [CONSULTANT_ROUTES.regions],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Capability: view-global-members"
  },
  {
    roleId: "operations",
    label: "Operations",
    routes: [OPERATIONS_CENTER_PATH, CONCIERGE_ADMIN_DASHBOARD_PATH],
    apis: ["/api/concierge/persistence"],
    dashboards: [OPERATIONS_CENTER_PATH],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "warning",
      "finance-access": "warning",
      "support-access": "warning",
      "safety-access": "warning",
      "audit-access": "warning"
    },
    note: "No dedicated operations role — shares admin allowlist gate"
  },
  {
    roleId: "support",
    label: "Support",
    routes: [hardPathForTab("support"), "/help", "/contact", "/tickets"],
    apis: [],
    dashboards: [hardPathForTab("support")],
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "secure",
      "finance-access": "secure",
      "support-access": "warning",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Support Center admin tab — no role-scoped restriction"
  },
  {
    roleId: "research",
    label: "Research",
    routes: [JOURNEY_INTELLIGENCE_PATH, "/institute"],
    apis: [],
    dashboards: [JOURNEY_INTELLIGENCE_PATH],
    areas: {
      "route-access": "warning",
      "api-access": "secure",
      "dashboard-access": "warning",
      "document-access": "warning",
      "finance-access": "secure",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "secure"
    },
    note: "Journey Intelligence nested under concierge — no research role gate"
  },
  {
    roleId: "executive",
    label: "Executive",
    routes: [hardPathForTab("executive"), hardPathForTab("business")],
    apis: [],
    dashboards: [hardPathForTab("executive")],
    areas: {
      "route-access": "critical",
      "api-access": "secure",
      "dashboard-access": "critical",
      "document-access": "warning",
      "finance-access": "warning",
      "support-access": "secure",
      "safety-access": "secure",
      "audit-access": "warning"
    },
    note: "Executive Dashboard visible to all admins — no executive role separation"
  },
  {
    roleId: "admin",
    label: "Admin",
    routes: ADMIN_TABS.map((tab) => hardPathForTab(tab)),
    apis: ["/api/auth/identity?action=admin-session", "/api/concierge/persistence"],
    dashboards: ADMIN_TABS.map((tab) => hardPathForTab(tab)),
    areas: {
      "route-access": "warning",
      "api-access": "warning",
      "dashboard-access": "warning",
      "document-access": "warning",
      "finance-access": "warning",
      "support-access": "warning",
      "safety-access": "warning",
      "audit-access": "warning"
    },
    note: "Email allowlist + Supabase session — RolePermissions enforced on /hard routes"
  },
  {
    roleId: "super-admin",
    label: "Super Admin",
    routes: [
      ...ADMIN_TABS.map((tab) => hardPathForTab(tab)),
      AUDIT_CENTER_ADMIN_PATH,
      ROUTE_AUDIT_ADMIN_PATH,
      DATABASE_AUDIT_ADMIN_PATH,
      PERMISSIONS_AUDIT_ADMIN_PATH,
      JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
      LAUNCH_READINESS_ADMIN_PATH
    ],
    apis: ["/api/auth/identity?action=admin-session", "CRON_SECRET bypass"],
    dashboards: [hardPathForTab("command")],
    areas: {
      "route-access": "critical",
      "api-access": "critical",
      "dashboard-access": "critical",
      "document-access": "critical",
      "finance-access": "critical",
      "support-access": "critical",
      "safety-access": "critical",
      "audit-access": "critical"
    },
    note: "No super-admin distinction in admin_users.role — same gate as admin"
  }
];

const SENSITIVE_ADMIN_ROUTES: { path: string; intendedRoles: PermissionRoleId[]; tab?: HardTab }[] = [
  { path: hardPathForTab("finance"), intendedRoles: ["admin", "super-admin", "executive", "operations"], tab: "finance" },
  { path: hardPathForTab("safety"), intendedRoles: ["admin", "super-admin", "operations", "support"], tab: "safety" },
  { path: hardPathForTab("support"), intendedRoles: ["admin", "super-admin", "support", "operations"], tab: "support" },
  { path: hardPathForTab("audit"), intendedRoles: ["admin", "super-admin", "operations", "research"], tab: "audit" },
  { path: hardPathForTab("documents"), intendedRoles: ["admin", "super-admin", "operations"], tab: "documents" },
  { path: hardPathForTab("executive"), intendedRoles: ["executive", "super-admin", "admin"], tab: "executive" },
  { path: PERMISSIONS_AUDIT_ADMIN_PATH, intendedRoles: ["super-admin", "admin", "operations"], tab: "audit" },
  { path: DATABASE_AUDIT_ADMIN_PATH, intendedRoles: ["super-admin", "admin", "operations"], tab: "audit" },
  { path: ROUTE_AUDIT_ADMIN_PATH, intendedRoles: ["super-admin", "admin", "operations", "research"], tab: "audit" },
  { path: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH, intendedRoles: ["super-admin", "admin", "operations"], tab: "audit" },
  { path: LAUNCH_READINESS_ADMIN_PATH, intendedRoles: ["super-admin", "admin", "executive", "operations"], tab: "launch" }
];

function rolesForPermission(permission: Permission): PermissionRoleId[] {
  const roleMap: Record<Role, PermissionRoleId> = {
    Admin: "admin",
    Executive: "executive",
    Operations: "operations",
    Consultant: "consultant",
    "Senior Matchmaker": "senior-matchmaker",
    "Compatibility Specialist": "compatibility-specialist",
    "Family Values Advisor": "family-values-advisor",
    "Diaspora Consultant": "diaspora-consultant",
    Support: "support",
    Research: "research"
  };

  return (Object.keys(RolePermissions) as Role[])
    .filter((role) => RolePermissions[role].includes(permission))
    .map((role) => roleMap[role]);
}

export function buildPermissionMatrix(): PermissionMatrixCell[] {
  const cells: PermissionMatrixCell[] = [];
  const areas: PermissionVerifyAreaId[] = [
    "route-access",
    "api-access",
    "dashboard-access",
    "document-access",
    "finance-access",
    "support-access",
    "safety-access",
    "audit-access"
  ];

  for (const role of ROLE_MANIFEST) {
    for (const areaId of areas) {
      const status = role.areas[areaId] ?? "secure";
      cells.push({
        roleId: role.roleId,
        areaId,
        allowed: status !== "secure" || role.roleId === "member",
        status,
        note: role.note
      });
    }
  }

  return cells;
}

export function buildRoleAccessRecords(): RoleAccessRecord[] {
  return ROLE_MANIFEST.map((role) => {
    const statuses = Object.values(role.areas);
    const status: PermissionSecurityStatusId = statuses.includes("critical")
      ? "critical"
      : statuses.includes("warning")
        ? "warning"
        : "secure";

    return {
      id: `role-${role.roleId}`,
      roleId: role.roleId,
      label: role.label,
      routes: role.routes,
      apis: role.apis,
      dashboards: role.dashboards,
      status,
      note: role.note
    };
  });
}

export function buildRouteAccessRecords(): RouteAccessRecord[] {
  const records: RouteAccessRecord[] = Object.keys(HARD_ROUTE_PERMISSIONS).map((path) => {
    const required = permissionsForHardPath(path);
    const requiredRoles = [...new Set(required.flatMap((permission) => rolesForPermission(permission)))];
    return {
      id: `route-${path}`,
      path,
      requiredRoles,
      enforced: true,
      status: "secure" as PermissionSecurityStatusId,
      note: `RequirePermission enforces ${required.join(", ")}`
    };
  });

  for (const route of SENSITIVE_ADMIN_ROUTES) {
    const existing = records.find((record) => record.path === route.path);
    if (existing) continue;
    records.push({
      id: `route-${route.path}`,
      path: route.path,
      requiredRoles: route.intendedRoles,
      enforced: true,
      status: "secure",
      note: `RequirePermission enforces ${route.tab ?? "tab"} access`
    });
  }

  for (const path of MEMBER_ROUTES) {
    records.push({
      id: `route-${path}`,
      path,
      requiredRoles: ["member"],
      enforced: true,
      status: "secure",
      note: "requiresMemberRestoreBlocking / member session"
    });
  }

  for (const path of Object.values(CONSULTANT_ROUTES)) {
    records.push({
      id: `route-${path}`,
      path,
      requiredRoles: ["consultant", "senior-matchmaker", "compatibility-specialist", "family-values-advisor", "diaspora-consultant"],
      enforced: path === CONSULTANT_ROUTES.login ? false : true,
      status: path === CONSULTANT_ROUTES.login ? "secure" : "warning",
      note: path === CONSULTANT_ROUTES.login ? "Public login route" : "Consultant session — local PIN only"
    });
  }

  return records.sort((left, right) => left.path.localeCompare(right.path));
}

export function getRoleManifest(): RoleManifest[] {
  return ROLE_MANIFEST.map((role) => ({ ...role }));
}
