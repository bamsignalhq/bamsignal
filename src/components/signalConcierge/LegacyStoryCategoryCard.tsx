import { STORY_CATEGORIES_TITLE } from "../../constants/journeyStoryCategories";
import type { JourneyStoryCategoryEntry } from "../../types/JourneyStoryType";
import { StoryCategoryBadge } from "./StoryCategoryBadge";

type LegacyStoryCategoryCardProps = {
  categories: JourneyStoryCategoryEntry[];
  celebrate?: boolean;
};

export function LegacyStoryCategoryCard({
  categories,
  celebrate = false
}: LegacyStoryCategoryCardProps) {
  return (
    <section
      className={`legacy-story-category-card${
        celebrate ? " legacy-story-category-card--celebrate" : ""
      }`}
    >
      <header className="legacy-story-category-card__head">
        <h4>{STORY_CATEGORIES_TITLE}</h4>
        {celebrate ? (
          <p className="legacy-story-category-card__sub">Chapters of your journey — honored forever.</p>
        ) : null}
      </header>
      {categories.length ? (
        <ul className="legacy-story-category-card__list">
          {categories.map((entry) => (
              <li key={entry.id}>
                <StoryCategoryBadge categoryId={entry.id} />
                {entry.note && !celebrate ? (
                  <span className="legacy-story-category-card__note">{entry.note}</span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : (
        <p className="legacy-story-category-card__empty">Story categories will appear as your journey evolves.</p>
      )}
    </section>
  );
}
