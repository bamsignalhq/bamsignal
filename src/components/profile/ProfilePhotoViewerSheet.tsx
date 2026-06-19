import { Camera, ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PhotoUploadErrorCode } from "../../constants/photoUploadErrors";
import {
  DEFAULT_PROFILE_COVER,
  MAX_PROFILE_PHOTOS,
  MIN_PROFILE_PHOTOS,
  PHOTO_UPLOAD_FAIL,
  photoModerationUserMessage,
  photoUploadUserMessage
} from "../../constants/photos";
import {
  compressPhotoForPreview,
  deleteStoredPhoto,
  mapUploadError,
  uploadCompressedProfileBlob
} from "../../services/profilePhotos";
import type { PhotoReviewMeta } from "../../types";
import { upsertPhotoMeta } from "../../utils/photoMeta";
import { photoMetaFromUpload } from "../../utils/photoUploadResult";
import { PHOTO_FILE_ACCEPT, blobToDataUrl, validatePhotoFile } from "../../utils/photoUpload";
import { logPhotoPipeline } from "../../utils/photoUploadLog";
import { isStoragePhotoUrl, samePhotoRef } from "../../utils/photoRefs";
import { mainPhotoAfterDelete, resolveMainPhotoUrl, setMainPhoto, isMainPhoto, addProfilePhotos } from "../../utils/mainPhoto";
import { safePhotos } from "../../utils/safeProfile";
import { ShowcaseImage } from "../ShowcaseImage";

type ProfilePhotoViewerSheetProps = {
  open: boolean;
  initialIndex?: number;
  memberName?: string;
  photos: string[];
  mainPhotoUrl?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  coverPhoto?: string;
  onClose: () => void;
  onChange: (
    photos: string[],
    photoMeta?: Record<string, PhotoReviewMeta>,
    mainPhotoUrl?: string
  ) => void;
  onModerationMessage?: (message: string) => void;
};

type PickMode = "replace" | "add";

export function ProfilePhotoViewerSheet({
  open,
  initialIndex = 0,
  memberName,
  photos,
  mainPhotoUrl,
  photoMeta,
  coverPhoto,
  onClose,
  onChange,
  onModerationMessage
}: ProfilePhotoViewerSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoIndex, setPhotoIndex] = useState(initialIndex);
  const [uploading, setUploading] = useState(false);
  const [pickMode, setPickMode] = useState<PickMode>("replace");
  const [replaceSlot, setReplaceSlot] = useState(0);

  const gallery = safePhotos(photos);
  const mainUrl = resolveMainPhotoUrl(gallery, mainPhotoUrl);
  const heroPhoto = gallery[photoIndex] ?? gallery[0] ?? null;
  const heroIsMain = heroPhoto ? isMainPhoto(heroPhoto, { photos: gallery, mainPhotoUrl }) : false;
  const canDelete = gallery.length > MIN_PROFILE_PHOTOS;
  const canAdd = gallery.length < MAX_PROFILE_PHOTOS;

  useEffect(() => {
    if (!open) return;
    setPhotoIndex(Math.min(initialIndex, Math.max(0, gallery.length - 1)));
  }, [open, initialIndex, gallery.length]);

  const goPhoto = (dir: -1 | 1) => {
    if (gallery.length <= 1) return;
    setPhotoIndex((i) => (i + dir + gallery.length) % gallery.length);
  };

  const failUpload = (code: PhotoUploadErrorCode, internalReason: string, message?: string) => {
    logPhotoPipeline("failed", { code, internalReason });
    onModerationMessage?.(message || photoUploadUserMessage(code));
  };

  const openPicker = (mode: PickMode, slot: number) => {
    if (uploading) return;
    setPickMode(mode);
    setReplaceSlot(slot);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const handleDelete = () => {
    if (!canDelete || !gallery[photoIndex]) return;
    const url = gallery[photoIndex];
    const next = mainPhotoAfterDelete(gallery, mainPhotoUrl, url);
    const nextMeta = { ...photoMeta };
    if (url && nextMeta[url]) delete nextMeta[url];
    onChange(next.photos, nextMeta, next.mainPhotoUrl);
    if (isStoragePhotoUrl(url)) void deleteStoredPhoto(url);
    setPhotoIndex((i) => Math.min(i, Math.max(0, next.photos.length - 1)));
    if (next.photos.length === 0) onClose();
  };

  const makeMain = () => {
    if (!heroPhoto) return;
    const next = setMainPhoto(gallery, heroPhoto);
    onChange(next.photos, photoMeta, next.mainPhotoUrl);
    setPhotoIndex(0);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const prior = gallery;
    const priorMeta = photoMeta;
    const slotIndex = pickMode === "add" ? prior.length : replaceSlot;

    if (pickMode === "add" && prior.length >= MAX_PROFILE_PHOTOS) return;

    setUploading(true);
    try {
      const validation = await validatePhotoFile(file);
      if (!validation.ok) {
        failUpload(validation.code, validation.internalReason);
        return;
      }

      const compressed = await compressPhotoForPreview(file);
      const tempDataUrl = await blobToDataUrl(compressed.blob);
      if (samePhotoRef(tempDataUrl, coverPhoto)) {
        onModerationMessage?.("Please choose a different image from your cover photo.");
        return;
      }
      if (prior.some((photo, i) => i !== slotIndex && samePhotoRef(photo, tempDataUrl))) {
        onModerationMessage?.("You already added this photo.");
        return;
      }

      const uploadResult = await uploadCompressedProfileBlob(compressed.blob, file, compressed.mime);
      if (uploadResult.moderationRejected) {
        onModerationMessage?.(photoModerationUserMessage());
        return;
      }

      const remoteUrl = uploadResult.url;
      const meta = photoMetaFromUpload("profile", uploadResult);
      const nextMeta = upsertPhotoMeta(priorMeta, remoteUrl, meta);

      const withRemote =
        pickMode === "add"
          ? [...prior, remoteUrl]
          : slotIndex < prior.length
            ? prior.map((photo, index) => (index === slotIndex ? remoteUrl : photo))
            : [...prior, remoteUrl];

      const trimmed = withRemote.slice(0, MAX_PROFILE_PHOTOS);
      let nextMain = mainPhotoUrl;
      if (pickMode === "replace" && prior[slotIndex] && samePhotoRef(prior[slotIndex], mainUrl)) {
        nextMain = remoteUrl;
      }
      const normalized =
        pickMode === "add"
          ? addProfilePhotos(prior, mainPhotoUrl, [remoteUrl])
          : setMainPhoto(trimmed, nextMain || resolveMainPhotoUrl(trimmed, mainPhotoUrl));
      onChange(normalized.photos, nextMeta, normalized.mainPhotoUrl);

      if (pickMode === "replace" && prior[slotIndex] && isStoragePhotoUrl(prior[slotIndex])) {
        void deleteStoredPhoto(prior[slotIndex]);
      }

      setPhotoIndex(
        pickMode === "add"
          ? normalized.photos.length - 1
          : normalized.photos.findIndex((photo) => samePhotoRef(photo, remoteUrl))
      );
    } catch (error) {
      const mapped = mapUploadError(error);
      onModerationMessage?.(mapped.message || PHOTO_UPLOAD_FAIL);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="profile-detail-sheet profile-photo-viewer" role="dialog" aria-modal="true" aria-label="Your profile photos">
      <button type="button" className="profile-detail-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <article className="profile-detail-sheet__panel profile-detail-sheet__panel--photo-owner">
        <header className="profile-detail-sheet__hero profile-detail-sheet__hero--full">
          {heroPhoto ? (
            <ShowcaseImage
              src={heroPhoto}
              alt={memberName ? `${memberName} photo ${photoIndex + 1}` : `Profile photo ${photoIndex + 1}`}
              fallbackSrc={DEFAULT_PROFILE_COVER}
              className="profile-detail-sheet__img--full"
            />
          ) : (
            <div className="profile-photo-viewer__empty">
              <Camera size={40} aria-hidden />
              <p>Add your first profile photo</p>
            </div>
          )}
          {gallery.length > 1 && heroPhoto ? (
            <>
              <button
                type="button"
                className="profile-detail-sheet__nav profile-detail-sheet__nav--prev"
                onClick={() => goPhoto(-1)}
                aria-label="Previous photo"
              />
              <button
                type="button"
                className="profile-detail-sheet__nav profile-detail-sheet__nav--next"
                onClick={() => goPhoto(1)}
                aria-label="Next photo"
              />
            </>
          ) : null}
          <div className="profile-detail-sheet__shade" />
          <button type="button" className="profile-detail-sheet__close icon-btn" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
          {gallery.length > 1 ? (
            <div className="profile-detail-sheet__dots" role="tablist" aria-label="Photos">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === photoIndex}
                  className={i === photoIndex ? "active" : ""}
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          ) : null}
          <div className="profile-detail-sheet__meta">
            <h2 className="profile-detail-sheet__name">{memberName || "Your photos"}</h2>
            <p className="profile-detail-sheet__subline">
              {gallery.length
                ? `Photo ${photoIndex + 1} of ${gallery.length}${heroIsMain ? " · Main" : ""}`
                : "This is how others see your profile"}
            </p>
          </div>
        </header>

        <footer className="profile-photo-viewer__actions">
          {gallery.length > 1 && heroPhoto ? (
            <div className="profile-photo-viewer__nav-row">
              <button
                type="button"
                className="btn-secondary profile-photo-viewer__nav-btn"
                disabled={uploading}
                onClick={() => goPhoto(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} aria-hidden />
                Previous
              </button>
              <button
                type="button"
                className="btn-secondary profile-photo-viewer__nav-btn"
                disabled={uploading}
                onClick={() => goPhoto(1)}
                aria-label="Next photo"
              >
                Next
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          ) : null}
          {heroPhoto ? (
            <>
              {!heroIsMain ? (
                <button
                  type="button"
                  className="btn-secondary profile-photo-viewer__btn"
                  disabled={uploading}
                  onClick={makeMain}
                >
                  Set as main
                </button>
              ) : null}
              <button
                type="button"
                className="btn-secondary profile-photo-viewer__btn"
                disabled={uploading || !canDelete}
                onClick={handleDelete}
              >
                <Trash2 size={16} aria-hidden />
                Delete
              </button>
              <button
                type="button"
                className="btn-primary profile-photo-viewer__btn"
                disabled={uploading}
                onClick={() => openPicker("replace", photoIndex)}
              >
                {uploading ? <Loader2 size={16} className="photo-upload-grid__spinner" aria-hidden /> : <Camera size={16} aria-hidden />}
                Replace
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-primary profile-photo-viewer__btn profile-photo-viewer__btn--wide"
              disabled={uploading}
              onClick={() => openPicker("add", 0)}
            >
              {uploading ? <Loader2 size={16} className="photo-upload-grid__spinner" aria-hidden /> : <Camera size={16} aria-hidden />}
              Add photo
            </button>
          )}
          {heroPhoto && canAdd ? (
            <button
              type="button"
              className="btn-secondary profile-photo-viewer__btn"
              disabled={uploading}
              onClick={() => openPicker("add", gallery.length)}
            >
              Add photo
            </button>
          ) : null}
        </footer>

        <input
          ref={fileRef}
          type="file"
          accept={PHOTO_FILE_ACCEPT}
          className="photo-upload-grid__input"
          onChange={uploadPhoto}
          aria-hidden
          tabIndex={-1}
        />
      </article>
    </div>
  );
}
