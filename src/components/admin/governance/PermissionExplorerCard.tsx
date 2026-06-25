import { GOVERNANCE_PERMISSION_LABELS } from "../../../constants/institutionalGovernance";
import type { GovernancePermissionRecord } from "../../../types/institutionalGovernance";

type PermissionExplorerCardProps = {
  permissions: GovernancePermissionRecord[];
};

export function PermissionExplorerCard({ permissions }: PermissionExplorerCardProps) {
  return (
    <section className="governance-card permission-explorer-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Permission explorer</h3>
        <p>Every capability is permission-driven — modules request permissions, never role names.</p>
      </header>
      <ul className="permission-explorer-card__list">
        {permissions.map((permission) => (
          <li key={permission.id}>
            <strong>{GOVERNANCE_PERMISSION_LABELS[permission.slug]}</strong>
            <span>{permission.slug}</span>
            <span>{permission.moduleId}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
