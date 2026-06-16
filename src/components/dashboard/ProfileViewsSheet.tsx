import { Crown, Eye, X } from "lucide-react";
import { MONETIZATION_COPY } from "../../constants/copy";
import { ShowcaseImage } from "../ShowcaseImage";
import type { ProfileViewer } from "../../utils/profileViews";

type ProfileViewsSheetProps = {
  open: boolean;
  onClose: () => void;
  count: number;
  viewsToday: number;
  viewers: ProfileViewer[];
  isPremium: boolean;
  onUpgrade: () => void;
  onOpenFullPage?: () => void;
};

export function ProfileViewsSheet({
  open,
  onClose,
  count,
  viewsToday,
  viewers,
  isPremium,
  onUpgrade,
  onOpenFullPage
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
              👀 {displayCount} profile view{displayCount === 1 ? "" : "s"} today
            </p>
          </div>
          <button type="button" className="icon-btn profile-views-sheet__close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </header>

        {isPremium && viewers.length > 0 ? (
          <>
            <ul className="profile-views-sheet__list">
              {viewers.slice(0, 8).map((viewer) => (
                <li key={`${viewer.profileId}-${viewer.at}`}>
                  <ShowcaseImage src={viewer.photo} alt="" loading="lazy" />
                  <div>
                    <strong>
                      {viewer.name}, {viewer.age}
                    </strong>
                    <span>
                      {viewer.city} · {viewer.compatibility}% compatibility
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {onOpenFullPage && (
              <button type="button" className="link-btn profile-views-sheet__more" onClick={onOpenFullPage}>
                See all visitors
              </button>
            )}
          </>
        ) : (
          <div className="profile-views-sheet__locked">
            <Eye size={32} aria-hidden />
            <p className="profile-views-sheet__count-only">
              <strong>{displayCount}</strong> profile view{displayCount === 1 ? "" : "s"}
            </p>
            <p>{MONETIZATION_COPY.lockedFeature}</p>
            <button
              type="button"
              className="btn-primary btn-full"
              onClick={() => {
                onClose();
                onUpgrade();
              }}
            >
              <Crown size={18} />
              {MONETIZATION_COPY.seeEveryone}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
