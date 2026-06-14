import type { LucideIcon } from "lucide-react";
import { AppLogo } from "./AppLogo";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary
}: EmptyStateProps) {
  return (
    <div className="empty-state empty-state--rich">
      <div className="empty-state__art" aria-hidden>
        {Icon ? <Icon size={40} strokeWidth={1.2} /> : <AppLogo size="md" showText={false} />}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {secondaryLabel && onSecondary && (
        <button type="button" className="link-btn" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
