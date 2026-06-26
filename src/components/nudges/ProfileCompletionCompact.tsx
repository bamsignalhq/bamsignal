import { useMemo, useState } from "react";
import type { DatingProfile } from "../../types";
import {
  calculateProfileStrength,
  getProfileStrengthImprovements,
  getProfileStrengthLevel
} from "../../utils/profileStrength";

type ProfileCompletionCompactProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  onImprove?: () => void;
  className?: string;
};

export function ProfileCompletionCompact({
  profile,
  phoneVerified = false,
  isPremium = false,
  onImprove,
  className = ""
}: ProfileCompletionCompactProps) {
  const options = useMemo(() => ({ phoneVerified, isPremium }), [phoneVerified, isPremium]);
  const score = useMemo(() => calculateProfileStrength(profile, options), [profile, options]);
  const level = useMemo(() => getProfileStrengthLevel(score), [score]);
  const missing = useMemo(
    () => getProfileStrengthImprovements(profile, options).slice(0, 5),
    [profile, options]
  );
  const [expanded, setExpanded] = useState(false);

  if (level.tier === "outstanding") return null;

  const handleToggle = () => {
    if (missing.length === 0) {
      onImprove?.();
      return;
    }
    setExpanded((open) => !open);
  };

  return (
    <section
      className={`profile-completion-compact ${expanded ? "profile-completion-compact--open" : ""} ${className}`.trim()}
      aria-label={`Profile ${score}% complete`}
    >
      <button type="button" className="profile-completion-compact__toggle" onClick={handleToggle}>
        <span className="profile-completion-compact__ring" aria-hidden>
          <svg viewBox="0 0 36 36" className="profile-completion-compact__ring-svg">
            <circle className="profile-completion-compact__ring-track" cx="18" cy="18" r="15.5" />
            <circle
              className="profile-completion-compact__ring-fill"
              cx="18"
              cy="18"
              r="15.5"
              strokeDasharray={`${score} 100`}
            />
          </svg>
          <span className="profile-completion-compact__percent">{score}%</span>
        </span>
        <span className="profile-completion-compact__copy">
          <span className="profile-completion-compact__label">Profile Complete</span>
          {missing.length ? (
            <span className="profile-completion-compact__hint">
              {expanded ? "Tap to hide" : `${missing.length} item${missing.length === 1 ? "" : "s"} remaining`}
            </span>
          ) : null}
        </span>
      </button>

      {expanded && missing.length ? (
        <ul className="profile-completion-compact__missing">
          {missing.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      ) : null}

      {onImprove && missing.length ? (
        <button type="button" className="profile-completion-compact__action" onClick={onImprove}>
          Complete profile →
        </button>
      ) : null}
    </section>
  );
}
