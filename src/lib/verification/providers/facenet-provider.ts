/**
 * FaceNet provider — TypeScript contract mirror.
 * Runtime: server/lib/verification/providers/facenet-provider.js
 */
import type { FaceVerificationProvider } from "../provider-interface";
import type { FaceProviderId } from "../types";

export const FACENET_PROVIDER_ID: FaceProviderId = "facenet";

export type FaceNetProviderOptions = {
  endpoint?: string;
  apiKey?: string;
  modelVersion?: string;
  timeoutMs?: number;
};

export type FaceNetProvider = FaceVerificationProvider & {
  readonly id: "facenet";
};
