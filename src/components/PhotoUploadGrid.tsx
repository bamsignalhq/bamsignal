import { Camera, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_PROFILE_PHOTOS, MIN_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  mapUploadError,
  PhotoUploadError,
  uploadCompressedProfileBlob
} from "../services/profilePhotos";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { blobToDataUrl, PHOTO_FILE_ACCEPT, validatePhotoFile } from "../utils/photoUpload";
import { logPhotoUpload } from "../utils/photoUploadLog";
import { flowLog } from "../utils/flowLog";
import { isStoragePhotoUrl, samePhotoRef } from "../utils/photoRefs";
import { safePhotos } from "../utils/safeProfile";

type PhotoUploadGridProps = {
  photos: string[];
  coverPhoto?: string;
  onChange: (photos: string[]) => void;
  onModerationMessage?: (message: string) => void;
  /** Signup/onboarding — gallery only, no cover */
  signupMode?: boolean;
};

export function PhotoUploadGrid({
  photos,
  coverPhoto,
  onChange,
  onModerationMessage,
  signupMode = false
}: PhotoUploadGridProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSlot, setPreviewSlot] = useState<number | null>(null);

  const persistedPhotos = safePhotos(photos);
  const displayPhotos = [...persistedPhotos];
  if (previewUrl && previewSlot !== null) {
    if (previewSlot < displayPhotos.length) {
      displayPhotos[previewSlot] = previewUrl;
    } else {
      displayPhotos.push(previewUrl);
    }
  }

  const openPicker = (slotIndex: number) => {
    if (uploading || persistedPhotos.length >= MAX_PROFILE_PHOTOS) return;
    setActiveSlot(slotIndex);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const failUpload = (code: string, internalReason: string) => {
    logPhotoUpload("upload_rejected", { code, internalReason });
    onModerationMessage?.(PHOTO_UPLOAD_FAIL);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || persistedPhotos.length >= MAX_PROFILE_PHOTOS) return;

    setUploading(true);
    flowLog("photo_upload_start", { signupMode });
    const prior = persistedPhotos;
    let tempPreviewUrl: string | null = null;
    const slotIndex = activeSlot ?? prior.length;

    try {
      logPhotoUpload("pick", {
        signupMode,
        fileType: file.type,
        fileName: file.name,
        originalSize: file.size
      });

      const validation = await validatePhotoFile(file);
      if (!validation.ok) {
        failUpload(validation.code, validation.internalReason);
        return;
      }

      const verdict = await moderatePhotoUpload(file, signupMode ? "signup" : "profile");
      if (!verdict.allowed) {
        failUpload(verdict.code || "MODERATION_REJECTED", verdict.internalReason || "moderation");
        return;
      }

      const compressed = await compressPhotoForPreview(file);
      const tempDataUrl = await blobToDataUrl(compressed.blob);
      if (samePhotoRef(tempDataUrl, coverPhoto)) {
        onModerationMessage?.("Please choose a different image from your cover photo.");
        return;
      }
      if (prior.some((photo) => samePhotoRef(photo, tempDataUrl))) {
        onModerationMessage?.("You already added this photo.");
        return;
      }

      tempPreviewUrl = URL.createObjectURL(compressed.blob);
      setPreviewUrl(tempPreviewUrl);
      setPreviewSlot(slotIndex);

      const remoteUrl = await uploadCompressedProfileBlob(compressed.blob, file);
      const withRemote =
        slotIndex < prior.length
          ? prior.map((photo, index) => (index === slotIndex ? remoteUrl : photo))
          : [...prior, remoteUrl];
      onChange(withRemote.slice(0, MAX_PROFILE_PHOTOS));
      logPhotoUpload("upload_ok", { signupMode });
      flowLog("photo_upload_ok", { signupMode });
    } catch (error) {
      onChange(prior);
      const mapped = mapUploadError(error);
      logPhotoUpload("upload_failed", { code: mapped.code, message: mapped.message });
      flowLog("photo_upload_failed", { code: mapped.code });
      onModerationMessage?.(mapped.message || PHOTO_UPLOAD_FAIL);
    } finally {
      if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
      setPreviewUrl(null);
      setPreviewSlot(null);
      setUploading(false);
      setActiveSlot(null);
    }
  };

  const remove = (index: number) => {
    const url = persistedPhotos[index];
    const next = persistedPhotos.filter((_, i) => i !== index);
    onChange(next);
    if (isStoragePhotoUrl(url)) {
      void deleteStoredPhoto(url);
    }
  };

  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => displayPhotos[i] ?? null);
  const canAdd = displayPhotos.length < MAX_PROFILE_PHOTOS;
  const visibleSlots = Math.max(displayPhotos.length + (canAdd ? 1 : 0), MIN_PROFILE_PHOTOS);
  const photoCount = displayPhotos.filter(Boolean).length;
  const belowMin = photoCount < MIN_PROFILE_PHOTOS;
  const aboveMax = photoCount > MAX_PROFILE_PHOTOS;

  return (
    <div className="photo-upload-grid">
      {belowMin ? (
        <p className="photo-upload-grid__hint photo-upload-grid__hint--warn" role="status">
          Please add at least {MIN_PROFILE_PHOTOS} photos.
        </p>
      ) : null}
      {aboveMax ? (
        <p className="photo-upload-grid__hint photo-upload-grid__hint--warn" role="status">
          Maximum {MAX_PROFILE_PHOTOS} photos allowed.
        </p>
      ) : null}
      <div className="photo-upload-grid__tiles">
        {slots.slice(0, visibleSlots).map((src, i) => (
          <div key={i} className={`photo-upload-grid__tile ${i === 0 ? "photo-upload-grid__tile--main" : ""}`}>
            {src ? (
              <>
                <img src={src} alt="" />
                <button type="button" className="photo-upload-grid__remove" onClick={() => remove(i)} aria-label="Remove photo">
                  <X size={14} />
                </button>
                {i === 0 && <span className="photo-upload-grid__badge">Main</span>}
              </>
            ) : (
              <button
                type="button"
                className="photo-upload-grid__add"
                onClick={() => openPicker(i)}
                disabled={uploading}
                aria-label={i === 0 ? "Add main photo" : "Add photo"}
                aria-busy={uploading && activeSlot === i}
              >
                {uploading && activeSlot === i ? (
                  <Loader2 size={28} className="photo-upload-grid__spinner" aria-hidden />
                ) : i === 0 ? (
                  <Camera size={28} />
                ) : (
                  <Plus size={22} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={PHOTO_FILE_ACCEPT}
        className="photo-upload-grid__input"
        onChange={uploadPhoto}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
