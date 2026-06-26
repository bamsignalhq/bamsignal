import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state empty-state--calm member-empty-state">
      {Icon ? <Icon size={28} strokeWidth={1.5} aria-hidden className="empty-state__icon" /> : null}
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
