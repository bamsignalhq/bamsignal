import type { ReactNode } from "react";

type MemberPageHeadProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
  /** Defaults to text back; use "icon" for icon-btn shells (Visitors/Safety/Referral). */
  backVariant?: "text" | "icon";
  backIcon?: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
  minimal?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Shared authenticated page header — uses existing `.member-page-head` styles.
 */
export function MemberPageHead({
  title,
  subtitle,
  eyebrow,
  onBack,
  backLabel = "Back",
  backVariant = "text",
  backIcon,
  trailing,
  leading,
  minimal = false,
  className = "",
  children
}: MemberPageHeadProps) {
  return (
    <header
      className={`member-page-head${minimal ? " member-page-head--minimal" : ""} ${className}`.trim()}
    >
      {onBack ? (
        <button
          type="button"
          className={
            backVariant === "icon" ? "icon-btn member-page-head__back" : "member-page-head__back"
          }
          onClick={onBack}
          aria-label={backVariant === "icon" ? backLabel : undefined}
        >
          {backVariant === "icon" ? backIcon ?? backLabel : backLabel}
        </button>
      ) : null}
      {leading}
      <div className="member-page-head__titles">
        {eyebrow ? <p className="member-page-head__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="member-page-head__sub">{subtitle}</p> : null}
        {children}
      </div>
      {trailing}
    </header>
  );
}
