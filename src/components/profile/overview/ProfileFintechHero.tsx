import { ImagePlus, Loader2, Pencil, UserRound } from "lucide-react";
import { useState } from "react";
import { useCoverPhotoFlow } from "../../../hooks/useCoverPhotoFlow";
import { profileIntentLabel } from "../../../constants/intents";
import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../../../types";
import { relationshipIntentsFrom } from "../../../constants/relationshipIntent";
import { coverPhotoDisplayUrl, hasExplicitCoverPhoto, readCoverPhotoUrl } from "../../../utils/coverPhoto";
import { safePhotos } from "../../../utils/safeProfile";
import { resolveProfileMainPhoto } from "../../../utils/mainPhoto";
import { isTrustedMember } from "../../../utils/trustedMember";
import type { VerificationInfo } from "../../../utils/verification";
import { VerificationBadge } from "../../VerificationBadge";
import { TrustedMemberBadge } from "../../trusted/TrustedMemberBadge";
import { ShowcaseImage } from "../../ShowcaseImage";
import { CoverPhotoCropModal } from "../../CoverPhotoCropModal";
import { ProfilePhotoViewerSheet } from "../ProfilePhotoViewerSheet";
import { ProfileCompletionRing } from "./ProfileCompletionRing";
import { normalizeOccupations } from "../../../constants/profileOptions";
import { isPreferNot } from "../../../utils/preferNot";

type ProfileFintechHeroProps = {
  user: UserProfile;
  profile: DatingProfile;
  verification: VerificationInfo;
  profileScore: number;
  onEdit: () => void;
  onOpenCompletion: () => void;
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

function formatMetaLine(profile: DatingProfile): string | null {
  const parts: string[] = [];
  const intents = relationshipIntentsFrom(profile.intents);
  if (intents.length) parts.push(profileIntentLabel(intents[0]));
  if (profile.religion && !isPreferNot(profile.religion)) parts.push(profile.religion);
  const occupation = normalizeOccupations(profile.occupations, profile.occupation).find(
    (value) => !isPreferNot(value)
  );
  if (occupation) parts.push(occupation);
  return parts.length ? parts.join(" • ") : null;
}

export function ProfileFintechHero({
  user,
  profile,
  verification,
  profileScore,
  onEdit,
  onOpenCompletion,
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
  const metaLine = formatMetaLine(profile);
  const ageText = profile.age != null && profile.age > 0 ? String(profile.age) : null;

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

  const openPhotoViewer = (index: number) => {
    if (!onPhotosChange) return;
    setPhotoViewerIndex(index);
    setPhotoViewerOpen(true);
  };

  return (
    <>
      <header className="profile-fintech-hero">
        <div className="profile-fintech-hero__toolbar">
          <ProfileCompletionRing score={profileScore} size="sm" onClick={onOpenCompletion} />
          <button type="button" className="profile-fintech-hero__edit" onClick={onEdit}>
            <Pencil size={15} aria-hidden />
            Edit
          </button>
        </div>

        <div className="profile-fintech-hero__cover" aria-hidden={!showCoverMedia && !avatar}>
          {showCoverMedia ? (
            <ShowcaseImage src={coverPreview} alt="" className="profile-fintech-hero__cover-media" />
          ) : (
            <div className="profile-fintech-hero__cover-empty" aria-hidden />
          )}
          {!customCover ? null : <div className="profile-fintech-hero__cover-shade" />}
          {onCoverChange ? (
            <button
              type="button"
              className="profile-fintech-hero__cover-edit"
              onClick={flow.openPicker}
              disabled={flow.uploading}
              aria-busy={flow.uploading}
              aria-label={flow.hasCustomCover ? "Change cover photo" : "Add cover photo"}
            >
              {flow.uploading ? <Loader2 size={13} className="photo-upload-grid__spinner" aria-hidden /> : <ImagePlus size={13} aria-hidden />}
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
              <ShowcaseImage src={avatar} alt={user.name || "Profile photo"} className="profile-fintech-hero__avatar-img" />
            ) : (
              <span className="profile-fintech-hero__avatar-empty">
                <UserRound size={34} aria-hidden />
              </span>
            )}
          </button>

          <div className="profile-fintech-hero__identity">
            <div className="profile-fintech-hero__badges">
              <VerificationBadge info={verification} />
              {trusted ? (
                <span className="profile-fintech-hero__trusted-done">
                  <TrustedMemberBadge size="sm" />
                </span>
              ) : null}
            </div>

            <h1 className="profile-fintech-hero__name">
              {user.name || "Your profile"}
              {ageText ? `, ${ageText}` : ""}
            </h1>

            {locationText ? <p className="profile-fintech-hero__location">{locationText}</p> : null}
            {metaLine ? <p className="profile-fintech-hero__meta">{metaLine}</p> : null}
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
}
