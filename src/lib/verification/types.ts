/**
 * National Production Verification — shared types.
 * Embeddings and raw biometric material must never reach the frontend.
 */

export type FaceProviderId = "insightface" | "facenet" | "noop";

export type VerificationSessionStatus =
  | "started"
  | "sms_pending"
  | "selfie_pending"
  | "processing"
  | "auto_verified"
  | "manual_review"
  | "retry"
  | "approved"
  | "rejected"
  | "suspended"
  | "expired";

export type VerificationDecision =
  | "auto_verify"
  | "manual_review"
  | "retry"
  | "approve"
  | "reject"
  | "request_new_selfie"
  | "suspend";

export type VerificationReasonCode =
  | "ok"
  | "no_face"
  | "multiple_faces"
  | "liveness_failed"
  | "low_match"
  | "duplicate_face"
  | "duplicate_phone"
  | "duplicate_device"
  | "reported_user"
  | "provider_unavailable"
  | "rate_limited"
  | "invalid_image"
  | "sms_required"
  | "email_required"
  | "manual_override";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectedFace = {
  box: BoundingBox;
  confidence: number;
  landmarks?: Record<string, { x: number; y: number }>;
};

/** Server-only — never serialize to client responses. */
export type FaceEmbedding = {
  provider: FaceProviderId;
  modelVersion: string;
  /** Opaque float vector; keep in memory / encrypted store only. */
  vector: number[];
  dims: number;
};

export type CompareResult = {
  similarity: number;
  /** 0–100 confidence for product thresholds. */
  confidence: number;
  modelVersion: string;
};

export type ProviderVerifyInput = {
  selfieBytes: Uint8Array;
  selfieContentType: string;
  profilePhotoBytes: Uint8Array[];
  profileContentTypes: string[];
  livenessChallengeId?: string;
};

export type ProviderVerifyResult = {
  ok: boolean;
  provider: FaceProviderId;
  modelVersion: string;
  facesDetected: number;
  livenessPassed: boolean;
  matchConfidence: number;
  reasonCode: VerificationReasonCode;
  /** Server-only; strip before any HTTP response. */
  embedding?: FaceEmbedding;
};

export type RiskSignals = {
  emailVerified: boolean;
  smsVerified: boolean;
  livenessPassed: boolean;
  faceMatchConfidence: number;
  duplicatePhone: boolean;
  duplicateDevice: boolean;
  duplicateFace: boolean;
  accountAgeDays: number;
  reportCount: number;
};

export type RiskResult = {
  trustScore: number;
  decision: Extract<VerificationDecision, "auto_verify" | "manual_review" | "retry">;
  reasons: VerificationReasonCode[];
  breakdown: Record<string, number>;
};

export type VerificationThresholds = {
  autoVerifyMin: number;
  manualReviewMin: number;
};

export type PublicVerificationStatus = {
  sessionId: string;
  status: VerificationSessionStatus;
  decision?: VerificationDecision | null;
  trustScore?: number | null;
  confidence?: number | null;
  provider?: FaceProviderId | null;
  modelVersion?: string | null;
  reasonCodes?: VerificationReasonCode[];
  messagingUnlocked: boolean;
  updatedAt: string;
};
