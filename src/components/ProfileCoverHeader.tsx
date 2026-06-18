import { ImagePlus, Loader2, MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { useCoverPhotoFlow } from "../hooks/useCoverPhotoFlow";
import { ShowcaseImage } from "./ShowcaseImage";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { CoverPhotoCropModal } from "./CoverPhotoCropModal";
import { ProfilePhotoViewerSheet } from "./profile/ProfilePhotoViewerSheet";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { hasExplicitCover, resolveCoverPhoto, safePhotos } from "../utils/safeProfile";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  variant?: "default" | "premium";
  editableCover?: boolean;
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  onCoverChange?: (coverPhoto: string | undefined, photoMeta?: Record<string, PhotoReviewMeta>) => void;
  onCoverModerationMessage?: (message: string) => void;
  editablePhotos?: boolean;
  onPhotosChange?: (photos: string[], photoMeta?: Record<string, PhotoReviewMeta>) => void;
  onPhotoModerationMessage?: (message: string) => void;
};

function formatLocation(profile: DatingProfile): string {
  if (!profile.city) return "Add your city";
  const state = profile.state === "FCT" ? "Abuja" : profile.state;
  return state ? `${profile.city} · ${state}` : profile.city;
}

function formatPremiumLocation(profile: DatingProfile): string | null {
  const city = profile.city?.trim();
  if (!city) return null;
  const state = profile.state ? (profile.state === "FCT" ? "Abuja" : profile.state) : null;
  return state ? `${city} • ${state}` : city;
}

export function ProfileCoverHeader({
  user,
  profile,
  verification,
  variant = "default",
  editableCover = false,
  coverPhoto,
  photoMeta,
  onCoverChange,
  onCoverModerationMessage,
  editablePhotos = false,
  onPhotosChange,
  onPhotoModerationMessage
}: ProfileCoverHeaderProps) {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const photos = safePhotos(profile.photos);
  const avatar = photos[0] ?? null;
  const resolvedCoverPhoto = coverPhoto ?? profile.coverPhoto;
  const coverProfile = { ...profile, coverPhoto: resolvedCoverPhoto };
  const customCover = hasExplicitCover(coverProfile);
  const stockCover = resolveCoverPhoto(profile);

  const flow = useCoverPhotoFlow({
    coverPhoto: resolvedCoverPhoto,
    coverPhotoExplicit: profile.coverPhotoExplicit,
    photoMeta,
    profilePhotos: photos,
    onChange: onCoverChange ?? (() => undefined),
    onModerationMessage: onCoverModerationMessage
  });

  const coverPreview = editableCover ? flow.displayCover || "" : flow.displayCover || stockCover;
  const showCoverMedia = editableCover ? Boolean(flow.displayCover) : Boolean(coverPreview);

  const premium = variant === "premium";
  const ageText = profile.age != null && profile.age > 0 ? String(profile.age) : null;
  const locationText = profile.city?.trim()
    ? premium
      ? formatPremiumLocation(profile)
      : formatLocation(profile)
    : null;
  const stripPhotos = premium ? photos.slice(0, 2) : photos;

  const openPhotoViewer = (index: number) => {
    if (!editablePhotos || !onPhotosChange) return;
    setPhotoViewerIndex(index);
    setPhotoViewerOpen(true);
  };

  return (
    <>
      <header className={`profile-hero profile-hero--me${premium ? " profile-hero--premium" : ""}`}>
        <div className="profile-hero__cover" aria-hidden={editableCover ? !showCoverMedia : !avatar && !customCover}>
          {showCoverMedia ? (
            <ShowcaseImage
              src={coverPreview}
              alt=""
              fallbackSrc={editableCover ? undefined : DEFAULT_PROFILE_COVER}
              className={`profile-hero__cover-media${
                editableCover || customCover || flow.localPreview ? "" : " profile-hero__cover-media--default"
              }`}
            />
          ) : null}
          {!editableCover ? <div className="profile-hero__cover-shade" /> : null}
          {editableCover && onCoverChange ? (
            <button
              type="button"
              className="profile-hero__cover-edit"
              onClick={flow.openPicker}
              disabled={flow.uploading}
              aria-busy={flow.uploading}
              aria-label={flow.hasCustomCover ? "Change backdrop photo" : "Add backdrop photo"}
              title={flow.hasCustomCover ? "Change backdrop photo" : "Add backdrop photo"}
            >
              {flow.uploading ? (
                <Loader2 size={13} className="photo-upload-grid__spinner" aria-hidden />
              ) : (
                <ImagePlus size={13} aria-hidden />
              )}
              <span className="profile-hero__cover-edit-label">
                {flow.hasCustomCover ? "Change" : "Add backdrop"}
              </span>
            </button>
          ) : null}
        </div>

        <div className="profile-hero__body">
          <div className="profile-hero__avatar-block">
            <button
              type="button"
              className={`profile-hero__avatar-ring${editablePhotos && onPhotosChange ? " profile-hero__avatar-ring--tappable" : ""}`}
              onClick={() => openPhotoViewer(0)}
              disabled={!editablePhotos || !onPhotosChange}
              aria-label={avatar ? "View your profile photos" : "Add profile photo"}
            >
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
            </button>
          </div>

          <div className="profile-hero__meta">
            <h1 className="profile-hero__name">
              <span>{user.name || "Your profile"}</span>
              {premium && (verification.tier > 0 || profile.verified) ? (
                <span className="profile-hero__name-badge">
                  {verification.tier > 0 ? (
                    <VerificationBadge info={verification} />
                  ) : (
                    <VerifiedBadge size="sm" />
                  )}
                </span>
              ) : null}
            </h1>
            {(ageText || locationText) && (
              <p className="profile-hero__meta-line">
                {ageText ? <span className="profile-hero__age">{ageText}</span> : null}
                {ageText && locationText ? <span className="profile-hero__meta-dot" aria-hidden>•</span> : null}
                {locationText ? (
                  <span className="profile-hero__location">
                    {premium ? <span aria-hidden>📍</span> : <MapPin size={13} aria-hidden />}
                    {locationText}
                  </span>
                ) : null}
              </p>
            )}
            {!premium && (verification.tier > 0 || profile.verified) ? (
              <div className="profile-hero__badges">
                {verification.tier > 0 ? <VerificationBadge info={verification} /> : null}
                {profile.verified && !verification.tier ? <VerifiedBadge /> : null}
              </div>
            ) : null}
          </div>
        </div>

        {stripPhotos.length > 0 ? (
          <div className="profile-hero__photo-strip" aria-label="Profile photos">
            {stripPhotos.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={`profile-hero__photo-thumb-wrap${index === 0 ? " profile-hero__photo-thumb-wrap--main" : ""}${editablePhotos && onPhotosChange ? " profile-hero__photo-thumb-wrap--tappable" : ""}`}
                onClick={() => openPhotoViewer(index)}
                disabled={!editablePhotos || !onPhotosChange}
                aria-label={index === 0 ? "View main profile photo" : `View profile photo ${index + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        ) : null}

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

      {editablePhotos && onPhotosChange ? (
        <ProfilePhotoViewerSheet
          open={photoViewerOpen}
          initialIndex={photoViewerIndex}
          memberName={user.name}
          photos={photos}
          photoMeta={photoMeta}
          coverPhoto={coverPhoto ?? profile.coverPhoto}
          onClose={() => setPhotoViewerOpen(false)}
          onChange={onPhotosChange}
          onModerationMessage={onPhotoModerationMessage ?? onCoverModerationMessage}
        />
      ) : null}
    </>
  );
}
