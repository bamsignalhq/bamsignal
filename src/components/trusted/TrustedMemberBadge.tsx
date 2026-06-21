import { Shield } from "lucide-react";

type TrustedMemberBadgeProps = {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

export function TrustedMemberBadge({
  size = "md",
  showLabel = true,
  className = ""
}: TrustedMemberBadgeProps) {
  const compact = size === "sm";
  const label = "Trusted Member";

  return (
    <span
      className={`trusted-member-badge trusted-member-badge--${size} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <Shield size={compact ? 11 : size === "lg" ? 16 : 13} aria-hidden />
      {showLabel ? <span>{label}</span> : null}
    </span>
  );
}

export function TrustedMemberShieldIcon({ className = "" }: { className?: string }) {
  return (
    <span className={`trusted-member-shield ${className}`.trim()} title="Trusted Member" aria-label="Trusted Member">
      <Shield size={14} aria-hidden />
    </span>
  );
}
