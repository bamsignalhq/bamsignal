import {
  CELEBRATING_YOUR_JOURNEY,
  JOURNEY_STORY_CATEGORIES,
  JOURNEY_STORY_FUTURE_FORMATS,
  STORY_CATEGORIES_TITLE,
  type JourneyStoryCategoryId
} from "../../constants/journeyStoryCategories";
import type { JourneyStoryProfile } from "../../types/JourneyStoryType";
import { StoryCategoryBadge } from "./StoryCategoryBadge";

type StoryCategoryCardProps = {
  profile: JourneyStoryProfile;
  readOnly?: boolean;
  onToggleCategory?: (categoryId: JourneyStoryCategoryId) => void;
  className?: string;
};

export function StoryCategoryCard({
  profile,
  readOnly = false,
  onToggleCategory,
  className = ""
}: StoryCategoryCardProps) {
  const activeIds = new Set(profile.categories.map((item) => item.id));

  return (
    <section className={`story-category-card signal-concierge-glass${className ? ` ${className}` : ""}`}>
      <header className="story-category-card__head">
        <h3>{STORY_CATEGORIES_TITLE}</h3>
        <p>{CELEBRATING_YOUR_JOURNEY}</p>
      </header>

      {profile.categories.length ? (
        <ul className="story-category-card__active" aria-label={STORY_CATEGORIES_TITLE}>
          {profile.categories.map((entry) => (
            <li key={entry.id}>
              <StoryCategoryBadge categoryId={entry.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="story-category-card__empty">No story categories yet — your journey can grow over time.</p>
      )}

      {!readOnly ? (
        <div className="story-category-card__picker">
          <p className="story-category-card__picker-label">Add a journey story type</p>
          <div className="story-category-card__options">
            {JOURNEY_STORY_CATEGORIES.map((category) => {
              const active = activeIds.has(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`story-category-card__option${active ? " is-active" : ""}`}
                  onClick={() => onToggleCategory?.(category.id)}
                  disabled={active}
                  title={category.description}
                >
                  <span aria-hidden>{category.emoji}</span>
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="story-category-card__future" aria-label="Future story formats">
        {JOURNEY_STORY_FUTURE_FORMATS.map((format) => format.label).join(" · ")} — reserved for future
        celebration formats. Not available yet.
      </p>
    </section>
  );
}
