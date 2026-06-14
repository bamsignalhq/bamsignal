import { BadgeCheck } from "lucide-react";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  label?: string;
};

export function VerifiedBadge({ size = "md", label = "Verified" }: VerifiedBadgeProps) {
  return (
    <span className={`verified-badge verified-badge--${size}`} title={label} aria-label={label}>
      <BadgeCheck size={size === "sm" ? 14 : 18} />
    </span>
  );
}
