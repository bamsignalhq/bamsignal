import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { PHOTO_UPLOAD_FAIL, photoUploadUserMessage } from "../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  mapUploadError,
  uploadCompressedCoverBlob
} from "../services/profilePhotos";
import type { PhotoReviewMeta } from "../types";
import { photoMetaFromUpload } from "../utils/photoUploadResult";
import { PHOTO_FILE_ACCEPT, blobToDataUrl, validatePhotoFile } from "../utils/photoUpload";
import { logPhotoPipeline } from "../utils/photoUploadLog";
import { upsertPhotoMeta } from "../utils/photoMeta";
import { isStoragePhotoUrl, samePhotoRef } from "../utils/photoRefs";
import { coverPhotoDisplayUrl } from "../utils/coverPhoto";
import { isShowcasePhotoUrl, safeUserCoverPhoto } from "../utils/safeProfile";

type UseCoverPhotoFlowOptions = {
  coverPhoto?: string;
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

export function useCoverPhotoFlow({
  coverPhoto,
  coverPhotoExplicit,
  coverPhotoUpdatedAt,
  photoMeta,
  profilePhotos,
  onChange,
  onModerationMessage
}: UseCoverPhotoFlowOptions) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingCover, setPendingCover] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropSrcRef = useRef<string | null>(null);

  const persistedCover =
    coverPhotoExplicit === false
      ? undefined
      : coverPhotoDisplayUrl({
          coverPhotoUrl: safeUserCoverPhoto(coverPhoto),
          coverPhotoUpdatedAt,
          coverPhotoExplicit
        }) ?? safeUserCoverPhoto(coverPhoto);

  useEffect(() => {
    if (!pendingCover || !persistedCover) return;
    if (samePhotoRef(pendingCover, persistedCover)) {
      setPendingCover(null);
    }
  }, [pendingCover, persistedCover]);

  const displayCover = localPreview || pendingCover || persistedCover || null;
  const hasCustomCover = Boolean(displayCover);

  const setCropPreview = useCallback((next: string | null) => {
    if (cropSrcRef.current) URL.revokeObjectURL(cropSrcRef.current);
    cropSrcRef.current = next;
    setCropSrc(next);
  }, []);

  const clearCropSrc = useCallback(() => {
    setCropPreview(null);
  }, [setCropPreview]);

  const openPicker = useCallback(() => {
    if (uploading) return;
    window.setTimeout(() => fileRef.current?.click(), 0);
  }, [uploading]);

  const uploadCroppedBlob = useCallback(
    async (croppedBlob: Blob, sourceName: string) => {
      const croppedFile = new File([croppedBlob], sourceName || "cover.jpg", {
        type: croppedBlob.type || "image/jpeg"
      });

      setUploading(true);
      const previousCover = persistedCover;
      const priorMeta = photoMeta;
      let previewUrl: string | null = null;

      try {
        logPhotoPipeline("selected", {
          kind: "cover",
          fileType: croppedFile.type,
          fileName: croppedFile.name,
          originalSize: croppedFile.size
        });

        const compressed = await compressPhotoForPreview(croppedFile);
        logPhotoPipeline("compressed", {
          kind: "cover",
          compressedSize: compressed.blob.size,
          format: compressed.mime
        });

        const tempDataUrl = await blobToDataUrl(compressed.blob);
        if (profilePhotos.some((photo) => samePhotoRef(photo, tempDataUrl))) {
          onModerationMessage?.("Please choose a different image for your cover.");
          return;
        }

        previewUrl = URL.createObjectURL(compressed.blob);
        setLocalPreview(previewUrl);

        logPhotoPipeline("uploading", { kind: "cover" });
        const uploadResult = await uploadCompressedCoverBlob(compressed.blob, croppedFile, compressed.mime);
        logPhotoPipeline("uploaded", {
          kind: "cover",
          reviewStatus: uploadResult.reviewStatus || "pending_review"
        });

        const remoteUrl = uploadResult.url;
        const remotePath = uploadResult.path;

        const meta = photoMetaFromUpload("cover", uploadResult);
        const nextMeta = upsertPhotoMeta(priorMeta, remoteUrl, meta);

        setLocalPreview(null);
        setPendingCover(remoteUrl);
        onChange(remoteUrl, nextMeta, remotePath);

        if (previousCover && isStoragePhotoUrl(previousCover)) {
          void deleteStoredPhoto(previousCover);
        }
        logPhotoPipeline("saved", { kind: "cover", reviewStatus: meta.photoReviewStatus });
      } catch (error) {
        setLocalPreview(null);
        setPendingCover(null);
        if (previousCover && !isShowcasePhotoUrl(previousCover)) {
          onChange(previousCover, priorMeta);
        } else {
          onChange(undefined, priorMeta);
        }
        const mapped = mapUploadError(error);
        logPhotoPipeline("failed", { kind: "cover", code: mapped.code, reason: mapped.message });
        onModerationMessage?.(mapped.message || PHOTO_UPLOAD_FAIL);
      } finally {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setUploading(false);
      }
    },
    [onChange, persistedCover, photoMeta, profilePhotos, onModerationMessage]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || uploading) return;

      const validation = await validatePhotoFile(file);
      if (!validation.ok) {
        logPhotoPipeline("failed", {
          kind: "cover",
          code: validation.code,
          internalReason: validation.internalReason
        });
        onModerationMessage?.(photoUploadUserMessage(validation.code));
        return;
      }

      clearCropSrc();
      setCropPreview(URL.createObjectURL(file));
    },
    [clearCropSrc, onModerationMessage, setCropPreview, uploading]
  );

  const confirmCrop = useCallback(
    async (blob: Blob) => {
      clearCropSrc();
      await uploadCroppedBlob(blob, "cover-crop.jpg");
    },
    [clearCropSrc, uploadCroppedBlob]
  );

  const cancelCrop = useCallback(() => {
    clearCropSrc();
  }, [clearCropSrc]);

  const removeCover = useCallback(() => {
    const previousCover = persistedCover;
    const nextMeta = { ...photoMeta };
    if (previousCover && nextMeta[previousCover]) delete nextMeta[previousCover];
    setLocalPreview(null);
    setPendingCover(null);
    onChange(undefined, nextMeta);
    if (previousCover && isStoragePhotoUrl(previousCover)) {
      void deleteStoredPhoto(previousCover);
    }
  }, [onChange, persistedCover, photoMeta]);

  return {
    fileRef,
    uploading,
    hasCustomCover,
    displayCover,
    localPreview,
    pendingCover,
    persistedCover,
    cropSrc,
    openPicker,
    handleFileChange,
    confirmCrop,
    cancelCrop,
    removeCover,
    fileAccept: PHOTO_FILE_ACCEPT
  };
}
