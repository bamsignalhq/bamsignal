import type { CorridorStoryConsentLevelId } from "../../../constants/corridorStories";
import { corridorStoryConsentLabel } from "../../../constants/corridorStories";

type CorridorStoryConsentBadgeProps = {
  consentLevel: CorridorStoryConsentLevelId;
  consentGranted?: boolean;
};

export function CorridorStoryConsentBadge({
  consentLevel,
  consentGranted = false
}: CorridorStoryConsentBadgeProps) {
  if (!consentGranted && consentLevel === "private") {
    return (
      <span className="cs-consent-badge cs-consent-badge--private">Private</span>
    );
  }

  return (
    <span
      className={`cs-consent-badge cs-consent-badge--consent${
        consentGranted ? " cs-consent-badge--granted" : ""
      }`}
    >
      {corridorStoryConsentLabel(consentLevel)}
    </span>
  );
}
