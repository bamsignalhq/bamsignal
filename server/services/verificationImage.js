import { decodeBase64ImagePayload, PhotoStorageError } from "./photoStorage.js";

const MAX_VERIFICATION_SELFIE_BYTES = 6 * 1024 * 1024;

/**
 * Validate verification selfie payloads — same MIME/size rules as member photo uploads.
 */
export function validateVerificationImagePayload(dataUrl = "") {
  try {
    const { contentType, buffer } = decodeBase64ImagePayload(dataUrl);
    if (buffer.length > MAX_VERIFICATION_SELFIE_BYTES) {
      throw new PhotoStorageError("Verification image is too large. Try a smaller photo.", 400);
    }
    return { contentType, buffer, dataUrl: String(dataUrl).trim() };
  } catch (error) {
    if (error instanceof PhotoStorageError) throw error;
    throw new PhotoStorageError("Invalid verification image payload.", 400);
  }
}
