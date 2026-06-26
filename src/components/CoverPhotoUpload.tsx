import { Camera, Loader2, X } from "lucide-react";
import { CoverPhotoCropModal } from "./CoverPhotoCropModal";
import { ProfileCoverImage } from "./profile/ProfileCoverImage";
import { useCoverPhotoFlow } from "../hooks/useCoverPhotoFlow";
import type { PhotoReviewMeta } from "../types";

type CoverPhotoUploadProps = {
  coverPhoto?: string;
  coverPhotoUrl?: string;
  coverPhotoExplicit?: boolean;
  coverPhotoUpdatedAt?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  profilePhotos: string[];
  onChange: (
    coverPhoto: string | undefined,
    photoMeta?: Record<string, PhotoReviewMeta>,
    coverPhotoPath?: string
  ) => void;
  onModerationMessage?: (message: string) => void;
};

export function CoverPhotoUpload({
  coverPhoto,
  coverPhotoUrl,
  coverPhotoExplicit,
  coverPhotoUpdatedAt,
  photoMeta,
  profilePhotos,
  onChange,
  onModerationMessage
}: CoverPhotoUploadProps) {
  const flow = useCoverPhotoFlow({
    coverPhoto: coverPhotoUrl ?? coverPhoto,
    coverPhotoExplicit,
    coverPhotoUpdatedAt,
    photoMeta,
    profilePhotos,
    onChange,
    onModerationMessage
  });

  return (
    <>
      <div className="cover-photo-upload">
        <div className="cover-photo-upload__frame">
          <ProfileCoverImage
            src={flow.displayCover}
            className="cover-photo-upload__preview"
            priority
          />
          <button
            type="button"
            className="cover-photo-upload__btn cover-photo-upload__btn--pill"
            onClick={flow.openPicker}
            disabled={flow.uploading}
            aria-busy={flow.uploading}
          >
            {flow.uploading ? (
              <Loader2 size={14} className="photo-upload-grid__spinner" aria-hidden />
            ) : (
              <Camera size={14} aria-hidden />
            )}
            {flow.uploading ? "Uploading…" : "Change Cover"}
          </button>
          {flow.hasCustomCover ? (
            <div className="cover-photo-upload__actions">
              <button
                type="button"
                className="cover-photo-upload__btn cover-photo-upload__btn--ghost"
                onClick={flow.removeCover}
                disabled={flow.uploading}
              >
                <X size={16} aria-hidden />
                Remove
              </button>
            </div>
          ) : null}
        </div>
        <input
          ref={flow.fileRef}
          type="file"
          accept={flow.fileAccept}
          className="photo-upload-grid__input"
          onChange={flow.handleFileChange}
          aria-hidden
          tabIndex={-1}
        />
      </div>
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
