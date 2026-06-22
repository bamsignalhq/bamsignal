import { PERMISSION_SECURITY_STATUS_LABELS } from "../../../constants/permissionsAudit";
import type { RoleAccessRecord } from "../../../types/permissionsAudit";

type RoleAccessCardProps = {
  roles: RoleAccessRecord[];
};

export function RoleAccessCard({ roles }: RoleAccessCardProps) {
  return (
    <section className="role-access-card concierge-consultant-card--glass cc-reveal">
      <header className="role-access-card__head">
        <h3>Role access</h3>
        <p>Declared routes, APIs, and dashboards per role.</p>
      </header>

      <ul className="role-access-card__list">
        {roles.map((role) => (
          <li key={role.id}>
            <div className="role-access-card__item-head">
              <strong>{role.label}</strong>
              <span>{PERMISSION_SECURITY_STATUS_LABELS[role.status]}</span>
            </div>
            <p>Routes: {role.routes.slice(0, 4).join(", ")}{role.routes.length > 4 ? "…" : ""}</p>
            {role.apis.length ? <p>APIs: {role.apis.join(", ")}</p> : null}
            {role.note ? <p className="role-access-card__note">{role.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
