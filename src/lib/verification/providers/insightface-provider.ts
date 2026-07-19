/**
 * InsightFace provider — TypeScript contract mirror.
 * Runtime lives in server/lib/verification/providers/insightface-provider.js
 * and talks to an external InsightFace service via FACE_VERIFICATION_ENDPOINT.
 * Application code must never import InsightFace SDKs directly.
 */
import type { FaceVerificationProvider } from "../provider-interface";
import type { FaceProviderId } from "../types";

export const INSIGHTFACE_PROVIDER_ID: FaceProviderId = "insightface";

export type InsightFaceProviderOptions = {
  endpoint?: string;
  apiKey?: string;
  modelVersion?: string;
  timeoutMs?: number;
};

/** Marker type for DI / tests — instantiate only on the server. */
export type InsightFaceProvider = FaceVerificationProvider & {
  readonly id: "insightface";
};
