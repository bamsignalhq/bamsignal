import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { DEFAULT_PROFILE_COVER, PHOTO_UPLOAD_FAIL, photoModerationUserMessage, photoUploadUserMessage } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  mapUploadError,
  submitPhotoReviewRemote,
  uploadCompressedCoverBlob
} from "../services/profilePhotos";
import {
  assessUploadedPhoto,
  moderatePhotoUpload,
  toPhotoReviewMeta
} from "../utils/mediaModeration";
import { blobToDataUrl, PHOTO_FILE_ACCEPT, validatePhotoFile } from "../utils/photoUpload";
import { logPhotoPipeline } from "../utils/photoUploadLog";
import { upsertPhotoMeta } from "../utils/photoMeta";
import { isStoragePhotoUrl, samePhotoRef } from "../utils/photoRefs";
import { safeCoverPhoto } from "../utils/safeProfile";
import type { PhotoReviewMeta } from "../types";

type CoverPhotoUploadProps = {
  coverPhoto?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  profilePhotos: string[];
  onChange: (coverPhoto: string | undefined, photoMeta?: Record<string, PhotoReviewMeta>) => void;
  onModerationMessage?: (message: string) => void;
};

export function CoverPhotoUpload({
  coverPhoto,
  photoMeta,
  profilePhotos,
  onChange,
  onModerationMessage
}: CoverPhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const persistedCover = safeCoverPhoto(coverPhoto);
  const preview = localPreview || persistedCover || DEFAULT_PROFILE_COVER;
  const hasCustomCover = Boolean(localPreview || persistedCover);

  const openPicker = () => {
    if (uploading) return;
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const previousCover = persistedCover;
    const priorMeta = photoMeta;
    let previewUrl: string | null = null;

    try {
      logPhotoPipeline("selected", {
        kind: "cover",
        fileType: file.type,
        fileName: file.name,
        originalSize: file.size
      });

      const validation = await validatePhotoFile(file);
      if (!validation.ok) {
        logPhotoPipeline("failed", { kind: "cover", code: validation.code, internalReason: validation.internalReason });
        onModerationMessage?.(photoUploadUserMessage(validation.code));
        return;
      }
      logPhotoPipeline("decoded", { kind: "cover" });

      const compressed = await compressPhotoForPreview(file);
      logPhotoPipeline("compressed", {
        kind: "cover",
        compressedSize: compressed.blob.size,
        format: compressed.mime
      });

      const verdict = await moderatePhotoUpload(file, "cover");
      if (!verdict.allowed) {
        logPhotoPipeline("failed", {
          kind: "cover",
          code: verdict.code || "MODERATION_REJECTED",
          internalReason: verdict.internalReason || "moderation",
          moderation: true
        });
        onModerationMessage?.(verdict.message || photoModerationUserMessage());
        return;
      }

      const tempDataUrl = await blobToDataUrl(compressed.blob);
      if (profilePhotos.some((photo) => samePhotoRef(photo, tempDataUrl))) {
        onModerationMessage?.("Please choose a different image for your cover.");
        return;
      }

      previewUrl = URL.createObjectURL(compressed.blob);
      setLocalPreview(previewUrl);

      logPhotoPipeline("uploading", { kind: "cover" });
      const remoteUrl = await uploadCompressedCoverBlob(compressed.blob, file);
      logPhotoPipeline("uploaded", { kind: "cover" });

      const assessment = await assessUploadedPhoto(file, "cover");
      if (assessment.hardBlock) {
        await deleteStoredPhoto(remoteUrl);
        onModerationMessage?.(assessment.hardBlockMessage || photoModerationUserMessage());
        return;
      }

      const meta = toPhotoReviewMeta("cover", assessment);
      const nextMeta = upsertPhotoMeta(priorMeta, remoteUrl, meta);

      setLocalPreview(null);
      onChange(remoteUrl, nextMeta);

      if (meta.photoReviewStatus === "pending_review") {
        void submitPhotoReviewRemote({
          photoUrl: remoteUrl,
          photoType: "cover",
          photoReviewStatus: meta.photoReviewStatus,
          photoRiskFlags: meta.photoRiskFlags
        });
      }

      if (previousCover && isStoragePhotoUrl(previousCover)) {
        void deleteStoredPhoto(previousCover);
      }
      logPhotoPipeline("saved", { kind: "cover", reviewStatus: meta.photoReviewStatus });
    } catch (error) {
      setLocalPreview(null);
      onChange(previousCover, priorMeta);
      const mapped = mapUploadError(error);
      logPhotoPipeline("failed", { kind: "cover", code: mapped.code, reason: mapped.message });
      onModerationMessage?.(mapped.message || PHOTO_UPLOAD_FAIL);
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setUploading(false);
    }
  };

  const removeCover = () => {
    const previousCover = persistedCover;
    const nextMeta = { ...photoMeta };
    if (previousCover && nextMeta[previousCover]) delete nextMeta[previousCover];
    setLocalPreview(null);
    onChange(undefined, nextMeta);
    if (previousCover && isStoragePhotoUrl(previousCover)) {
      void deleteStoredPhoto(previousCover);
    }
  };

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
