import { ProfileStrengthMeter } from "../ProfileStrengthMeter";
import {
  getProfileCompletenessChecklist,
  profileCompletenessCount
} from "../../utils/profileStrength";
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
  const checklist = getProfileCompletenessChecklist(profile);
  const { done, total } = profileCompletenessCount(profile);

  return (
    <section className="dash-strength card dash-animate">
      <header className="dash-strength__head">
        <h2>Complete your profile</h2>
        <span className="dash-strength__count">
          {done}/{total} Complete
        </span>
      </header>
      <ProfileStrengthMeter strength={strength} compact />
      <ul className="dash-strength__checklist">
        {checklist.map((item) => (
          <li key={item.id} className={item.done ? "done" : ""}>
            <span aria-hidden>{item.done ? "✓" : "○"}</span>
            {item.label}
          </li>
        ))}
      </ul>
      {strength < 100 && (
        <button type="button" className="btn-primary btn-full dash-strength__cta" onClick={onCompleteProfile}>
          Complete Profile
        </button>
      )}
    </section>
  );
}
