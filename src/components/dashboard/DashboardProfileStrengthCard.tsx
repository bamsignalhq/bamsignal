import { ProfileStrengthMeter } from "../ProfileStrengthMeter";
import { getProfileStrengthSuggestions } from "../../utils/profileStrength";
import type { DatingProfile } from "../../types";

type DashboardProfileStrengthCardProps = {
  profile: DatingProfile;
  onCompleteProfile: () => void;
};

export function DashboardProfileStrengthCard({
  profile,
  onCompleteProfile
}: DashboardProfileStrengthCardProps) {
  const suggestions = getProfileStrengthSuggestions(profile);
  if (!suggestions.length) return null;

  return (
    <section className="dash-strength card dash-animate">
      <ProfileStrengthMeter profile={profile} />
      <button type="button" className="btn-secondary btn-full dash-strength__cta" onClick={onCompleteProfile}>
        Edit profile
      </button>
    </section>
  );
}
