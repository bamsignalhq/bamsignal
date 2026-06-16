import { Camera, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_PROFILE_PHOTOS, MIN_PROFILE_PHOTOS, PHOTO_UPLOAD_FAIL } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  PhotoUploadError,
  uploadCompressedProfileBlob
} from "../services/profilePhotos";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { blobToDataUrl } from "../utils/photoUpload";
import { isStoragePhotoUrl, samePhotoRef } from "../utils/photoRefs";

type PhotoUploadGridProps = {
  photos: string[];
  coverPhoto?: string;
  onChange: (photos: string[]) => void;
  onModerationMessage?: (message: string) => void;
  /** Signup/onboarding — light validation only */
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

  const openPicker = (slotIndex: number) => {
    if (uploading || photos.length >= MAX_PROFILE_PHOTOS) return;
    setActiveSlot(slotIndex);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || photos.length >= MAX_PROFILE_PHOTOS) return;

    setUploading(true);
    const prior = photos;
    let previewUrl: string | null = null;

    try {
      const verdict = await moderatePhotoUpload(file, signupMode ? "signup" : "profile");
      if (!verdict.allowed) {
        onModerationMessage?.(verdict.message || PHOTO_UPLOAD_FAIL);
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

      previewUrl = URL.createObjectURL(compressed.blob);
      onChange([...prior, previewUrl].slice(0, MAX_PROFILE_PHOTOS));

      const remoteUrl = await uploadCompressedProfileBlob(compressed.blob, file);
      onChange([...prior, remoteUrl].slice(0, MAX_PROFILE_PHOTOS));
    } catch (error) {
      onChange(prior);
      if (error instanceof PhotoUploadError) {
        onModerationMessage?.(error.message || PHOTO_UPLOAD_FAIL);
      } else {
        onModerationMessage?.(PHOTO_UPLOAD_FAIL);
      }
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setUploading(false);
      setActiveSlot(null);
    }
  };

  const remove = (index: number) => {
    const url = photos[index];
    const next = photos.filter((_, i) => i !== index);
    onChange(next);
    if (isStoragePhotoUrl(url)) {
      void deleteStoredPhoto(url);
    }
  };

  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => photos[i] ?? null);
  const canAdd = photos.length < MAX_PROFILE_PHOTOS;
  const visibleSlots = Math.max(photos.length + (canAdd ? 1 : 0), MIN_PROFILE_PHOTOS);

  return (
    <div className="photo-upload-grid">
      <p className="photo-upload-grid__hint">
        Add {MIN_PROFILE_PHOTOS}–{MAX_PROFILE_PHOTOS} clear photos of you · {photos.length}/{MAX_PROFILE_PHOTOS}
      </p>
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
        accept="image/*"
        className="photo-upload-grid__input"
        onChange={uploadPhoto}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
