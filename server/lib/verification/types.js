/** @typedef {'insightface'|'facenet'|'noop'} FaceProviderId */
/** @typedef {'started'|'sms_pending'|'selfie_pending'|'processing'|'auto_verified'|'manual_review'|'retry'|'approved'|'rejected'|'suspended'|'expired'} VerificationSessionStatus */

/**
 * @typedef {object} FaceEmbedding
 * @property {FaceProviderId} provider
 * @property {string} modelVersion
 * @property {number[]} vector
 * @property {number} dims
 */

/**
 * @typedef {object} ProviderVerifyResult
 * @property {boolean} ok
 * @property {FaceProviderId} provider
 * @property {string} modelVersion
 * @property {number} facesDetected
 * @property {boolean} livenessPassed
 * @property {number} matchConfidence
 * @property {string} reasonCode
 * @property {FaceEmbedding} [embedding]
 */

export {};
