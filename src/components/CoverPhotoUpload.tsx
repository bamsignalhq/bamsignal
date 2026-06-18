import { Camera, Loader2, X } from "lucide-react";
import { CoverPhotoCropModal } from "./CoverPhotoCropModal";
import { useCoverPhotoFlow } from "../hooks/useCoverPhotoFlow";
import type { PhotoReviewMeta } from "../types";

type CoverPhotoUploadProps = {
  coverPhoto?: string;
  coverPhotoExplicit?: boolean;
  photoMeta?: Record<string, PhotoReviewMeta>;
  profilePhotos: string[];
  onChange: (coverPhoto: string | undefined, photoMeta?: Record<string, PhotoReviewMeta>) => void;
  onModerationMessage?: (message: string) => void;
};

export function CoverPhotoUpload({
  coverPhoto,
  coverPhotoExplicit,
  photoMeta,
  profilePhotos,
  onChange,
  onModerationMessage
}: CoverPhotoUploadProps) {
  const flow = useCoverPhotoFlow({
    coverPhoto,
    coverPhotoExplicit,
    photoMeta,
    profilePhotos,
    onChange,
    onModerationMessage
  });

  const preview = flow.displayCover;

  return (
    <>
      <div className="cover-photo-upload">
        <div className="cover-photo-upload__frame">
          {preview ? (
            <img src={preview} alt="" className="cover-photo-upload__preview" />
          ) : (
            <div className="cover-photo-upload__empty" aria-hidden />
          )}
          <div className="cover-photo-upload__actions">
            <button
              type="button"
              className="cover-photo-upload__btn"
              onClick={flow.openPicker}
              disabled={flow.uploading}
              aria-busy={flow.uploading}
            >
              {flow.uploading ? (
                <Loader2 size={16} className="photo-upload-grid__spinner" aria-hidden />
              ) : (
                <Camera size={16} aria-hidden />
              )}
              {flow.uploading ? "Uploading…" : flow.hasCustomCover ? "Change backdrop" : "Add backdrop"}
            </button>
            {flow.hasCustomCover && (
              <button
                type="button"
                className="cover-photo-upload__btn cover-photo-upload__btn--ghost"
                onClick={flow.removeCover}
                disabled={flow.uploading}
              >
                <X size={16} aria-hidden />
                Remove
              </button>
            )}
          </div>
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
