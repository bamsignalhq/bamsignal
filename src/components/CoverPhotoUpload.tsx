import { Camera, X } from "lucide-react";
import { useRef } from "react";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import { moderatePhotoUpload } from "../utils/mediaModeration";
import { sameImageDataUrl } from "../utils/imageContactScan";

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

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const verdict = await moderatePhotoUpload(file, "cover");
    if (!verdict.allowed) {
      onModerationMessage?.(verdict.message);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (profilePhotos.some((photo) => sameImageDataUrl(photo, url))) {
        onModerationMessage?.("Please choose a different image for your cover.");
        return;
      }
      onChange(url);
    };
    reader.readAsDataURL(file);
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
          <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            <Camera size={16} aria-hidden />
            {hasCustomCover ? "Change cover" : "Add cover photo"}
          </button>
          {hasCustomCover && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => onChange(undefined)}>
              <X size={16} aria-hidden />
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadCover} />
    </div>
  );
}
