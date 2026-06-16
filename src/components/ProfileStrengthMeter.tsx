import { SUCCESS_COPY } from "../constants/copy";
import { getProfileStrengthSuggestions } from "../utils/profileStrength";
import type { DatingProfile } from "../types";

type ProfileStrengthMeterProps = {
  profile: DatingProfile;
  compact?: boolean;
};

export function ProfileStrengthMeter({ profile, compact }: ProfileStrengthMeterProps) {
  const suggestions = getProfileStrengthSuggestions(profile);
  if (!suggestions.length) return null;

  return (
    <div className={`profile-strength profile-strength--shine ${compact ? "profile-strength--compact" : ""}`}>
      <p className="profile-strength__label">{SUCCESS_COPY.profileShine}</p>
      {!compact && (
        <p className="profile-strength__hint">{suggestions.join(" · ")}</p>
      )}
    </div>
  );
}
