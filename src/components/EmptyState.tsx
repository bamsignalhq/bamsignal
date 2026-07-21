import type { LucideIcon } from "lucide-react";
import { MemberEmptyState } from "./member/MemberUxKit";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** Legacy adapter — delegates to MemberEmptyState for one visual language. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <MemberEmptyState
      title={title}
      body={message}
      actionLabel={actionLabel}
      onAction={onAction}
      className={`empty-state empty-state--calm member-empty-state ${className}`.trim()}
      leading={
        Icon ? (
          <Icon size={28} strokeWidth={1.5} aria-hidden className="empty-state__icon" />
        ) : undefined
      }
    />
  );
}
