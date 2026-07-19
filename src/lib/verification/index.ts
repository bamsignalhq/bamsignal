export type * from "./types";
export type { FaceVerificationProvider, FaceProviderFactory } from "./provider-interface";
export {
  DEFAULT_THRESHOLDS,
  computeTrustScore,
  resolveThresholds
} from "./risk-engine";
export { runBasicLivenessCheck } from "./liveness";
export type { LivenessInput, LivenessResult } from "./liveness";
export { INSIGHTFACE_PROVIDER_ID } from "./providers/insightface-provider";
export { FACENET_PROVIDER_ID } from "./providers/facenet-provider";
