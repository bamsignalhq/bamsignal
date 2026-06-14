import type { TrustInfo } from "../utils/trust";

type TrustBadgeProps = {
  info: TrustInfo;
};

export function TrustBadge({ info }: TrustBadgeProps) {
  if (info.level === "none") return null;

  return (
    <span className={`trust-badge trust-badge--${info.level}`} title={info.label}>
      {info.label}
    </span>
  );
}
