import { Camera, Loader2, Pencil, UserRound } from "lucide-react";
import { memo, useState } from "react";
import { useCoverPhotoFlow } from "../../../hooks/useCoverPhotoFlow";
import { profileIntentLabel } from "../../../constants/intents";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../../../types";
import { relationshipIntentsFrom } from "../../../constants/relationshipIntent";
import { hasExplicitCoverPhoto, readCoverPhotoUrl } from "../../../utils/coverPhoto";
import { safePhotos } from "../../../utils/safeProfile";
import { resolveProfileMainPhoto } from "../../../utils/mainPhoto";
import { isTrustedMember } from "../../../utils/trustedMember";
import type { VerificationInfo } from "../../../utils/verification";
import { VerificationBadge } from "../../VerificationBadge";
import { TrustedMemberShieldIcon } from "../../trusted/TrustedMemberBadge";
import { ShowcaseImage } from "../../ShowcaseImage";
import { ProfileCoverImage } from "../ProfileCoverImage";
import { CoverPhotoCropModal } from "../../CoverPhotoCropModal";
import { ProfilePhotoViewerSheet } from "../ProfilePhotoViewerSheet";
import { normalizeOccupations } from "../../../constants/profileOptions";
import { isPreferNot } from "../../../utils/preferNot";

type ProfileFintechHeroProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  onEdit: () => void;
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  onCoverChange?: (
    coverPhoto: string | undefined,
    photoMeta?: Record<string, PhotoReviewMeta>,
    coverPhotoPath?: string
  ) => void;
  onCoverModerationMessage?: (message: string) => void;
  onPhotosChange?: (
    photos: string[],
    photoMeta?: Record<string, PhotoReviewMeta>,
    mainPhotoUrl?: string
  ) => void;
  onPhotoModerationMessage?: (message: string) => void;
};

function formatLocation(profile: DatingProfile): string | null {
  const city = profile.city?.trim();
  if (!city) return null;
  const state = profile.state ? (profile.state === "FCT" ? "Abuja" : profile.state) : null;
  return state ? `${city} • ${state}` : city;
}

export const ProfileFintechHero = memo(function ProfileFintechHero({
  user,
  profile,
  verification,
  onEdit,
  coverPhoto,
  photoMeta,
  onCoverChange,
  onCoverModerationMessage,
  onPhotosChange,
  onPhotoModerationMessage
}: ProfileFintechHeroProps) {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const photos = safePhotos(profile.photos);
  const avatar = resolveProfileMainPhoto(profile) || null;
  const resolvedCoverPhoto = readCoverPhotoUrl({ ...profile, coverPhoto: coverPhoto ?? profile.coverPhoto });
  const coverProfile = { ...profile, coverPhoto: resolvedCoverPhoto, coverPhotoUrl: resolvedCoverPhoto };
  const customCover = hasExplicitCoverPhoto(coverProfile);
  const trusted = isTrustedMember(profile);
  const locationText = formatLocation(profile);
  const ageText = profile.age != null && profile.age > 0 ? String(profile.age) : null;
  const intents = relationshipIntentsFrom(profile.intents);
  const relationshipGoal = intents[0] ? profileIntentLabel(intents[0]) : null;
  const religion =
    profile.religion && !isPreferNot(profile.religion) ? profile.religion : null;
  const occupation =
    normalizeOccupations(profile.occupations, profile.occupation).find((value) => !isPreferNot(value)) ??
    null;

  const flow = useCoverPhotoFlow({
    coverPhoto: resolvedCoverPhoto,
    coverPhotoExplicit: profile.coverPhotoExplicit,
    coverPhotoUpdatedAt: profile.coverPhotoUpdatedAt,
    photoMeta,
    profilePhotos: photos,
    onChange: onCoverChange ?? (() => undefined),
    onModerationMessage: onCoverModerationMessage
  });

  const persistedDisplay = flow.displayCover;
  const coverPreview = flow.localPreview || flow.pendingCover || persistedDisplay;

  const openPhotoViewer = (index: number) => {
    if (!onPhotosChange) return;
    setPhotoViewerIndex(index);
    setPhotoViewerOpen(true);
  };

  return (
    <>
      <header className="profile-fintech-hero">
        <div className="profile-fintech-hero__toolbar">
          <button type="button" className="profile-fintech-hero__edit" onClick={onEdit}>
            <Pencil size={14} aria-hidden />
            Edit
          </button>
        </div>

        <div className="profile-fintech-hero__cover">
          <ProfileCoverImage
            src={coverPreview}
            className="profile-fintech-hero__cover-media"
            priority
          />
          {customCover ? <div className="profile-fintech-hero__cover-shade" /> : null}
          {onCoverChange ? (
            <button
              type="button"
              className="profile-fintech-hero__cover-change"
              onClick={flow.openPicker}
              disabled={flow.uploading}
              aria-busy={flow.uploading}
              aria-label="Change cover photo"
            >
              {flow.uploading ? (
                <Loader2 size={14} className="photo-upload-grid__spinner" aria-hidden />
              ) : (
                <Camera size={14} aria-hidden />
              )}
              <span>Change Cover</span>
            </button>
          ) : null}
        </div>

        <div className="profile-fintech-hero__body">
          <button
            type="button"
            className={`profile-fintech-hero__avatar${onPhotosChange ? " profile-fintech-hero__avatar--tappable" : ""}`}
            onClick={() => openPhotoViewer(0)}
            disabled={!onPhotosChange}
            aria-label={avatar ? "View profile photos" : "Add profile photo"}
          >
            {avatar ? (
              <ShowcaseImage
                src={avatar}
                alt={user.name || "Profile photo"}
                className="profile-fintech-hero__avatar-img"
              />
            ) : (
              <span className="profile-fintech-hero__avatar-empty">
                <UserRound size={32} aria-hidden />
              </span>
            )}
          </button>

          <div className="profile-fintech-hero__identity">
            {(verification.tier || trusted) && (
              <div className="profile-fintech-hero__badges">
                <VerificationBadge info={verification} />
                {trusted ? <TrustedMemberShieldIcon className="profile-fintech-hero__trusted-icon" /> : null}
              </div>
            )}

            <h1 className="profile-fintech-hero__name">
              {user.name || "Your profile"}
              {ageText ? `, ${ageText}` : ""}
            </h1>

            {relationshipGoal ? (
              <p className="profile-fintech-hero__caption">{relationshipGoal}</p>
            ) : null}
            {locationText ? <p className="profile-fintech-hero__caption">{locationText}</p> : null}
            {religion ? <p className="profile-fintech-hero__caption">{religion}</p> : null}
            {occupation ? <p className="profile-fintech-hero__caption">{occupation}</p> : null}
          </div>
        </div>

        {onCoverChange ? (
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

      {onPhotosChange ? (
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
});
