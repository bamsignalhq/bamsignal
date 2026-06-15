import { MapPin, UserRound } from "lucide-react";
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
};

const DEFAULT_COVER = MOMENT_SETS.lagosRooftop[0];

function formatLocation(profile: DatingProfile): string {
  if (!profile.city) return "Add your city";
  const state = profile.state === "FCT" ? "Abuja" : profile.state;
  return state ? `${profile.city}, ${state}` : profile.city;
}

export function ProfileCoverHeader({ user, profile, verification }: ProfileCoverHeaderProps) {
  const avatar = profile.photos[0] ?? null;
  const cover = avatar ?? DEFAULT_COVER;

  return (
    <header className="profile-hero">
      <div className="profile-hero__cover" aria-hidden={!avatar}>
        <ShowcaseImage
          src={cover}
          alt=""
          className="profile-hero__cover-blur profile-hero__cover-img--face"
        />
        <ShowcaseImage
          src={cover}
          alt=""
          className="profile-hero__cover-img profile-hero__cover-img--face"
        />
        <div className="profile-hero__cover-shade" />
      </div>

      <div className="profile-hero__body">
        <div className="profile-hero__avatar-ring">
          {avatar ? (
            <ShowcaseImage
              src={avatar}
              alt={user.name || "Profile photo"}
              className="profile-hero__avatar profile-hero__avatar-img--face"
            />
          ) : (
            <div className="profile-hero__avatar profile-hero__avatar--empty">
              <UserRound size={40} aria-hidden />
            </div>
          )}
        </div>

        <div className="profile-hero__meta">
          <h1 className="profile-hero__name">{user.name || "Your profile"}</h1>
          {profile.age ? <p className="profile-hero__age">{profile.age}</p> : null}
          <p className="profile-hero__location">
            <MapPin size={14} aria-hidden />
            {formatLocation(profile)}
          </p>
          {(verification.tier > 0 || profile.verified) && (
            <div className="profile-hero__badges">
              {verification.tier > 0 && <VerificationBadge info={verification} />}
              {profile.verified && !verification.tier && <VerifiedBadge />}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
