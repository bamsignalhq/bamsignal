import { ProfileStrengthMeter } from "../ProfileStrengthMeter";
import { getProfileStrengthSuggestions } from "../../utils/profileStrength";
import type { DatingProfile } from "../../types";

type DashboardProfileStrengthCardProps = {
  profile: DatingProfile;
  strength: number;
  onCompleteProfile: () => void;
};

export function DashboardProfileStrengthCard({
  profile,
  strength,
  onCompleteProfile
}: DashboardProfileStrengthCardProps) {
  const suggestions = getProfileStrengthSuggestions(profile);

  return (
    <section className="dash-strength card dash-animate">
      <ProfileStrengthMeter strength={strength} />
      {suggestions.length > 0 && strength < 100 && (
        <ul className="dash-strength__suggestions">
          {suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {strength < 100 && (
        <button type="button" className="btn-primary btn-full dash-strength__cta" onClick={onCompleteProfile}>
          Complete Profile
        </button>
      )}
    </section>
  );
}
