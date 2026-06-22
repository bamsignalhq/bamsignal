import type { RelationshipSupportRoleId } from "../../../constants/RelationshipSupportRole";
import { relationshipSupportRoleLabel } from "../../../constants/RelationshipSupportRole";

type RelationshipAdvisorBadgeProps = {
  role: RelationshipSupportRoleId;
  primary?: boolean;
};

export function RelationshipAdvisorBadge({ role, primary = false }: RelationshipAdvisorBadgeProps) {
  return (
    <span
      className={`relationship-advisor-badge${primary ? " relationship-advisor-badge--primary" : ""}`}
    >
      {relationshipSupportRoleLabel(role)}
    </span>
  );
}
