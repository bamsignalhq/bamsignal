import { X } from "lucide-react";
import type { DatingProfile } from "../../types";
import {
  dismissProfileReminder,
  isBelowExcellentStrength,
  shouldShowProfileReminder
} from "../../utils/buildProfileLater";
import { hasVoiceVibe } from "../../utils/voiceVibe";

export type ProfileReminderVariant = "home" | "discover" | "empty-chat";

type ProfileReminderCardProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  variant?: ProfileReminderVariant;
  onContinue: () => void;
  onDismiss?: () => void;
  className?: string;
};

export function ProfileReminderCard({
  profile,
  phoneVerified = false,
  isPremium = false,
  variant = "home",
  onContinue,
  onDismiss,
  className = ""
}: ProfileReminderCardProps) {
  const options = { phoneVerified, isPremium };

  if (variant === "discover") {
    if (hasVoiceVibe(profile) || !isBelowExcellentStrength(profile, options) || !shouldShowProfileReminder()) {
      return null;
    }
    return (
      <aside
        className={`profile-reminder-card profile-reminder-card--discover ${className}`.trim()}
        aria-label="Profile tip"
      >
        <p className="profile-reminder-card__copy">
          Voice Vibes help people understand your personality.
        </p>
        <div className="profile-reminder-card__actions">
          <button type="button" className="btn-secondary btn-sm" onClick={onContinue}>
            Add Voice Vibe
          </button>
          {onDismiss ? (
            <button
              type="button"
              className="profile-reminder-card__dismiss"
              onClick={() => {
                dismissProfileReminder();
                onDismiss();
              }}
              aria-label="Dismiss reminder"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </aside>
    );
  }

  if (variant === "empty-chat") {
    if (!isBelowExcellentStrength(profile, options)) return null;
    return (
      <section className={`profile-reminder-card profile-reminder-card--empty-chat ${className}`.trim()}>
        <p className="profile-reminder-card__copy">Improve your profile to get more replies.</p>
        <button type="button" className="btn-primary btn-full" onClick={onContinue}>
          Build My Profile
        </button>
      </section>
    );
  }

  if (!isBelowExcellentStrength(profile, options) || !shouldShowProfileReminder()) {
    return null;
  }

  return (
    <section
      className={`profile-reminder-card profile-reminder-card--home ${className}`.trim()}
      aria-label="Build your profile"
    >
      <div className="profile-reminder-card__body">
        <h2 className="profile-reminder-card__title">Build Your Profile</h2>
        <p className="profile-reminder-card__copy">
          A few more details can help people know you better.
        </p>
      </div>
      <div className="profile-reminder-card__actions">
        <button type="button" className="btn-primary btn-sm" onClick={onContinue}>
          Continue
        </button>
        {onDismiss ? (
          <button
            type="button"
            className="profile-reminder-card__dismiss"
            onClick={() => {
              dismissProfileReminder();
              onDismiss();
            }}
            aria-label="Dismiss reminder"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </section>
  );
}
