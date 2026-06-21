import { ProfileStrengthCard } from "./profile/ProfileStrengthCard";
import type { DatingProfile } from "../types";

type ProfileStrengthMeterProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  compact?: boolean;
  onImprove?: () => void;
};

export function ProfileStrengthMeter({
  profile,
  phoneVerified,
  isPremium,
  compact,
  onImprove
}: ProfileStrengthMeterProps) {
  return (
    <ProfileStrengthCard
      profile={profile}
      phoneVerified={phoneVerified}
      isPremium={isPremium}
      variant={compact ? "mini" : "full"}
      onImprove={onImprove}
    />
  );
}
