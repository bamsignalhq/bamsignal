import { MapPin } from "lucide-react";
import { intentDisplay } from "../constants/intents";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import type { DatingProfile, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";

type ProfileIdentityStripProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
};

function formatCity(profile: DatingProfile): string {
  if (!profile.city) return "Add your city";
  const state = profile.state === "FCT" ? "Abuja" : profile.state;
  return state ? `${profile.city} · ${state}` : profile.city;
}

export function ProfileIdentityStrip({ user, profile, verification }: ProfileIdentityStripProps) {
  const intentChips = profile.intents.slice(0, 2).map((intent) => intentDisplay(intent));
  const interestChips = (profile.interests ?? []).slice(0, 3);

  return (
    <div className="profile-identity-strip">
      <h1 className="profile-identity-strip__name">{user.name || "Your profile"}</h1>
      <p className="profile-identity-strip__meta">
        {profile.age ? <span>{profile.age}</span> : null}
        {profile.age && profile.city ? <span className="profile-identity-strip__dot" aria-hidden>·</span> : null}
        {profile.city ? (
          <span className="profile-identity-strip__city">
            <MapPin size={13} aria-hidden />
            {formatCity(profile)}
          </span>
        ) : null}
      </p>
      <div className="profile-identity-strip__chips">
        {verification.tier > 0 ? <VerificationBadge info={verification} /> : null}
        {profile.verified && !verification.tier ? <VerifiedBadge /> : null}
        {intentChips.map((label) => (
          <span key={label} className="profile-identity-chip profile-identity-chip--intent">
            {label}
          </span>
        ))}
        {interestChips.map((interest) => (
          <span key={interest} className="profile-identity-chip">
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}
