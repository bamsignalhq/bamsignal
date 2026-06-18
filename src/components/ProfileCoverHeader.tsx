import { ImagePlus, Loader2, MapPin, UserRound } from "lucide-react";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { useCoverPhotoFlow } from "../hooks/useCoverPhotoFlow";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { CoverPhotoCropModal } from "./CoverPhotoCropModal";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { hasExplicitCover, resolveCoverPhoto, safePhotos } from "../utils/safeProfile";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  editableCover?: boolean;
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  onCoverChange?: (coverPhoto: string | undefined, photoMeta?: Record<string, PhotoReviewMeta>) => void;
  onCoverModerationMessage?: (message: string) => void;
};

function formatLocation(profile: DatingProfile): string {
  if (!profile.city) return "Add your city";
  const state = profile.state === "FCT" ? "Abuja" : profile.state;
  return state ? `${profile.city} · ${state}` : profile.city;
}

export function ProfileCoverHeader({
  user,
  profile,
  verification,
  editableCover = false,
  coverPhoto,
  photoMeta,
  onCoverChange,
  onCoverModerationMessage
}: ProfileCoverHeaderProps) {
  const photos = safePhotos(profile.photos);
  const avatar = photos[0] ?? null;
  const cover = resolveCoverPhoto(profile);
  const customCover = hasExplicitCover(profile);

  const flow = useCoverPhotoFlow({
    coverPhoto: coverPhoto ?? profile.coverPhoto,
    photoMeta,
    profilePhotos: photos,
    onChange: onCoverChange ?? (() => undefined),
    onModerationMessage: onCoverModerationMessage
  });

  const coverPreview = flow.localPreview || cover;

  return (
    <>
      <header className="profile-hero profile-hero--me">
        <div className="profile-hero__cover" aria-hidden={!avatar && !customCover}>
          <ShowcaseImage
            src={coverPreview}
            alt=""
            fallbackSrc={DEFAULT_PROFILE_COVER}
            className={`profile-hero__cover-media${customCover || flow.localPreview ? "" : " profile-hero__cover-media--default"}`}
          />
          <div className="profile-hero__cover-shade" />
          {editableCover && onCoverChange ? (
            <button
              type="button"
              className="profile-hero__cover-edit"
              onClick={flow.openPicker}
              disabled={flow.uploading}
              aria-busy={flow.uploading}
            >
              {flow.uploading ? (
                <Loader2 size={15} className="photo-upload-grid__spinner" aria-hidden />
              ) : (
                <ImagePlus size={15} aria-hidden />
              )}
              {flow.hasCustomCover ? "Change backdrop" : "Add backdrop"}
            </button>
          ) : null}
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
          </div>

          <div className="profile-hero__meta">
            <h1 className="profile-hero__name">{user.name || "Your profile"}</h1>
            <p className="profile-hero__meta-line">
              {profile.age ? <span className="profile-hero__age">{profile.age}</span> : null}
              {profile.age && profile.city ? <span className="profile-hero__meta-dot" aria-hidden>·</span> : null}
              <span className="profile-hero__location">
                <MapPin size={13} aria-hidden />
                {formatLocation(profile)}
              </span>
            </p>
            {(verification.tier > 0 || profile.verified) && (
              <div className="profile-hero__badges">
                {verification.tier > 0 ? <VerificationBadge info={verification} /> : null}
                {profile.verified && !verification.tier ? <VerifiedBadge /> : null}
              </div>
            )}
          </div>
        </div>

        {editableCover && onCoverChange ? (
          <input
            ref={flow.fileRef}
            type="file"
            accept={flow.fileAccept}
            className="photo-upload-grid__input"
            onChange={flow.handleFileChange}
            aria-hidden
            tabIndex={-1}
          />
        ) : null}
      </header>

      {flow.cropSrc ? (
        <CoverPhotoCropModal
          imageSrc={flow.cropSrc}
          onClose={flow.cancelCrop}
          onConfirm={(blob) => void flow.confirmCrop(blob)}
        />
      ) : null}
    </>
  );
}
