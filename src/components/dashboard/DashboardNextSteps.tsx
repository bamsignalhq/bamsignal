import { BadgeCheck, Crown, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { FREE_DAILY_MESSAGES, FREE_DAILY_SWIPES, STORAGE_KEYS } from "../../constants/limits";
import type { DatingProfile } from "../../types";
import { readDailyCount } from "../../utils/storage";

type DashboardNextStepsProps = {
  profile: DatingProfile;
  strength: number;
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
  strength,
  isPremium,
  onCompleteProfile,
  onOpenPricing
}: DashboardNextStepsProps) {
  const swipesUsed = readDailyCount(STORAGE_KEYS.dailySwipes);
  const messagesUsed = readDailyCount(STORAGE_KEYS.dailyMessages);
  const swipesLeft = Math.max(0, FREE_DAILY_SWIPES - swipesUsed);
  const messagesLeft = Math.max(0, FREE_DAILY_MESSAGES - messagesUsed);

  const steps: Step[] = [];

  if (strength < 100) {
    steps.push({
      id: "strength",
      label: `Profile ${strength}%`,
      detail: "Complete profile",
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
      label: "Upgrade",
      detail: `${swipesLeft} swipes · ${messagesLeft} msgs left`,
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
