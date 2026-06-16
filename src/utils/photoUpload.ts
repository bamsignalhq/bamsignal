/** User-facing message for any gallery/cover upload failure. */
export { PHOTO_UPLOAD_FAIL } from "../constants/photos";

const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.82;
/** Target ~600KB raw JPEG before base64 inflation. */
const DEFAULT_MAX_BYTES = 600_000;

async function decodeImageFile(file: File): Promise<{
  width: number;
  height: number;
  paint: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        paint: (ctx, w, h) => {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close?.();
        },
        cleanup: () => bitmap.close?.()
      };
    } catch {
      /* fall through to Image() */
    }
  }

  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Image decode failed"));
    el.src = url;
  });

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    paint: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    cleanup: () => URL.revokeObjectURL(url)
  };
}

/** Resize and compress a picked image to a JPEG data URL safe for localStorage + API sync. */
export async function fileToCompressedDataUrl(
  file: File,
  opts: { maxEdge?: number; quality?: number; maxBytes?: number } = {}
): Promise<string> {
  const maxEdge = opts.maxEdge ?? DEFAULT_MAX_EDGE;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  let quality = opts.quality ?? DEFAULT_QUALITY;

  const decoded = await decodeImageFile(file);
  try {
    if (!decoded.width || !decoded.height) {
      throw new Error("Invalid image dimensions");
    }

    const scale = Math.min(1, maxEdge / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    decoded.paint(ctx, width, height);

    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (((dataUrl.length * 3) / 4) > maxBytes && quality > 0.5) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    if (!dataUrl.startsWith("data:image/")) {
      throw new Error("Compression failed");
    }

    return dataUrl;
  } finally {
    decoded.cleanup();
  }
}
