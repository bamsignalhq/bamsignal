import { useState } from "react";
import {
  SAVE_PROFILE_LABEL,
  SAVED_PROFILE_LABEL
} from "../../constants/savedProfiles";
import { useSavedProfiles } from "../../hooks/useSavedProfiles";

type SaveProfileButtonProps = {
  profileId: string;
  variant?: "discover" | "detail" | "story";
  className?: string;
  onToast?: (message: string) => void;
};

export function SaveProfileButton({
  profileId,
  variant = "discover",
  className = "",
  onToast
}: SaveProfileButtonProps) {
  const { isSaved, toggleSave } = useSavedProfiles();
  const saved = isSaved(profileId);
  const [pulsing, setPulsing] = useState(false);

  const handleClick = async () => {
    const result = await toggleSave(profileId);
    if (result.saved) {
      setPulsing(true);
      window.setTimeout(() => setPulsing(false), 520);
    }
    onToast?.(result.message);
  };

  if (variant === "story") {
    return (
      <button
        type="button"
        className={`save-profile-btn save-profile-btn--story${saved ? " save-profile-btn--saved" : ""}${
          pulsing ? " save-profile-btn--pulse" : ""
        } ${className}`.trim()}
        onClick={() => void handleClick()}
        aria-pressed={saved}
        aria-label={saved ? SAVED_PROFILE_LABEL : SAVE_PROFILE_LABEL}
      >
        <span className="save-profile-btn__emoji" aria-hidden>
          {saved ? "✓" : "🔖"}
        </span>
        {saved ? SAVED_PROFILE_LABEL : SAVE_PROFILE_LABEL}
      </button>
    );
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        className={`save-profile-btn save-profile-btn--detail${saved ? " save-profile-btn--saved" : ""}${
          pulsing ? " save-profile-btn--pulse" : ""
        } ${className}`.trim()}
        onClick={() => void handleClick()}
        aria-pressed={saved}
        aria-label={saved ? SAVED_PROFILE_LABEL : SAVE_PROFILE_LABEL}
      >
        <span className="save-profile-btn__icon" aria-hidden>
          {saved ? "✓" : "🔖"}
        </span>
        {saved ? SAVED_PROFILE_LABEL : SAVE_PROFILE_LABEL}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`save-profile-btn save-profile-btn--discover${saved ? " save-profile-btn--saved" : ""}${
        pulsing ? " save-profile-btn--pulse" : ""
      } ${className}`.trim()}
      onClick={() => void handleClick()}
      aria-label={saved ? SAVED_PROFILE_LABEL : SAVE_PROFILE_LABEL}
      aria-pressed={saved}
    >
      <span className="save-profile-btn__emoji" aria-hidden>
        🔖
      </span>
    </button>
  );
}
