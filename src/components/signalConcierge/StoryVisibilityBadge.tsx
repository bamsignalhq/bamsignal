import {
  SUCCESS_STORY_VISIBILITY_LABELS,
  type SuccessStoryVisibilityLevel
} from "../../constants/conciergeSuccessStoryConsent";

type StoryVisibilityBadgeProps = {
  level: SuccessStoryVisibilityLevel;
  publishable?: boolean;
  className?: string;
};

export function StoryVisibilityBadge({
  level,
  publishable = false,
  className = ""
}: StoryVisibilityBadgeProps) {
  return (
    <span
      className={`story-visibility-badge story-visibility-badge--${level}${
        publishable ? " story-visibility-badge--publishable" : ""
      }${className ? ` ${className}` : ""}`}
    >
      {SUCCESS_STORY_VISIBILITY_LABELS[level]}
      {publishable ? " · Ready to celebrate" : ""}
    </span>
  );
}
