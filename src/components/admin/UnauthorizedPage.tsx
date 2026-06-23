import { hardPathForTab } from "../../constants/hardRoutes";
import {
  PERMISSION_LABELS,
  ROLE_LABELS,
  type Permission,
  type Role
} from "../../constants/permissions";
import { navigateToPath } from "../../constants/routes";
import { AdminTerminalEmpty } from "./AdminTerminalEmpty";

type UnauthorizedPageProps = {
  role: Role | null;
  required: Permission[];
  path?: string;
};

export function UnauthorizedPage({ role, required, path }: UnauthorizedPageProps) {
  const roleLabel = role ? ROLE_LABELS[role] : "Unknown";
  const permissionLabels = required.map((permission) => PERMISSION_LABELS[permission]).join(", ");

  return (
    <div className="admin-console page admin-page admin-permission-denied">
      <AdminTerminalEmpty>Access denied for this workspace.</AdminTerminalEmpty>
      <section className="card admin-permission-denied__card">
        <h2 className="admin-permission-denied__title">Unauthorized</h2>
        <p className="admin-permission-denied__copy">
          Your institution role does not include the permissions required for this route.
        </p>
        <dl className="admin-permission-denied__meta">
          <div>
            <dt>Your role</dt>
            <dd>{roleLabel}</dd>
          </div>
          <div>
            <dt>Required permission</dt>
            <dd>{permissionLabels || "Manage operations"}</dd>
          </div>
          {path ? (
            <div>
              <dt>Route</dt>
              <dd>
                <code>{path}</code>
              </dd>
            </div>
          ) : null}
        </dl>
        <button
          type="button"
          className="btn-secondary admin-permission-denied__back"
          onClick={() => navigateToPath(hardPathForTab("command"))}
        >
          Return to Command Center
        </button>
      </section>
    </div>
  );
}
