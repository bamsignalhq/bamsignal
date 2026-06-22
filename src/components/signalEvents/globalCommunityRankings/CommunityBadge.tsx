import type { CommunityMaturityLevelId } from "../../../constants/globalCommunityRankings";
import { communityMaturityLevelLabel } from "../../../constants/globalCommunityRankings";

type CommunityBadgeProps = {
  level: CommunityMaturityLevelId;
  primary?: boolean;
};

export function CommunityBadge({ level, primary = false }: CommunityBadgeProps) {
  return (
    <span
      className={`gcr-community-badge gcr-community-badge--${level}${
        primary ? " gcr-community-badge--primary" : ""
      }`}
    >
      {communityMaturityLevelLabel(level)}
    </span>
  );
}
