/**
 * Face Verification Provider Interface.
 * Application code must only call through this contract — never InsightFace/FaceNet APIs directly.
 */
import type {
  CompareResult,
  DetectedFace,
  FaceEmbedding,
  FaceProviderId,
  ProviderVerifyInput,
  ProviderVerifyResult
} from "./types";

export interface FaceVerificationProvider {
  readonly id: FaceProviderId;
  readonly modelVersion: string;

  initialize(): Promise<void>;

  detectFace(imageBytes: Uint8Array, contentType: string): Promise<DetectedFace[]>;

  extractEmbedding(imageBytes: Uint8Array, contentType: string): Promise<FaceEmbedding | null>;

  compare(a: FaceEmbedding, b: FaceEmbedding): Promise<CompareResult>;

  verify(input: ProviderVerifyInput): Promise<ProviderVerifyResult>;
}

export type FaceProviderFactory = () => FaceVerificationProvider;
