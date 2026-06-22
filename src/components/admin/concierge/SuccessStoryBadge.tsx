import type { SuccessStoryVisibilityLevel } from "../../../constants/conciergeSuccessStoryConsent";
import { successStoryTypeLabel } from "../../../constants/successStoryEngine";

type SuccessStoryBadgeProps = {
  storyType: SuccessStoryVisibilityLevel;
  privateDefault?: boolean;
  publishable?: boolean;
};

export function SuccessStoryBadge({
  storyType,
  privateDefault = true,
  publishable = false
}: SuccessStoryBadgeProps) {
  return (
    <span className="success-story-badge">
      {privateDefault && !publishable ? (
        <span className="success-story-badge__private">Private</span>
      ) : null}
      <span className="success-story-badge__type">{successStoryTypeLabel(storyType)}</span>
    </span>
  );
}
