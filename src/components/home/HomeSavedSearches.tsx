import { ChevronRight, Eye, Lock } from "lucide-react";
import { SUCCESS_COPY, MONETIZATION_COPY } from "../../constants/copy";
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
      <h3 className="home-saved-searches__title">Saved</h3>
      <ul className="home-saved-searches__list">
        {searches.map((search) => (
          <li key={search.id}>
            <button type="button" className="home-saved-searches__item" onClick={() => onApply(search)}>
              <strong>{search.label}</strong>
              <span>{search.resultCount != null ? `${search.resultCount} people` : "Apply"}</span>
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
  const copy = isPremium ? (
    <>{SUCCESS_COPY.profileVisitorsCount(visitorCount)}</>
  ) : (
    <>
      <strong>{SUCCESS_COPY.profileVisitorsLocked}</strong>
      <span className="home-insight__subtitle">{SUCCESS_COPY.profileVisitorsSubtitle}</span>
    </>
  );

  if (isPremium) {
    return (
      <div className="home-insight home-insight--visitors" aria-label={`${visitorCount} profile visitors`}>
        <span className="home-insight__icon">
          <Eye size={16} aria-hidden />
        </span>
        <span className="home-insight__copy">{copy}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="home-insight home-insight--visitors home-insight--locked"
      onClick={onUpgrade}
      aria-label={MONETIZATION_COPY.seeEveryone}
    >
      <span className="home-insight__icon">
        <Lock size={16} aria-hidden />
      </span>
      <span className="home-insight__copy">{copy}</span>
      <ChevronRight size={16} className="home-insight__chevron" aria-hidden />
    </button>
  );
}
