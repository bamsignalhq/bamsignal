import { BadgeCheck, Crown, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { MONETIZATION_COPY, SUCCESS_COPY } from "../../constants/copy";
import { FREE_DAILY_MESSAGES, FREE_DAILY_SWIPES, STORAGE_KEYS } from "../../constants/limits";
import type { DatingProfile } from "../../types";
import { getProfileStrengthSuggestions } from "../../utils/profileStrength";
import { readDailyCount } from "../../utils/storage";

type DashboardNextStepsProps = {
  profile: DatingProfile;
  isPremium: boolean;
  onCompleteProfile: () => void;
  onOpenPricing: () => void;
};

type Step = {
  id: string;
  label: string;
  detail?: string;
  icon: typeof Sparkles;
  onClick: () => void;
  accent?: "upgrade";
};

export function DashboardNextSteps({
  profile,
  isPremium,
  onCompleteProfile,
  onOpenPricing
}: DashboardNextStepsProps) {
  const swipesUsed = readDailyCount(STORAGE_KEYS.dailySwipes);
  const messagesUsed = readDailyCount(STORAGE_KEYS.dailyMessages);
  const swipesLeft = Math.max(0, FREE_DAILY_SWIPES - swipesUsed);
  const messagesLeft = Math.max(0, FREE_DAILY_MESSAGES - messagesUsed);

  const suggestions = getProfileStrengthSuggestions(profile);

  const steps: Step[] = [];

  if (suggestions.length > 0) {
    steps.push({
      id: "strength",
      label: SUCCESS_COPY.profileShine,
      detail: suggestions[0],
      icon: Sparkles,
      onClick: onCompleteProfile
    });
  }

  if (!profile.verified) {
    steps.push({
      id: "verify",
      label: "Get verified",
      icon: ShieldCheck,
      onClick: onCompleteProfile
    });
  } else {
    steps.push({
      id: "verified",
      label: "Verified",
      icon: BadgeCheck,
      onClick: onCompleteProfile
    });
  }

  if (!profile.voiceIntroUrl) {
    steps.push({
      id: "voice",
      label: "Voice intro",
      icon: Mic,
      onClick: onCompleteProfile
    });
  }

  if (!isPremium) {
    steps.push({
      id: "upgrade",
      label: MONETIZATION_COPY.getSignalPass,
      detail: `${swipesLeft} signal${swipesLeft === 1 ? "" : "s"} · ${messagesLeft} msg${messagesLeft === 1 ? "" : "s"} left`,
      icon: Crown,
      onClick: onOpenPricing,
      accent: "upgrade"
    });
  }

  if (steps.length === 0) return null;

  return (
    <section className="dash-steps dash-animate" aria-label="Next steps">
      <p className="dash-steps__label">Next steps</p>
      <div className="dash-steps__track">
        {steps.map(({ id, label, detail, icon: Icon, onClick, accent }) => (
          <button
            key={id}
            type="button"
            className={`dash-steps__chip ${accent ? `dash-steps__chip--${accent}` : ""}`}
            onClick={onClick}
          >
            <Icon size={15} aria-hidden />
            <span className="dash-steps__chip-text">
              <strong>{label}</strong>
              {detail && <span>{detail}</span>}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
