import { PROFILE_INTERESTS_PREVIEW } from "../../constants/interestCategories";

type ProfileInterestsPreviewProps = {
  interests: string[];
  onMoreClick?: () => void;
  variant?: "default" | "premium";
};

export function ProfileInterestsPreview({
  interests,
  onMoreClick,
  variant = "default"
}: ProfileInterestsPreviewProps) {
  if (!interests.length) return null;

  const visible = interests.slice(0, PROFILE_INTERESTS_PREVIEW);
  const hiddenCount = interests.length - visible.length;
  const premium = variant === "premium";

  return (
    <div
      className={
        premium
          ? "profile-premium-pills profile-interests-preview"
          : "profile-read-chips profile-read-chips--compact profile-interests-preview"
      }
    >
      {visible.map((interest) => (
        <span
          key={interest}
          className={premium ? "profile-premium-pill" : "profile-read-chip profile-read-chip--picked"}
        >
          {interest}
        </span>
      ))}
      {hiddenCount > 0 ? (
        onMoreClick ? (
          <button type="button" className="profile-read-chip profile-read-chip--more" onClick={onMoreClick}>
            +{hiddenCount} more
          </button>
        ) : (
          <span className="profile-read-chip profile-read-chip--more">+{hiddenCount} more</span>
        )
      ) : null}
    </div>
  );
}
