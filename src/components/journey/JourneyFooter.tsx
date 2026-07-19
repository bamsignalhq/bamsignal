import type { ReactNode } from "react";

export function JourneyFooter({ children }: { children: ReactNode }) {
  return <footer className="journey-footer">{children}</footer>;
}

export function JourneyPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className="journey-btn journey-btn--primary" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function JourneySecondaryButton({
  children,
  onClick
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="journey-btn journey-btn--secondary" onClick={onClick}>
      {children}
    </button>
  );
}
