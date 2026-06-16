/** User-facing message for any gallery/cover upload failure. */
export { PHOTO_UPLOAD_FAIL } from "../constants/photos";

const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.82;
const MIN_QUALITY = 0.78;
/** Target ~500–600KB raw before base64 inflation. */
const DEFAULT_MAX_BYTES = 580_000;

export type CompressedImage = {
  blob: Blob;
  mime: string;
  extension: "webp" | "jpg";
};

let webPSupported: boolean | null = null;

export function browserSupportsWebP(): boolean {
  if (webPSupported !== null) return webPSupported;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webPSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webPSupported = false;
  }
  return webPSupported;
}

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

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Compression failed"));
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

/** Resize and compress a picked image to WebP (or JPEG fallback) for object storage upload. */
export async function fileToCompressedImageBlob(
  file: File,
  opts: { maxEdge?: number; quality?: number; maxBytes?: number } = {}
): Promise<CompressedImage> {
  const maxEdge = opts.maxEdge ?? DEFAULT_MAX_EDGE;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  let quality = opts.quality ?? DEFAULT_QUALITY;
  const useWebP = browserSupportsWebP();
  const mime = useWebP ? "image/webp" : "image/jpeg";
  const extension = useWebP ? "webp" : "jpg";

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

    let blob = await canvasToBlob(canvas, mime, quality);
    while (blob.size > maxBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.04);
      blob = await canvasToBlob(canvas, mime, quality);
    }

    if (blob.size > maxBytes * 1.25) {
      throw new Error("Image is still too large after compression");
    }

    return { blob, mime, extension };
  } finally {
    decoded.cleanup();
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read compressed image"));
    reader.readAsDataURL(blob);
  });
}

/** Emergency/offline fallback — compressed data URL (not for long-term storage). */
export async function fileToCompressedDataUrl(
  file: File,
  opts: { maxEdge?: number; quality?: number; maxBytes?: number } = {}
): Promise<string> {
  const { blob } = await fileToCompressedImageBlob(file, opts);
  const dataUrl = await blobToDataUrl(blob);
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Compression failed");
  }
  return dataUrl;
}
