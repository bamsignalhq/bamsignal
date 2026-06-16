import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { DEFAULT_PROFILE_COVER, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  mapUploadError,
  uploadCompressedCoverBlob
} from "../services/profilePhotos";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { blobToDataUrl, PHOTO_FILE_ACCEPT, validatePhotoFile } from "../utils/photoUpload";
import { logPhotoUpload } from "../utils/photoUploadLog";
import { isStoragePhotoUrl, samePhotoRef } from "../utils/photoRefs";

type CoverPhotoUploadProps = {
  coverPhoto?: string;
  profilePhotos: string[];
  onChange: (coverPhoto: string | undefined) => void;
  onModerationMessage?: (message: string) => void;
};

export function CoverPhotoUpload({
  coverPhoto,
  profilePhotos,
  onChange,
  onModerationMessage
}: CoverPhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    if (uploading) return;
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const previousCover = coverPhoto;
    let previewUrl: string | null = null;

    try {
      logPhotoUpload("pick_cover", {
        fileType: file.type,
        fileName: file.name,
        originalSize: file.size
      });

      const validation = await validatePhotoFile(file);
      if (!validation.ok) {
        logPhotoUpload("upload_rejected", { code: validation.code, internalReason: validation.internalReason });
        onModerationMessage?.(PHOTO_UPLOAD_FAIL);
        return;
      }

      const verdict = await moderatePhotoUpload(file, "cover");
      if (!verdict.allowed) {
        logPhotoUpload("upload_rejected", {
          code: verdict.code || "MODERATION_REJECTED",
          internalReason: verdict.internalReason || "moderation"
        });
        onModerationMessage?.(PHOTO_UPLOAD_FAIL);
        return;
      }

      const compressed = await compressPhotoForPreview(file);
      const tempDataUrl = await blobToDataUrl(compressed.blob);
      if (profilePhotos.some((photo) => samePhotoRef(photo, tempDataUrl))) {
        onModerationMessage?.("Please choose a different image for your cover.");
        return;
      }

      previewUrl = URL.createObjectURL(compressed.blob);
      onChange(previewUrl);

      const remoteUrl = await uploadCompressedCoverBlob(compressed.blob, file);
      onChange(remoteUrl);
      if (previousCover && isStoragePhotoUrl(previousCover)) {
        void deleteStoredPhoto(previousCover);
      }
      logPhotoUpload("upload_cover_ok", {});
    } catch (error) {
      onChange(previousCover);
      const mapped = mapUploadError(error);
      logPhotoUpload("upload_cover_failed", { code: mapped.code });
      onModerationMessage?.(mapped.message || PHOTO_UPLOAD_FAIL);
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setUploading(false);
    }
  };

  const removeCover = () => {
    const previousCover = coverPhoto;
    onChange(undefined);
    if (previousCover && isStoragePhotoUrl(previousCover)) {
      void deleteStoredPhoto(previousCover);
    }
  };

  const preview = coverPhoto || DEFAULT_PROFILE_COVER;
  const hasCustomCover = Boolean(coverPhoto);

  return (
    <div className="cover-photo-upload">
      <p className="cover-photo-upload__hint">
        One wide lifestyle photo for your profile backdrop. No contact details or text overlays.
      </p>
      <div className="cover-photo-upload__frame">
        <img src={preview} alt="" className="cover-photo-upload__preview" />
        <div className="cover-photo-upload__actions">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={openPicker}
            disabled={uploading}
            aria-busy={uploading}
          >
            {uploading ? <Loader2 size={16} className="photo-upload-grid__spinner" aria-hidden /> : <Camera size={16} aria-hidden />}
            {uploading ? "Uploading…" : hasCustomCover ? "Change cover" : "Add cover photo"}
          </button>
          {hasCustomCover && (
            <button type="button" className="btn-secondary btn-sm" onClick={removeCover} disabled={uploading}>
              <X size={16} aria-hidden />
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={PHOTO_FILE_ACCEPT}
        className="photo-upload-grid__input"
        onChange={uploadCover}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
