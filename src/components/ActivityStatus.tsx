import { formatLastActive, isOnlineNow } from "../utils/activity";

type ActivityStatusProps = {
  lastActiveAt?: string;
  showOnlineBadge?: boolean;
  className?: string;
  variant?: "default" | "overlay" | "subtle";
};

export function ActivityStatus({
  lastActiveAt,
  showOnlineBadge = false,
  className = "",
  variant = "default"
}: ActivityStatusProps) {
  const label = formatLastActive(lastActiveAt);
  const online = showOnlineBadge && isOnlineNow(lastActiveAt);

  return (
    <div className={`activity-status activity-status--${variant} ${className}`.trim()}>
      {online && (
        <span className="activity-status__online" aria-label="Online now">
          🟢 Online Now
        </span>
      )}
      <span className="activity-status__label">{label}</span>
    </div>
  );
}
