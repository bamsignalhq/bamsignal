import { ChevronRight, Shield } from "lucide-react";

type MemberSafetyRowProps = {
  onClick?: () => void;
  /** Prefer discover styling when embedded in Discover; signals for Likes/Signals. */
  variant?: "discover" | "signals";
  title?: string;
  body?: string;
};

/**
 * Compact privacy/safety row shared by Discover and Signals.
 */
export function MemberSafetyRow({
  onClick,
  variant = "signals",
  title = "You're in control",
  body = "We protect your privacy and keep it safe."
}: MemberSafetyRowProps) {
  const rootClass =
    variant === "discover" ? "discover-premium-safety" : "signals-premium-safety";
  const iconClass =
    variant === "discover"
      ? "discover-premium-safety__icon"
      : "signals-premium-safety__icon";
  const copyClass =
    variant === "discover"
      ? "discover-premium-safety__copy"
      : "signals-premium-safety__copy";
  const chevronClass =
    variant === "discover"
      ? "discover-premium-safety__chevron"
      : "signals-premium-safety__chevron";

  return (
    <button type="button" className={rootClass} onClick={onClick}>
      <span className={iconClass} aria-hidden>
        <Shield size={22} />
      </span>
      <span className={copyClass}>
        <strong>{title}</strong>
        <span>{body}</span>
      </span>
      <ChevronRight size={20} className={chevronClass} aria-hidden />
    </button>
  );
}
