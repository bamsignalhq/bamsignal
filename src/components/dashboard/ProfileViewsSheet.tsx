import { X } from "lucide-react";
import type { ProfileViewer } from "../../utils/profileViews";

type ProfileViewsSheetProps = {
  open: boolean;
  onClose: () => void;
  count: number;
  viewsToday: number;
  viewers: ProfileViewer[];
  isPremium: boolean;
  onUpgrade: () => void;
};

export function ProfileViewsSheet({
  open,
  onClose,
  count,
  viewsToday,
  viewers,
  isPremium,
  onUpgrade
}: ProfileViewsSheetProps) {
  if (!open) return null;

  const displayCount = viewsToday > 0 ? viewsToday : count;

  return (
    <div className="profile-views-sheet" role="dialog" aria-modal="true" aria-label="Profile views">
      <button type="button" className="profile-views-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <article className="profile-views-sheet__panel">
        <header className="profile-views-sheet__head">
          <div>
            <h2>Profile Views</h2>
            <p>
              {displayCount} {displayCount === 1 ? "person" : "people"} viewed your profile
              {viewsToday > 0 ? " today" : ""}
            </p>
          </div>
          <button type="button" className="icon-btn profile-views-sheet__close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </header>

        {isPremium && viewers.length > 0 ? (
          <ul className="profile-views-sheet__list">
            {viewers.slice(0, 12).map((viewer, index) => (
              <li key={`${viewer.at}-${index}`}>
                <img src={viewer.photo} alt="" />
                <div>
                  <strong>{viewer.name}</strong>
                  <span>{viewer.city}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="profile-views-sheet__locked">
            <p className="profile-views-sheet__count-only">
              <strong>{displayCount}</strong> profile view{displayCount === 1 ? "" : "s"}
            </p>
            <p>Upgrade to see who&apos;s curious about you.</p>
            <button
              type="button"
              className="btn-primary btn-full"
              onClick={() => {
                onClose();
                onUpgrade();
              }}
            >
              See who viewed you
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
