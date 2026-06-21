import {
  getProfileStrengthImprovements,
  getProfileStrengthLevel,
  calculateProfileStrength,
  type ProfileStrengthImprovement
} from "../../utils/profileStrength";
import type { DatingProfile } from "../../types";

type IncompleteProfileChecklistProps = {
  profile: DatingProfile;
  phoneVerified?: boolean;
  isPremium?: boolean;
  limit?: number;
  className?: string;
};

export function IncompleteProfileChecklist({
  profile,
  phoneVerified = false,
  isPremium = false,
  limit = 5,
  className = ""
}: IncompleteProfileChecklistProps) {
  const options = { phoneVerified, isPremium };
  const level = getProfileStrengthLevel(calculateProfileStrength(profile, options));
  if (level.tier === "outstanding") return null;

  const items: ProfileStrengthImprovement[] = getProfileStrengthImprovements(profile, options).slice(
    0,
    limit
  );
  if (!items.length) return null;

  return (
    <section className={`incomplete-profile-checklist ${className}`.trim()} aria-label="Profile improvements">
      <h3 className="incomplete-profile-checklist__title">Add more details when you&apos;re ready</h3>
      <ul className="incomplete-profile-checklist__list">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="incomplete-profile-checklist__item build-later-stagger"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="incomplete-profile-checklist__mark" aria-hidden>
              ○
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
