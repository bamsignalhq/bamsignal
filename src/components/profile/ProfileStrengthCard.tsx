import {
  calculateProfileStrength,
  getProfileStrengthImprovements,
  getProfileStrengthLevel,
  type ProfileStrengthTier
} from "../../utils/profileStrength";
import type { DatingProfile } from "../../types";

type ProfileStrengthCardProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  variant?: "full" | "mini";
  onImprove?: () => void;
  className?: string;
};

const TIER_GRADIENT: Record<ProfileStrengthTier, string> = {
  "getting-started": "linear-gradient(90deg, #8b93a7, #a8b0c2)",
  good: "linear-gradient(90deg, #4f8cff, #6aa8ff)",
  "very-good": "linear-gradient(90deg, #7a4df3, #9b6dff)",
  excellent: "linear-gradient(90deg, #c94bb8, #e91e8f)",
  outstanding: "linear-gradient(90deg, #d4a017, #f0c75e)"
};

export function ProfileStrengthCard({
  profile,
  phoneVerified = false,
  isPremium = false,
  variant = "full",
  onImprove,
  className = ""
}: ProfileStrengthCardProps) {
  const options = { phoneVerified, isPremium };
  const score = calculateProfileStrength(profile, options);
  const level = getProfileStrengthLevel(score);
  const improvements = getProfileStrengthImprovements(profile, options).slice(0, 5);
  const isOutstanding = level.tier === "outstanding";
  const isGettingStarted = level.tier === "getting-started";

  if (variant === "mini") {
    return (
      <section
        className={`profile-strength-card profile-strength-card--mini ${className}`.trim()}
        aria-label={`Profile Strength ${level.label}`}
      >
        <div className="profile-strength-card__mini-copy">
          <span className="profile-strength-card__eyebrow">Profile Strength</span>
          <span className={`profile-strength-badge profile-strength-badge--${level.tier}`}>
            {level.label}
          </span>
        </div>
        {onImprove ? (
          <button type="button" className="btn-secondary btn-sm profile-strength-card__mini-btn" onClick={onImprove}>
            Improve
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={`profile-strength-card profile-strength-card--full ${className}`.trim()}
      aria-label={`Profile Strength ${level.label}`}
    >
      <header className="profile-strength-card__head">
        <div>
          <p className="profile-strength-card__eyebrow">Your Profile Strength</p>
          <span className={`profile-strength-badge profile-strength-badge--lg profile-strength-badge--${level.tier}`}>
            {level.label}
          </span>
        </div>
      </header>

      <p className="profile-strength-card__subtext">
        {isGettingStarted
          ? "Let's build your profile together."
          : isOutstanding
            ? "Your profile is among the strongest on BamSignal."
            : "Complete profiles receive more replies and better visibility."}
      </p>

      <div
        className="profile-strength-card__progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`Profile strength ${level.label}`}
      >
        <div className="profile-strength-card__track">
          <span
            className={`profile-strength-card__fill profile-strength-card__fill--${level.tier}`}
            style={{ width: `${score}%`, background: TIER_GRADIENT[level.tier] }}
          />
        </div>
      </div>

      {!isOutstanding && improvements.length ? (
        <ul className="profile-strength-card__checklist">
          {improvements.map((item, index) => (
            <li
              key={item.id}
              className="profile-strength-card__check-item empty-chat-stagger"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="profile-strength-card__check-mark" aria-hidden>
                ○
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}

      {onImprove && !isOutstanding ? (
        <button type="button" className="btn-primary btn-full profile-strength-card__cta" onClick={onImprove}>
          Improve Profile
        </button>
      ) : null}
    </section>
  );
}
