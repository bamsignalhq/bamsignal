import { Lock, Users } from "lucide-react";
import type { SavedSearch } from "../../types";

type HomeSavedSearchesProps = {
  searches: SavedSearch[];
  onApply: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
};

export function HomeSavedSearches({ searches, onApply, onDelete }: HomeSavedSearchesProps) {
  if (!searches.length) return null;

  return (
    <section className="home-saved-searches" aria-label="Saved searches">
      <h3 className="home-saved-searches__title">Saved searches</h3>
      <ul className="home-saved-searches__list">
        {searches.map((search) => (
          <li key={search.id}>
            <button type="button" className="home-saved-searches__item" onClick={() => onApply(search)}>
              <strong>{search.label}</strong>
              <span>
                {search.resultCount != null ? `${search.resultCount} profiles` : "Tap to apply"}
              </span>
            </button>
            <button
              type="button"
              className="home-saved-searches__delete"
              onClick={() => onDelete(search.id)}
              aria-label={`Delete ${search.label}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

type HomeProfileVisitorsCardProps = {
  isPremium: boolean;
  visitorCount: number;
  onUpgrade: () => void;
};

export function HomeProfileVisitorsCard({ isPremium, visitorCount, onUpgrade }: HomeProfileVisitorsCardProps) {
  return (
    <section className={`home-visitors card ${!isPremium ? "home-visitors--locked" : ""}`} aria-label="Profile visitors">
      <div className="home-visitors__icon">
        {isPremium ? <Users size={20} aria-hidden /> : <Lock size={20} aria-hidden />}
      </div>
      <div className="home-visitors__copy">
        <h3>Profile Visitors</h3>
        {isPremium ? (
          <p>
            <strong>{visitorCount}</strong> people viewed your profile this week
          </p>
        ) : (
          <p>See who viewed your profile with Signal Pass</p>
        )}
      </div>
      {!isPremium ? (
        <button type="button" className="btn-secondary btn-sm" onClick={onUpgrade}>
          Unlock
        </button>
      ) : null}
    </section>
  );
}
