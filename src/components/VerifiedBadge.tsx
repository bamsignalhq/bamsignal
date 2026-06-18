import { Check } from "lucide-react";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  label?: string;
};

export function VerifiedBadge({ size = "md", label = "Verified" }: VerifiedBadgeProps) {
  const compact = size === "sm";
  return (
    <span
      className={`verified-badge verified-badge--${size}`}
      title={label}
      aria-label={label}
    >
      <Check size={compact ? 10 : 13} strokeWidth={3} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
