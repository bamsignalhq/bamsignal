import { ProfileStrengthCard } from "../profile/ProfileStrengthCard";
import type { DatingProfile } from "../../types";

type DashboardProfileStrengthCardProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  onCompleteProfile: () => void;
};

export function DashboardProfileStrengthCard({
  profile,
  phoneVerified,
  isPremium,
  onCompleteProfile
}: DashboardProfileStrengthCardProps) {
  return (
    <section className="dash-strength dash-animate">
      <ProfileStrengthCard
        profile={profile}
        phoneVerified={phoneVerified}
        isPremium={isPremium}
        onImprove={onCompleteProfile}
      />
    </section>
  );
}
