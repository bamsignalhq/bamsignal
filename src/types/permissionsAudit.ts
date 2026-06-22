import type {
  PermissionRoleId,
  PermissionSecurityStatusId,
  PermissionVerifyAreaId
} from "../constants/permissionsAudit";

export type PermissionMatrixCell = {
  roleId: PermissionRoleId;
  areaId: PermissionVerifyAreaId;
  allowed: boolean;
  status: PermissionSecurityStatusId;
  note: string | null;
};

export type RoleAccessRecord = {
  id: string;
  roleId: PermissionRoleId;
  label: string;
  routes: string[];
  apis: string[];
  dashboards: string[];
  status: PermissionSecurityStatusId;
  note: string | null;
};

export type RouteAccessRecord = {
  id: string;
  path: string;
  requiredRoles: PermissionRoleId[];
  enforced: boolean;
  status: PermissionSecurityStatusId;
  note: string | null;
};

export type SecurityIssue = {
  id: string;
  kind: "privilege-escalation" | "unprotected-route" | "role-overlap" | "access-inconsistency";
  title: string;
  summary: string;
  status: PermissionSecurityStatusId;
  affectedRoles: PermissionRoleId[];
  affectedPaths: string[];
};

export type PermissionHealthMetric = {
  status: PermissionSecurityStatusId;
  count: number;
};

export type PermissionsAuditReport = {
  generatedAt: string;
  matrix: PermissionMatrixCell[];
  roles: RoleAccessRecord[];
  routes: RouteAccessRecord[];
  issues: SecurityIssue[];
  metrics: PermissionHealthMetric[];
  totalChecks: number;
};
