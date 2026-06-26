import { useCallback, useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { COVER_ASPECT_RATIO, getCroppedCoverBlob, initialCoverCropPixels, type CoverCropArea } from "../utils/coverCrop";

type CropperProps = {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  onCropChange: (location: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: CoverCropArea, croppedAreaPixels: CoverCropArea) => void;
  onMediaLoaded: (mediaSize: { width: number; height: number }) => void;
};

type CoverPhotoCropModalProps = {
  imageSrc: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
};

export function CoverPhotoCropModal({ imageSrc, onClose, onConfirm }: CoverPhotoCropModalProps) {
  const [Cropper, setCropper] = useState<ComponentType<CropperProps> | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CoverCropArea | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("react-easy-crop").then((module) => {
      if (!cancelled) {
        setCropper(() => module.default as unknown as ComponentType<CropperProps>);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    setCroppedAreaPixels(initialCoverCropPixels(mediaSize.width, mediaSize.height));
  }, []);

  const handleUsePhoto = async () => {
    if (!croppedAreaPixels || saving) return;
    setSaving(true);
    try {
      const blob = await getCroppedCoverBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div className="modal-backdrop cover-crop-backdrop" role="presentation" onClick={onClose}>
      <div
        className="cover-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-crop-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cover-crop-modal__head">
          <h3 id="cover-crop-title">Position your backdrop</h3>
          <p>Drag and zoom to frame the area you want on your profile.</p>
        </header>
        <div className="cover-crop-modal__stage">
          {Cropper ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={COVER_ASPECT_RATIO}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_croppedArea: CoverCropArea, pixels: CoverCropArea) => setCroppedAreaPixels(pixels)}
              onMediaLoaded={onMediaLoaded}
            />
          ) : (
            <p className="cover-crop-modal__loading" aria-live="polite">
              Loading cropper…
            </p>
          )}
        </div>
        <label className="cover-crop-modal__zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            disabled={!Cropper}
          />
        </label>
        <div className="cover-crop-modal__actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleUsePhoto()}
            disabled={saving || !Cropper || !croppedAreaPixels}
          >
            {saving ? "Saving…" : "Use backdrop"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
