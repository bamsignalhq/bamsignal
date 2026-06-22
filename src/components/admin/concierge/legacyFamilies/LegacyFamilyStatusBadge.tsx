import type { LegacyFamilyStatusId } from "../../../../constants/legacyFamilies";
import { legacyFamilyStatusLabel } from "../../../../constants/legacyFamilies";

type LegacyFamilyStatusBadgeProps = {
  status: LegacyFamilyStatusId;
  primary?: boolean;
};

export function LegacyFamilyStatusBadge({ status, primary = false }: LegacyFamilyStatusBadgeProps) {
  return (
    <span
      className={`legacy-family-status-badge${primary ? " legacy-family-status-badge--primary" : ""}`}
    >
      {legacyFamilyStatusLabel(status)}
    </span>
  );
}
