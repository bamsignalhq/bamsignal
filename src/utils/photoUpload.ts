import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { isLikelyImageFile } from "./mediaModeration";
import { logPhotoUpload } from "./photoUploadLog";

const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.82;
const MIN_QUALITY = 0.78;
/** Target ~500–600KB raw before base64 inflation. */
const DEFAULT_MAX_BYTES = 580_000;
/** Hard limit after compression — ~1.2MB raw before base64. */
const HARD_MAX_BYTES = 1_200_000;

/** Gallery-friendly accept list for mobile WebViews (incl. HEIC). */
export const PHOTO_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/*";

export type CompressedImage = {
  blob: Blob;
  mime: string;
  extension: "webp" | "jpg";
};

export type PhotoFileValidation =
  | { ok: true }
  | { ok: false; code: PhotoUploadErrorCode; internalReason: string };

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

function isHeicLike(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || /\.heic$|\.heif$/.test(name);
}

export async function probeImageFile(file: File): Promise<{
  width: number;
  height: number;
  paint: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup: () => void;
}> {
  return decodeImageFile(file);
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
    } catch (error) {
      if (isHeicLike(file)) {
        throw new Error("HEIC_DECODE_UNSUPPORTED");
      }
      /* fall through to Image() */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(isHeicLike(file) ? "HEIC_DECODE_UNSUPPORTED" : "IMAGE_DECODE_FAILED"));
      el.src = url;
    });

    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      paint: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      cleanup: () => URL.revokeObjectURL(url)
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** Pre-upload validation — no moderation heuristics. */
export async function validatePhotoFile(file: File | null | undefined): Promise<PhotoFileValidation> {
  if (!file) {
    return { ok: false, code: "FILE_MISSING", internalReason: "no_file_selected" };
  }

  logPhotoUpload("validate_start", {
    fileType: file.type || "unknown",
    fileName: file.name || "",
    originalSize: file.size
  });

  if (!isLikelyImageFile(file)) {
    return {
      ok: false,
      code: "NOT_IMAGE",
      internalReason: `unsupported_type:${file.type || "empty"}`
    };
  }

  try {
    const decoded = await probeImageFile(file);
    try {
      if (!decoded.width || !decoded.height) {
        return { ok: false, code: "IMAGE_DECODE_FAILED", internalReason: "zero_dimensions" };
      }
      logPhotoUpload("validate_decode_ok", {
        width: decoded.width,
        height: decoded.height
      });
      return { ok: true };
    } finally {
      decoded.cleanup();
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logPhotoUpload("validate_decode_failed", { reason, heic: isHeicLike(file) });
    return {
      ok: false,
      code: "IMAGE_DECODE_FAILED",
      internalReason: reason
    };
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("COMPRESSION_FAILED"));
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

  logPhotoUpload("compress_start", {
    fileType: file.type || "unknown",
    originalSize: file.size,
    outputFormat: mime,
    maxEdge,
    maxBytes
  });

  const decoded = await decodeImageFile(file);
  try {
    if (!decoded.width || !decoded.height) {
      throw new Error("IMAGE_DECODE_FAILED");
    }

    const scale = Math.min(1, maxEdge / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("COMPRESSION_FAILED");

    decoded.paint(ctx, width, height);

    let blob = await canvasToBlob(canvas, mime, quality);
    while (blob.size > maxBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.04);
      blob = await canvasToBlob(canvas, mime, quality);
    }

    if (blob.size > HARD_MAX_BYTES) {
      throw new Error("COMPRESSION_FAILED_SIZE_LIMIT");
    }

    logPhotoUpload("compress_ok", {
      compressedSize: blob.size,
      outputFormat: mime,
      width,
      height,
      quality
    });

    return { blob, mime, extension };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logPhotoUpload("compress_failed", { reason });
    throw error;
  } finally {
    decoded.cleanup();
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("COMPRESSION_FAILED"));
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
    throw new Error("COMPRESSION_FAILED");
  }
  return dataUrl;
}
