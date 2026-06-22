import {
  LEGACY_STATUS_LABELS,
  type LegacyStatusId
} from "../../constants/relationshipLegacyIndex";

type LegacyStatusBadgeProps = {
  status: LegacyStatusId;
  compact?: boolean;
};

export function LegacyStatusBadge({ status, compact = false }: LegacyStatusBadgeProps) {
  const label = LEGACY_STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`legacy-status-badge legacy-status-badge--${status}${
        compact ? " legacy-status-badge--compact" : ""
      }`}
      title={`${label} — preserved permanently`}
    >
      {label}
    </span>
  );
}
