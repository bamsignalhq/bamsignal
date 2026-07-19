import { createInsightFaceProvider } from "./insightface-provider.js";
import { createFaceNetProvider } from "./facenet-provider.js";
import { createNoopProvider } from "./noop-provider.js";

let cached = null;
let cachedId = null;

/**
 * Factory — only place that selects a concrete face provider.
 * Application / API code must call this, never InsightFace/FaceNet constructors.
 */
export function getFaceProvider(providerId = process.env.FACE_VERIFICATION_PROVIDER || "insightface") {
  const id = String(providerId || "insightface").trim().toLowerCase();
  if (cached && cachedId === id) return cached;

  if (id === "facenet") {
    cached = createFaceNetProvider();
  } else if (id === "noop" || id === "stub" || id === "none") {
    cached = createNoopProvider();
  } else {
    cached = createInsightFaceProvider();
  }
  cachedId = cached.id;
  return cached;
}

export function resetFaceProviderCache() {
  cached = null;
  cachedId = null;
}
