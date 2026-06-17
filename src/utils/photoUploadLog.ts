import { getPhotoModerationMode, isImageModerationEnabled } from "../config/imageModeration";

export type PhotoUploadLogPayload = Record<string, unknown>;

/** Standard pipeline events for debugging upload failures (no secrets). */
export type PhotoUploadPipelineEvent =
  | "selected"
  | "decoded"
  | "compressed"
  | "uploading"
  | "uploaded"
  | "saved"
  | "failed"
  | "moderation_warn"
  | "moderation_blocked";

export function logPhotoUpload(event: string, payload: PhotoUploadLogPayload = {}): void {
  const entry = {
    ts: new Date().toISOString(),
    moderationEnabled: isImageModerationEnabled(),
    moderationMode: getPhotoModerationMode(),
    ...payload
  };
  console.info(`[photo-upload] ${event}`, entry);
}

export function logPhotoPipeline(
  event: PhotoUploadPipelineEvent,
  payload: PhotoUploadLogPayload = {}
): void {
  logPhotoUpload(event, payload);
}
