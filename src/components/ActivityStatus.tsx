import { cardActivityBadge } from "../utils/activity";
import { canShowLastSeen, canShowOnlineStatus } from "../utils/activityPrivacy";
import type { DiscoverProfile } from "../types";

type ActivityStatusProps = {
  lastActiveAt?: string;
  profile?: Pick<DiscoverProfile, "safetySettings">;
  isConnection?: boolean;
  showOnlineBadge?: boolean;
  className?: string;
  variant?: "default" | "overlay" | "subtle";
};

export function ActivityStatus({
  lastActiveAt,
  profile,
  isConnection = false,
  showOnlineBadge = true,
  className = "",
  variant = "default"
}: ActivityStatusProps) {
  const showLastSeen = profile ? canShowLastSeen(profile, { isConnection }) : true;
  const showOnline = profile ? canShowOnlineStatus(profile, { isConnection }) : true;

  if (!showLastSeen && !showOnline) return null;

  const badge = showLastSeen ? cardActivityBadge(lastActiveAt) : null;
  const online = showOnline && showOnlineBadge && badge?.online;

  if (!badge && !online) return null;

  return (
    <div className={`activity-status activity-status--${variant} ${className}`.trim()}>
      {online ? (
        <span className="activity-status__online" aria-label="Online now">
          Active now
        </span>
      ) : badge ? (
        <span className="activity-status__label">{badge.label}</span>
      ) : null}
    </div>
  );
}
