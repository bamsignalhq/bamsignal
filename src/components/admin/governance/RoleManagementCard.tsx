import { GOVERNANCE_ROLE_LABELS } from "../../../constants/institutionalGovernance";
import type { GovernanceRoleRecord } from "../../../types/institutionalGovernance";

type RoleManagementCardProps = {
  roles: GovernanceRoleRecord[];
};

export function RoleManagementCard({ roles }: RoleManagementCardProps) {
  return (
    <section className="governance-card role-management-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Role management</h3>
        <p>Hierarchical institutional roles — configurable, never hardcoded in modules.</p>
      </header>
      <ul className="role-management-card__list">
        {roles.map((role) => (
          <li key={role.id}>
            <strong>{GOVERNANCE_ROLE_LABELS[role.slug]}</strong>
            <span>Level {role.hierarchyLevel}</span>
            <span>{role.isConfigurable ? "Configurable" : "Locked"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
