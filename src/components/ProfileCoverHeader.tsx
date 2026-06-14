import { Camera, MapPin, Pencil, Settings } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { ShowcaseImage } from "./ShowcaseImage";
import { MOMENT_SETS } from "../constants/showcase";
import type { DatingProfile, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  isPremium: boolean;
  onEditPhoto?: () => void;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

const DEFAULT_COVER = MOMENT_SETS.lagosRooftop[0];

export function ProfileCoverHeader({
  user,
  profile,
  verification,
  isPremium,
  onEditPhoto,
  onEditProfile,
  onOpenSettings
}: ProfileCoverHeaderProps) {
  const cover = profile.photos[0] || DEFAULT_COVER;

  return (
    <header className="profile-fb profile-fb--premium">
      <div className="profile-fb__cover">
        <ShowcaseImage src={cover} alt="" className="profile-fb__cover-img profile-fb__cover-img--face" />
        <div className="profile-fb__cover-shade" />
        {onEditPhoto && (
          <button type="button" className="profile-fb__cover-edit" onClick={onEditPhoto}>
            <Camera size={16} /> Edit photo
          </button>
        )}
      </div>

      <div className="profile-fb__identity profile-fb__identity--compact">
        <div className="profile-fb__meta">
          <h1>
            {user.name || "Your profile"}
            {profile.age ? `, ${profile.age}` : ""}
          </h1>
          <p className="profile-fb__location">
            <MapPin size={14} />
            {profile.city ? `${profile.city}${profile.state ? `, ${profile.state === "FCT" ? "Abuja" : profile.state}` : ""}` : "Add your city"}
          </p>
          <div className="profile-fb__badges">
            {verification.tier > 0 && <VerificationBadge info={verification} />}
            {profile.verified && !verification.tier && <VerifiedBadge />}
            {isPremium && <span className="premium-pill">Premium</span>}
          </div>
        </div>
        <div className="profile-fb__actions">
          {onEditProfile && (
            <button type="button" className="btn-secondary btn-sm" onClick={onEditProfile}>
              <Pencil size={14} /> Edit profile
            </button>
          )}
          {onOpenSettings && (
            <button type="button" className="btn-secondary btn-sm profile-fb__settings-btn" onClick={onOpenSettings}>
              <Settings size={14} /> Settings
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
