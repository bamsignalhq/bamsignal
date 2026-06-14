import { calculateProfileStrength, profileStrengthHint } from "../utils/profileStrength";

type ProfileStrengthMeterProps = {
  strength: number;
  compact?: boolean;
};

export function ProfileStrengthMeter({ strength, compact }: ProfileStrengthMeterProps) {
  const hint = profileStrengthHint(strength);

  return (
    <div className={`profile-strength ${compact ? "profile-strength--compact" : ""}`}>
      <div className="profile-strength__head">
        <span className="profile-strength__label">Profile Strength</span>
        <strong className="profile-strength__value">{strength}%</strong>
      </div>
      <div className="profile-strength__track" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="profile-strength__fill"
          style={{ width: `${strength}%` }}
        />
      </div>
      {!compact && <p className="profile-strength__hint">{hint}</p>}
    </div>
  );
}
