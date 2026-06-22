import { useCallback, useMemo, useState } from "react";
import {
  PERMISSIONS_AUDIT_BRAND,
  PERMISSIONS_AUDIT_ADMIN_PATH,
  PERMISSION_ROLES,
  PERMISSION_ROLE_LABELS,
  PERMISSION_SECURITY_STATUS_LABELS,
  type PermissionRoleId,
  type PermissionSecurityStatusId
} from "../../../constants/permissionsAudit";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { DATABASE_AUDIT_ADMIN_PATH } from "../../../constants/databaseAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../../../constants/routeAudit";
import { navigateToPath } from "../../../constants/routes";
import { buildPermissionsAuditReport } from "../../../utils/securityAuditReport";
import { PermissionHealthCard } from "./PermissionHealthCard";
import { PermissionMatrixCard } from "./PermissionMatrixCard";
import { RoleAccessCard } from "./RoleAccessCard";
import { RouteAccessCard } from "./RouteAccessCard";
import { SecurityIssueCard } from "./SecurityIssueCard";

export function PermissionsAuditPage() {
  const [roleFilter, setRoleFilter] = useState<PermissionRoleId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PermissionSecurityStatusId | "all">("all");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildPermissionsAuditReport();
  }, [refreshKey]);

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return report.issues.filter((issue) => {
      if (roleFilter !== "all" && !issue.affectedRoles.includes(roleFilter)) return false;
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return (
        issue.title.toLowerCase().includes(normalizedQuery) ||
        issue.summary.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, report.issues, roleFilter, statusFilter]);

  const filteredRoles = useMemo(() => {
    if (roleFilter === "all") return report.roles;
    return report.roles.filter((role) => role.roleId === roleFilter);
  }, [roleFilter, report.roles]);

  const handleReset = useCallback(() => {
    setRoleFilter("all");
    setStatusFilter("all");
    setQuery("");
  }, []);

  return (
    <div className="permissions-audit-page">
      <header className="permissions-audit-page__head">
        <div>
          <h2>{PERMISSIONS_AUDIT_BRAND}</h2>
          <p>
            Verify route, API, dashboard, document, finance, support, safety, and audit access across
            member, consultant, operations, executive, and admin roles — detect escalation and overlap.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh audit
        </button>
      </header>

      <PermissionHealthCard metrics={report.metrics} totalChecks={report.totalChecks} />

      <div className="permissions-audit-page__filters">
        <label className="permissions-audit-search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Issue title, summary…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="permissions-audit-search-field">
          <span>Role</span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as PermissionRoleId | "all")}
          >
            <option value="all">All roles</option>
            {PERMISSION_ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {PERMISSION_ROLE_LABELS[role.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="permissions-audit-search-field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PermissionSecurityStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {report.metrics.map((metric) => (
              <option key={metric.status} value={metric.status}>
                {PERMISSION_SECURITY_STATUS_LABELS[metric.status]} ({metric.count})
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <PermissionMatrixCard matrix={report.matrix} />

      <div className="permissions-audit-page__body">
        <div className="permissions-audit-page__column">
          <RouteAccessCard routes={report.routes} />
          <RoleAccessCard roles={filteredRoles} />
        </div>
        <SecurityIssueCard issues={filteredIssues} />
      </div>

      <footer className="permissions-audit-page__foot">
        <p>Permissions audit path: {PERMISSIONS_AUDIT_ADMIN_PATH}</p>
        <p>
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}>
            Compliance
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(ROUTE_AUDIT_ADMIN_PATH)}>
            Routes
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(DATABASE_AUDIT_ADMIN_PATH)}>
            Database
          </button>
        </p>
      </footer>
    </div>
  );
}
