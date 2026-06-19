import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

type ProfileOverviewCardProps = {
  title: string;
  onEdit?: () => void;
  editLabel?: string;
  className?: string;
  children: ReactNode;
};

export function ProfileOverviewCard({
  title,
  onEdit,
  editLabel,
  className = "",
  children
}: ProfileOverviewCardProps) {
  return (
    <section className={`profile-premium-card ${className}`.trim()}>
      <header className="profile-premium-card__head">
        <h3 className="profile-premium-card__title">{title}</h3>
        {onEdit ? (
          <button
            type="button"
            className="profile-premium-card__edit"
            onClick={onEdit}
            aria-label={editLabel ?? `Edit ${title}`}
          >
            <Pencil size={18} strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </header>
      <div className="profile-premium-card__body">{children}</div>
    </section>
  );
}
