import type { VerificationInfo } from "../utils/verification";

type VerificationBadgeProps = {
  info: VerificationInfo;
};

export function VerificationBadge({ info }: VerificationBadgeProps) {
  if (!info.tier) return null;

  return (
    <span className={`verification-badge verification-badge--${info.color}`} title={info.label}>
      <span aria-hidden>{info.emoji}</span> {info.label}
    </span>
  );
}
