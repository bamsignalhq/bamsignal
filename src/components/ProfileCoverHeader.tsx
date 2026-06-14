import { Camera, MapPin, Pencil } from "lucide-react";
import { FoundingMemberBadge } from "./FoundingMemberBadge";
import { ProfileStrengthMeter } from "./ProfileStrengthMeter";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { ShowcaseImage } from "./ShowcaseImage";
import { MOMENT_SETS } from "../constants/showcase";
import type { DatingProfile, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  strength: number;
  verification: VerificationInfo;
  isPremium: boolean;
  isFoundingMember: boolean;
  onEditPhoto?: () => void;
};

const DEFAULT_COVER = MOMENT_SETS.lagosRooftop[0];

export function ProfileCoverHeader({
  user,
  profile,
  strength,
  verification,
  isPremium,
  isFoundingMember,
  onEditPhoto
}: ProfileCoverHeaderProps) {
  const cover = profile.photos[0] || DEFAULT_COVER;
  const avatar = profile.photos[0];

  return (
    <header className="profile-fb">
      <div className="profile-fb__cover">
        <ShowcaseImage src={cover} alt="" className="profile-fb__cover-img" />
        <div className="profile-fb__cover-shade" />
        {onEditPhoto && (
          <button type="button" className="profile-fb__cover-edit" onClick={onEditPhoto}>
            <Camera size={16} /> Edit cover
          </button>
        )}
      </div>

      <div className="profile-fb__identity">
        <div className="profile-fb__avatar-wrap">
          {avatar ? (
            <img src={avatar} alt="" className="profile-fb__avatar" />
          ) : (
            <div className="profile-fb__avatar profile-fb__avatar--empty">
              <Camera size={28} />
            </div>
          )}
          {onEditPhoto && (
            <button type="button" className="profile-fb__avatar-edit" onClick={onEditPhoto} aria-label="Edit photo">
              <Pencil size={14} />
            </button>
          )}
        </div>

        <div className="profile-fb__meta">
          <h1>
            {user.name || "Your profile"}
            {profile.age ? `, ${profile.age}` : ""}
          </h1>
          <p className="profile-fb__location">
            <MapPin size={14} />
            {profile.city || "Add your city"}
          </p>
          <div className="profile-fb__badges">
            {isFoundingMember && <FoundingMemberBadge />}
            {verification.tier > 0 && <VerificationBadge info={verification} />}
            {profile.verified && !verification.tier && <VerifiedBadge />}
            {isPremium && <span className="premium-pill">Premium</span>}
          </div>
          {profile.bio && <p className="profile-fb__bio">{profile.bio}</p>}
        </div>
      </div>

      <div className="profile-fb__stats card">
        <ProfileStrengthMeter strength={strength} compact />
      </div>
    </header>
  );
}
