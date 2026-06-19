import { Loader2, Plus, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  MAX_PROFILE_PHOTOS,
  MIN_PROFILE_PHOTOS,
  PHOTO_BATCH_PARTIAL_FAIL,
  PHOTO_LIMIT_MESSAGE,
  PHOTO_UPLOAD_FAIL
} from "../constants/photos";
import type { PhotoReviewMeta } from "../types";
import { deleteStoredPhoto } from "../services/profilePhotos";
import { flowLog } from "../utils/flowLog";
import {
  addProfilePhotos,
  isMainPhoto,
  mainPhotoAfterDelete,
  resolveMainPhotoUrl,
  setMainPhoto
} from "../utils/mainPhoto";
import { upsertPhotoMeta } from "../utils/photoMeta";
import { runWithConcurrency, uploadSingleProfilePhotoFile } from "../utils/profilePhotoUpload";
import { isStoragePhotoUrl } from "../utils/photoRefs";
import { PHOTO_FILE_ACCEPT } from "../utils/photoUpload";
import { safePhotos } from "../utils/safeProfile";

type PhotoUploadGridProps = {
  photos: string[];
  mainPhotoUrl?: string;
  photoMeta?: Record<string, PhotoReviewMeta>;
  coverPhoto?: string;
  onChange: (
    photos: string[],
    photoMeta?: Record<string, PhotoReviewMeta>,
    mainPhotoUrl?: string
  ) => void;
  onModerationMessage?: (message: string) => void;
  signupMode?: boolean;
  className?: string;
};

type PendingTile = {
  key: string;
  previewUrl: string;
  file: File;
  status: "uploading" | "failed";
};

const UPLOAD_CONCURRENCY = 2;

export function PhotoUploadGrid({
  photos,
  mainPhotoUrl,
  photoMeta,
  coverPhoto,
  onChange,
  onModerationMessage,
  signupMode = false,
  className = ""
}: PhotoUploadGridProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const workingRef = useRef({
    photos: [] as string[],
    meta: undefined as Record<string, PhotoReviewMeta> | undefined,
    main: undefined as string | undefined
  });
  const [pending, setPending] = useState<PendingTile[]>([]);
  const [busy, setBusy] = useState(false);

  const persistedPhotos = safePhotos(photos);
  const profileForMain = { photos: persistedPhotos, mainPhotoUrl };
  const canAdd = persistedPhotos.length + pending.length < MAX_PROFILE_PHOTOS;

  const emitChange = (
    nextPhotos: string[],
    nextMeta: Record<string, PhotoReviewMeta> | undefined,
    nextMain?: string
  ) => {
    const normalized = nextMain
      ? setMainPhoto(nextPhotos, nextMain)
      : setMainPhoto(nextPhotos, resolveMainPhotoUrl(nextPhotos, mainPhotoUrl));
    onChange(normalized.photos, nextMeta, normalized.mainPhotoUrl);
  };

  const openPicker = () => {
    if (busy || !canAdd) return;
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const processFiles = async (files: File[]) => {
    if (!files.length) return;

    const allowed = Math.max(0, MAX_PROFILE_PHOTOS - persistedPhotos.length);
    const batch = files.slice(0, allowed);
    if (files.length > allowed && allowed > 0) {
      onModerationMessage?.(PHOTO_LIMIT_MESSAGE);
    } else if (allowed === 0) {
      onModerationMessage?.(PHOTO_LIMIT_MESSAGE);
      return;
    }

    setBusy(true);
    flowLog("photo_upload_start", { signupMode, count: batch.length });

    const pendingEntries: PendingTile[] = batch.map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      file,
      status: "uploading" as const
    }));
    setPending((current) => [...current, ...pendingEntries]);

    workingRef.current = {
      photos: [...persistedPhotos],
      meta: { ...photoMeta },
      main: mainPhotoUrl
    };

    let uploadFailCount = 0;

    await runWithConcurrency(pendingEntries, UPLOAD_CONCURRENCY, async (entry) => {
      const snapshot = workingRef.current;
      const result = await uploadSingleProfilePhotoFile({
        file: entry.file,
        signupMode,
        coverPhoto,
        existingPhotos: snapshot.photos
      });

      if (result.ok) {
        const nextMeta = upsertPhotoMeta(snapshot.meta, result.url, result.meta);
        const added = addProfilePhotos(snapshot.photos, snapshot.main, [result.url]);
        workingRef.current = {
          photos: added.photos,
          meta: nextMeta,
          main: added.mainPhotoUrl
        };
        emitChange(added.photos, nextMeta, added.mainPhotoUrl);
        setPending((current) => {
          const tile = current.find((item) => item.key === entry.key);
          if (tile) URL.revokeObjectURL(tile.previewUrl);
          return current.filter((item) => item.key !== entry.key);
        });
        flowLog("photo_upload_ok", { signupMode });
      } else {
        if (result.moderation) {
          onModerationMessage?.(result.message);
        } else {
          uploadFailCount += 1;
        }
        setPending((current) =>
          current.map((item) => (item.key === entry.key ? { ...item, status: "failed" as const } : item))
        );
        if (!result.moderation) {
          onModerationMessage?.(result.message);
        }
      }

      return result;
    });

    if (uploadFailCount > 0) {
      onModerationMessage?.(
        uploadFailCount === batch.length ? PHOTO_UPLOAD_FAIL : PHOTO_BATCH_PARTIAL_FAIL
      );
    }

    setBusy(false);
  };

  const uploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    await processFiles(selected);
  };

  const retryPending = async (entry: PendingTile) => {
    setPending((current) =>
      current.map((item) => (item.key === entry.key ? { ...item, status: "uploading" as const } : item))
    );
    setBusy(true);
    const result = await uploadSingleProfilePhotoFile({
      file: entry.file,
      signupMode,
      coverPhoto,
      existingPhotos: persistedPhotos
    });
    if (result.ok) {
      const nextMeta = upsertPhotoMeta(photoMeta, result.url, result.meta);
      const added = addProfilePhotos(persistedPhotos, mainPhotoUrl, [result.url]);
      emitChange(added.photos, nextMeta, added.mainPhotoUrl);
      URL.revokeObjectURL(entry.previewUrl);
      setPending((current) => current.filter((item) => item.key !== entry.key));
    } else {
      setPending((current) =>
        current.map((item) => (item.key === entry.key ? { ...item, status: "failed" as const } : item))
      );
      onModerationMessage?.(result.message || PHOTO_UPLOAD_FAIL);
    }
    setBusy(false);
  };

  const remove = (url: string) => {
    const next = mainPhotoAfterDelete(persistedPhotos, mainPhotoUrl, url);
    const nextMeta = { ...photoMeta };
    if (nextMeta[url]) delete nextMeta[url];
    onChange(next.photos, nextMeta, next.mainPhotoUrl);
    if (isStoragePhotoUrl(url)) void deleteStoredPhoto(url);
  };

  const removePending = (entry: PendingTile) => {
    URL.revokeObjectURL(entry.previewUrl);
    setPending((current) => current.filter((item) => item.key !== entry.key));
  };

  const makeMain = (url: string) => {
    const next = setMainPhoto(persistedPhotos, url);
    onChange(next.photos, photoMeta, next.mainPhotoUrl);
  };

  const photoCount = persistedPhotos.length;

  return (
    <div className={`photo-upload-grid ${className}`.trim()}>
      <div className="photo-upload-grid__tiles">
        {persistedPhotos.map((src) => {
          const isMain = isMainPhoto(src, profileForMain);
          return (
            <div
              key={src}
              className={`photo-upload-grid__tile${isMain ? " photo-upload-grid__tile--main" : ""}`}
            >
              <img src={src} alt="" />
              <button
                type="button"
                className={`photo-upload-grid__star${isMain ? " photo-upload-grid__star--active" : ""}`}
                onClick={() => makeMain(src)}
                aria-label={isMain ? "Main photo" : "Set as main photo"}
                aria-pressed={isMain}
              >
                <Star size={14} fill={isMain ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                className="photo-upload-grid__remove"
                onClick={() => remove(src)}
                aria-label="Remove photo"
                disabled={photoCount <= MIN_PROFILE_PHOTOS}
              >
                <X size={14} />
              </button>
              {isMain ? <span className="photo-upload-grid__badge">Main</span> : null}
            </div>
          );
        })}

        {pending.map((entry) => (
          <div
            key={entry.key}
            className={`photo-upload-grid__tile photo-upload-grid__tile--pending${
              entry.status === "failed" ? " photo-upload-grid__tile--failed" : ""
            }`}
          >
            <img src={entry.previewUrl} alt="" />
            {entry.status === "uploading" ? (
              <div className="photo-upload-grid__overlay" aria-hidden>
                <Loader2 size={22} className="photo-upload-grid__spinner" />
              </div>
            ) : (
              <div className="photo-upload-grid__overlay photo-upload-grid__overlay--failed">
                <button type="button" className="btn-secondary btn-sm" onClick={() => void retryPending(entry)}>
                  Retry
                </button>
              </div>
            )}
            <button
              type="button"
              className="photo-upload-grid__remove"
              onClick={() => removePending(entry)}
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {canAdd ? (
          <button
            type="button"
            className="photo-upload-grid__tile photo-upload-grid__add-tile"
            onClick={openPicker}
            disabled={busy}
            aria-label="Add photos"
          >
            <Plus size={24} />
          </button>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={PHOTO_FILE_ACCEPT}
        multiple
        className="photo-upload-grid__input"
        onChange={(e) => void uploadPhotos(e)}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
