import {
  JOURNEY_STORY_CATEGORY_EMOJI,
  JOURNEY_STORY_CATEGORY_LABELS,
  type JourneyStoryCategoryId
} from "../../constants/journeyStoryCategories";

type StoryCategoryBadgeProps = {
  categoryId: JourneyStoryCategoryId;
  className?: string;
};

export function StoryCategoryBadge({ categoryId, className = "" }: StoryCategoryBadgeProps) {
  const emoji = JOURNEY_STORY_CATEGORY_EMOJI[categoryId];
  const label = JOURNEY_STORY_CATEGORY_LABELS[categoryId];

  return (
    <span className={`story-category-badge${className ? ` ${className}` : ""}`}>
      <span className="story-category-badge__emoji" aria-hidden>
        {emoji}
      </span>
      <span>{label}</span>
    </span>
  );
}
