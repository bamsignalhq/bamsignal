import { Loader2, WifiOff, SignalLow } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  MEMBER_BUTTON_PRIMARY,
  MEMBER_BUTTON_SECONDARY,
  MEMBER_SHEET_PANEL,
  MEMBER_SHEET_SCRIM
} from "../../constants/uxDesignSystem";

type MemberLoadingStateProps = {
  label?: string;
  compact?: boolean;
};

export function MemberLoadingState({ label = "Loading…", compact = false }: MemberLoadingStateProps) {
  return (
    <div
      className={`member-ux-loading${compact ? " member-ux-loading--compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="member-ux-loading__spinner" size={compact ? 18 : 22} aria-hidden />
      <p>{label}</p>
    </div>
  );
}

type MemberSkeletonProps = {
  lines?: number;
  className?: string;
};

export function MemberSkeleton({ lines = 3, className = "" }: MemberSkeletonProps) {
  return (
    <div className={`member-ux-skeleton ${className}`.trim()} aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <span
          key={index}
          className="member-ux-skeleton__line"
          style={{ width: index === lines - 1 ? "72%" : "100%" }}
        />
      ))}
    </div>
  );
}

type MemberEmptyStateProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
};

export function MemberEmptyState({
  title,
  body,
  actionLabel,
  onAction,
  children,
  className = ""
}: MemberEmptyStateProps) {
  return (
    <section className={`member-ux-empty ${className}`.trim()} aria-labelledby="member-ux-empty-title">
      <h2 id="member-ux-empty-title" className="member-ux-empty__title">
        {title}
      </h2>
      {body ? <p className="member-ux-empty__body">{body}</p> : null}
      {children}
      {actionLabel && onAction ? (
        <button type="button" className={MEMBER_BUTTON_PRIMARY} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

type MemberErrorStateProps = {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function MemberErrorState({
  title = "Something went wrong",
  body = "Check your connection and try again.",
  onRetry,
  retryLabel = "Try again"
}: MemberErrorStateProps) {
  return (
    <div className="member-ux-error" role="alert">
      <h3 className="member-ux-error__title">{title}</h3>
      <p className="member-ux-error__body">{body}</p>
      {onRetry ? (
        <button type="button" className={MEMBER_BUTTON_SECONDARY} onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

type MemberOfflineBannerProps = {
  onRetry?: () => void;
};

export function MemberOfflineBanner({ onRetry }: MemberOfflineBannerProps) {
  return (
    <div className="member-ux-network member-ux-network--offline" role="status" aria-live="polite">
      <WifiOff size={16} aria-hidden />
      <span>You&apos;re offline. Some actions will resume when you reconnect.</span>
      {onRetry ? (
        <button type="button" className="member-ux-network__action" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function MemberSlowConnectionBanner() {
  return (
    <div className="member-ux-network member-ux-network--slow" role="status" aria-live="polite">
      <SignalLow size={16} aria-hidden />
      <span>Slow connection — loading may take a little longer.</span>
    </div>
  );
}

type MemberSheetProps = {
  open: boolean;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
};

export function MemberSheet({
  open,
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  footer,
  ariaLabel
}: MemberSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={MEMBER_SHEET_SCRIM} onClick={onClose}>
      <div
        ref={panelRef}
        className={MEMBER_SHEET_PANEL}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="member-ux-sheet__head">
          <div>
            {eyebrow ? <p className="member-ux-sheet__eyebrow">{eyebrow}</p> : null}
            <h2 id={titleId} className="member-ux-sheet__title">
              {title}
            </h2>
            {subtitle ? <p className="member-ux-sheet__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="member-ux-sheet__close" onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>
        <div className="member-ux-sheet__body">{children}</div>
        {footer ? <footer className="member-ux-sheet__foot">{footer}</footer> : null}
      </div>
    </div>
  );
}
