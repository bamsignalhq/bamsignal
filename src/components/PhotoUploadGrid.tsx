import { Camera, Plus, X } from "lucide-react";
import { useRef } from "react";
import { MAX_PROFILE_PHOTOS, MIN_PROFILE_PHOTOS } from "../constants/photos";
import { moderatePhotoUpload } from "../utils/mediaModeration";

type PhotoUploadGridProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  onModerationMessage?: (message: string) => void;
};

export function PhotoUploadGrid({ photos, onChange, onModerationMessage }: PhotoUploadGridProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || photos.length >= MAX_PROFILE_PHOTOS) return;
    const verdict = await moderatePhotoUpload(file);
    if (!verdict.allowed) {
      onModerationMessage?.(verdict.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      onChange([...photos, url].slice(0, MAX_PROFILE_PHOTOS));
    };
    reader.readAsDataURL(file);
  };

  const remove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => photos[i] ?? null);
  const canAdd = photos.length < MAX_PROFILE_PHOTOS;

  return (
    <div className="photo-upload-grid">
      <p className="photo-upload-grid__hint">
        Add {MIN_PROFILE_PHOTOS}–{MAX_PROFILE_PHOTOS} clear photos of you alone · {photos.length}/{MAX_PROFILE_PHOTOS}
      </p>
      <div className="photo-upload-grid__tiles">
        {slots.slice(0, Math.max(photos.length + (canAdd ? 1 : 0), MIN_PROFILE_PHOTOS)).map((src, i) => (
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
              <button type="button" className="photo-upload-grid__add" onClick={() => fileRef.current?.click()}>
                {i === 0 ? <Camera size={28} /> : <Plus size={22} />}
              </button>
            )}
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />
    </div>
  );
}
