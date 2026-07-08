import { Camera, CameraDirection, CameraResultType, CameraSource } from "@capacitor/camera";
import { isNativeApp } from "./platform";
import { queueUploadRetry } from "./backgroundSync";

async function uriToFile(uri: string, filename: string): Promise<File | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const type = blob.type || "image/jpeg";
    return new File([blob], filename, { type });
  } catch {
    return null;
  }
}

async function compressImageFile(file: File, maxEdge = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 350_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type NativePhotoPickResult =
  | { ok: true; files: File[] }
  | { ok: false; cancelled?: boolean; message?: string };

export async function pickNativeGalleryPhotos(limit: number): Promise<NativePhotoPickResult> {
  if (!isNativeApp() || limit < 1) return { ok: false, message: "Native gallery unavailable" };

  try {
    const result = await Camera.pickImages({
      quality: 85,
      limit: Math.max(1, limit),
      correctOrientation: true
    });

    const files: File[] = [];
    for (let index = 0; index < result.photos.length; index += 1) {
      const photo = result.photos[index];
      const path = photo.webPath || photo.path;
      if (!path) continue;
      const raw = await uriToFile(path, `gallery-${Date.now()}-${index}.jpg`);
      if (raw) files.push(await compressImageFile(raw));
    }

    if (!files.length) return { ok: false, message: "No photos selected" };
    return { ok: true, files };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/cancel/i.test(message) || /User cancelled/i.test(message)) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, message };
  }
}

export async function captureNativePhoto(options?: {
  frontCamera?: boolean;
  allowEditing?: boolean;
}): Promise<NativePhotoPickResult> {
  if (!isNativeApp()) return { ok: false, message: "Native camera unavailable" };

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: options?.allowEditing ?? true,
      correctOrientation: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      direction: options?.frontCamera ? CameraDirection.Front : CameraDirection.Rear,
      saveToGallery: false
    });

    const path = photo.webPath || photo.path;
    if (!path) return { ok: false, message: "Camera returned no image" };
    const raw = await uriToFile(path, `camera-${Date.now()}.jpg`);
    if (!raw) return { ok: false, message: "Could not read camera image" };
    const file = await compressImageFile(raw);
    return { ok: true, files: [file] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/cancel/i.test(message) || /User cancelled/i.test(message)) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, message };
  }
}

export async function requestCameraPermission(): Promise<boolean> {
  if (!isNativeApp()) return true;
  const status = await Camera.requestPermissions({ permissions: ["camera", "photos"] });
  return status.camera === "granted" || status.camera === "limited";
}

export function queueNativeUploadRetry(id: string, run: () => Promise<void>) {
  queueUploadRetry(id, run);
}

export function nativeMediaActionsAvailable(): boolean {
  return isNativeApp();
}
