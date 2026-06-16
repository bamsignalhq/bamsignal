import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { DEFAULT_PROFILE_COVER, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  PhotoUploadError,
  uploadCompressedCoverBlob
} from "../services/profilePhotos";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { blobToDataUrl } from "../utils/photoUpload";
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

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const previousCover = coverPhoto;
    let previewUrl: string | null = null;

    try {
      const verdict = await moderatePhotoUpload(file, "cover");
      if (!verdict.allowed) {
        onModerationMessage?.(verdict.message || PHOTO_UPLOAD_FAIL);
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
    } catch (error) {
      onChange(previousCover);
      if (error instanceof PhotoUploadError) {
        onModerationMessage?.(error.message || PHOTO_UPLOAD_FAIL);
      } else {
        onModerationMessage?.(PHOTO_UPLOAD_FAIL);
      }
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
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
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
      <input ref={fileRef} type="file" accept="image/*" className="photo-upload-grid__input" onChange={uploadCover} aria-hidden tabIndex={-1} />
    </div>
  );
}
