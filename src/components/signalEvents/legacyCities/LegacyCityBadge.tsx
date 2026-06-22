import type { CommunityMaturityLevelId } from "../../../constants/legacyCities";
import { communityMaturityLevelLabel } from "../../../constants/legacyCities";

type LegacyCityBadgeProps = {
  level: CommunityMaturityLevelId;
  primary?: boolean;
};

export function LegacyCityBadge({ level, primary = false }: LegacyCityBadgeProps) {
  return (
    <span
      className={`lc-city-badge lc-city-badge--${level}${
        primary ? " lc-city-badge--primary" : ""
      }`}
    >
      {communityMaturityLevelLabel(level)}
    </span>
  );
}
