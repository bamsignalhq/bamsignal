import {
  PERMISSION_ROLE_LABELS,
  PERMISSION_SECURITY_STATUS_LABELS
} from "../../../constants/permissionsAudit";
import type { PermissionRoleId } from "../../../constants/permissionsAudit";
import type { RouteAccessRecord } from "../../../types/permissionsAudit";

type RouteAccessCardProps = {
  routes: RouteAccessRecord[];
};

export function RouteAccessCard({ routes }: RouteAccessCardProps) {
  const flagged = routes.filter((route) => route.status !== "secure");

  return (
    <section className="route-access-card concierge-consultant-card--glass cc-reveal">
      <header className="route-access-card__head">
        <h3>Route access</h3>
        <p>Required roles vs enforcement for sensitive admin, member, and consultant paths.</p>
      </header>

      <div className="route-access-card__table" role="table" aria-label="Route access">
        <div className="route-access-card__row route-access-card__row--head" role="row">
          <span role="columnheader">Path</span>
          <span role="columnheader">Required roles</span>
          <span role="columnheader">Enforced</span>
          <span role="columnheader">Status</span>
        </div>
        {(flagged.length ? flagged : routes.slice(0, 16)).map((route) => (
          <div key={route.id} className="route-access-card__row" role="row">
            <span role="cell"><code>{route.path}</code></span>
            <span role="cell">
              {route.requiredRoles.map((roleId: PermissionRoleId) => PERMISSION_ROLE_LABELS[roleId]).join(", ")}
            </span>
            <span role="cell">{route.enforced ? "Yes" : "No"}</span>
            <span role="cell">{PERMISSION_SECURITY_STATUS_LABELS[route.status]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
