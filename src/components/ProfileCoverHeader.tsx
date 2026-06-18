import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { useState } from "react";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { ShowcaseImage } from "./ShowcaseImage";
import type { DatingProfile, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { hasExplicitCover, resolveCoverPhoto, safePhotos } from "../utils/safeProfile";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  coverOnly?: boolean;
};

function formatLocation(profile: DatingProfile): string {
  if (!profile.city) return "Add your city";
  const state = profile.state === "FCT" ? "Abuja" : profile.state;
  return state ? `${profile.city}, ${state}` : profile.city;
}

export function ProfileCoverHeader({ user, profile, coverOnly }: ProfileCoverHeaderProps) {
  const photos = safePhotos(profile.photos);
  const [index, setIndex] = useState(0);
  const avatar = photos[index] ?? photos[0] ?? null;
  const cover = resolveCoverPhoto(profile);
  const customCover = hasExplicitCover(profile);

  const shift = (dir: -1 | 1) => {
    if (photos.length <= 1) return;
    setIndex((i) => (i + dir + photos.length) % photos.length);
  };

  return (
    <header className={`profile-hero${coverOnly ? " profile-hero--me" : ""}`}>
      <div className="profile-hero__cover" aria-hidden={!avatar && !customCover}>
        <ShowcaseImage
          src={cover}
          alt=""
          fallbackSrc={DEFAULT_PROFILE_COVER}
          className={`profile-hero__cover-media${customCover ? "" : " profile-hero__cover-media--default"}`}
        />
        <div className="profile-hero__cover-shade" />
      </div>

      <div className="profile-hero__body">
        <div className="profile-hero__avatar-block">
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
          {photos.length > 1 ? (
            <div className="profile-hero__avatar-nav" aria-label="Profile photos">
              <button type="button" className="profile-hero__nav" onClick={() => shift(-1)} aria-label="Previous photo">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="profile-hero__nav" onClick={() => shift(1)} aria-label="Next photo">
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>

        {!coverOnly && (
          <div className="profile-hero__meta">
            <h1 className="profile-hero__name">{user.name || "Your profile"}</h1>
            {profile.age ? <p className="profile-hero__age">{profile.age}</p> : null}
            <p className="profile-hero__location">{formatLocation(profile)}</p>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="profile-hero__thumbs">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
