import { isImageModerationEnabled } from "../config/imageModeration";

export type PhotoUploadLogPayload = Record<string, unknown>;

export function logPhotoUpload(event: string, payload: PhotoUploadLogPayload = {}): void {
  const entry = {
    ts: new Date().toISOString(),
    moderationEnabled: isImageModerationEnabled(),
    ...payload
  };
  console.info(`[photo-upload] ${event}`, entry);
}
