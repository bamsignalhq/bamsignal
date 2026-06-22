import type { CityAmbassadorRoleId } from "../../../constants/cityAmbassadors";
import { cityAmbassadorRoleLabel } from "../../../constants/cityAmbassadors";

type AmbassadorBadgeProps = {
  role: CityAmbassadorRoleId;
  primary?: boolean;
};

export function AmbassadorBadge({ role, primary = false }: AmbassadorBadgeProps) {
  return (
    <span
      className={`ca-ambassador-badge ca-ambassador-badge--${role}${
        primary ? " ca-ambassador-badge--primary" : ""
      }`}
    >
      {cityAmbassadorRoleLabel(role)}
    </span>
  );
}
