import type { ConciergeConsultantRoleId } from "../../../constants/conciergeConsultantRoles";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../../../constants/conciergeConsultantRoles";

type ConsultantRoleBadgeProps = {
  role: ConciergeConsultantRoleId;
  primary?: boolean;
};

export function ConsultantRoleBadge({ role, primary = false }: ConsultantRoleBadgeProps) {
  return (
    <span
      className={`consultant-role-badge${primary ? " consultant-role-badge--primary" : ""}`}
    >
      {CONCIERGE_CONSULTANT_ROLE_LABELS[role]}
    </span>
  );
}
