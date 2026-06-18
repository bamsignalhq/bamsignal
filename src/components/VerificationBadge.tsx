import { Check } from "lucide-react";
import type { VerificationInfo } from "../utils/verification";

type VerificationBadgeProps = {
  info: VerificationInfo;
};

export function VerificationBadge({ info }: VerificationBadgeProps) {
  if (!info.tier) return null;

  return (
    <span className={`verification-badge verification-badge--${info.color}`} title={info.label}>
      <Check size={11} strokeWidth={3} aria-hidden />
      <span>{info.label}</span>
    </span>
  );
}
