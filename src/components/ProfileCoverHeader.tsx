import { ImagePlus, Loader2, MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import { useCoverPhotoFlow } from "../hooks/useCoverPhotoFlow";
import { ShowcaseImage } from "./ShowcaseImage";
import { CoverPhotoCropModal } from "./CoverPhotoCropModal";
import { ProfilePhotoViewerSheet } from "./profile/ProfilePhotoViewerSheet";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../types";
import type { VerificationInfo } from "../utils/verification";
import { coverPhotoDisplayUrl, hasExplicitCoverPhoto, readCoverPhotoUrl } from "../utils/coverPhoto";
import { safePhotos } from "../utils/safeProfile";
import { resolveProfileMainPhoto, isMainPhoto } from "../utils/mainPhoto";
import { VoiceVibeHero } from "./voice/VoiceVibeHero";
import { getVoiceVibeUrl } from "../utils/voiceVibe";
import { TrustedMemberBadge } from "./trusted/TrustedMemberBadge";
import { isTrustedMember } from "../utils/trustedMember";
import { RelationshipIntentChips } from "./relationshipIntent/RelationshipIntentChips";
import { MoreAboutMeChips } from "./moreAboutMe/MoreAboutMeChips";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";

type ProfileCoverHeaderProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  variant?: "default" | "premium";
  editableCover?: boolean;
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  onCoverChange?: (
    coverPhoto: string | undefined,
    photoMeta?: Record<string, PhotoReviewMeta>,
    coverPhotoPath?: string
  ) => void;
  onCoverModerationMessage?: (message: string) => void;
  editablePhotos?: boolean;
  onPhotosChange?: (
    photos: string[],
    photoMeta?: Record<string, PhotoReviewMeta>,
    mainPhotoUrl?: string
  ) => void;
  onPhotoModerationMessage?: (message: string) => void;
  voiceVibeUrl?: string;
  voiceVibeDuration?: number;
  onAddVoiceVibe?: () => void;
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

function formatHeroDetailStrip(profile: DatingProfile): string | null {
  const parts = [profile.religion, profile.occupation].filter(
    (value) => value && value !== "Prefer not to say"
  );
  return parts.length ? parts.join(" • ") : null;
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
  onPhotoModerationMessage,
  voiceVibeUrl,
  voiceVibeDuration,
  onAddVoiceVibe
}: ProfileCoverHeaderProps) {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const photos = safePhotos(profile.photos);
  const avatar = resolveProfileMainPhoto(profile) || null;
  const resolvedCoverPhoto = readCoverPhotoUrl({ ...profile, coverPhoto: coverPhoto ?? profile.coverPhoto });
  const coverProfile = { ...profile, coverPhoto: resolvedCoverPhoto, coverPhotoUrl: resolvedCoverPhoto };
  const customCover = hasExplicitCoverPhoto(coverProfile);

  const flow = useCoverPhotoFlow({
    coverPhoto: resolvedCoverPhoto,
    coverPhotoExplicit: profile.coverPhotoExplicit,
    coverPhotoUpdatedAt: profile.coverPhotoUpdatedAt,
    photoMeta,
    profilePhotos: photos,
    onChange: onCoverChange ?? (() => undefined),
    onModerationMessage: onCoverModerationMessage
  });

  const persistedDisplay = coverPhotoDisplayUrl({
    coverPhotoUrl: resolvedCoverPhoto,
    coverPhotoUpdatedAt: profile.coverPhotoUpdatedAt,
    coverPhotoExplicit: profile.coverPhotoExplicit
  });
  const coverPreview = flow.localPreview || flow.pendingCover || persistedDisplay || flow.displayCover || "";
  const showCoverMedia = Boolean(coverPreview);

  const premium = variant === "premium";
  const ageText = profile.age != null && profile.age > 0 ? String(profile.age) : null;
  const locationText = profile.city?.trim()
    ? premium
      ? formatPremiumLocation(profile)
      : formatLocation(profile)
    : null;
  const stripPhotos = premium ? photos.slice(0, 2) : photos;
  const vibeProfile = {
    voiceIntroUrl: voiceVibeUrl ?? profile.voiceIntroUrl,
    voiceVibeUrl: voiceVibeUrl ?? profile.voiceVibeUrl,
    voiceIntroDuration: voiceVibeDuration ?? profile.voiceIntroDuration,
    voiceVibeDuration: voiceVibeDuration ?? profile.voiceVibeDuration
  };
  const showVoiceVibe = premium && (getVoiceVibeUrl(vibeProfile) || onAddVoiceVibe);
  const trusted = isTrustedMember(profile);
  const detailStrip = premium ? formatHeroDetailStrip(profile) : null;
  const relationshipIntents = relationshipIntentsFrom(profile.intents);

  const openPhotoViewer = (index: number) => {
    if (!editablePhotos || !onPhotosChange) return;
    setPhotoViewerIndex(index);
    setPhotoViewerOpen(true);
  };

  return (
    <>
      <header className={`profile-hero profile-hero--me${premium ? " profile-hero--premium" : ""}`}>
        <div className="profile-hero__cover" aria-hidden={!showCoverMedia && !avatar}>
          {showCoverMedia ? (
            <ShowcaseImage
              src={coverPreview}
              alt=""
              className="profile-hero__cover-media"
            />
          ) : (
            <div className="profile-hero__cover-empty" aria-hidden />
          )}
          {!editableCover && customCover ? <div className="profile-hero__cover-shade" /> : null}
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
              <span>
                {user.name || "Your profile"}
                {premium && ageText ? `, ${ageText}` : ""}
              </span>
            </h1>
            {relationshipIntents.length ? (
              <RelationshipIntentChips intents={profile.intents} variant="hero" className="profile-hero__relationship-intent" />
            ) : null}
            <MoreAboutMeChips items={profile.interests} variant="hero" className="profile-hero__more-about-me" />
            {trusted ? (
              <div className="profile-hero__trusted-member">
                <TrustedMemberBadge size={premium ? "md" : "sm"} />
              </div>
            ) : null}
            {showVoiceVibe ? (
              <VoiceVibeHero
                profile={vibeProfile}
                editable={Boolean(onAddVoiceVibe)}
                onAdd={onAddVoiceVibe}
              />
            ) : null}
            {detailStrip ? <p className="profile-hero__detail-strip">{detailStrip}</p> : null}
            {(ageText || locationText) && !premium ? (
              <p className="profile-hero__meta-line">
                {ageText ? <span className="profile-hero__age">{ageText}</span> : null}
                {ageText && locationText ? <span className="profile-hero__meta-dot" aria-hidden>•</span> : null}
                {locationText ? (
                  <span className="profile-hero__location">
                    <MapPin size={13} aria-hidden />
                    {locationText}
                  </span>
                ) : null}
              </p>
            ) : null}
            {premium && locationText ? (
              <p className="profile-hero__meta-line profile-hero__meta-line--location">
                <span className="profile-hero__location">
                  <span aria-hidden>📍</span>
                  {locationText}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        {stripPhotos.length > 0 ? (
          <div className="profile-hero__photo-strip" aria-label="Profile photos">
            {stripPhotos.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={`profile-hero__photo-thumb-wrap${isMainPhoto(src, profile) ? " profile-hero__photo-thumb-wrap--main" : ""}${editablePhotos && onPhotosChange ? " profile-hero__photo-thumb-wrap--tappable" : ""}`}
                onClick={() => openPhotoViewer(index)}
                disabled={!editablePhotos || !onPhotosChange}
                aria-label={isMainPhoto(src, profile) ? "View main profile photo" : `View profile photo ${index + 1}`}
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
          mainPhotoUrl={profile.mainPhotoUrl}
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
