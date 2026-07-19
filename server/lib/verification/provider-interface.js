/**
 * @typedef {import('./types.js').FaceProviderId} FaceProviderId
 * @typedef {import('./types.js').DetectedFace} DetectedFace
 * @typedef {import('./types.js').FaceEmbedding} FaceEmbedding
 * @typedef {import('./types.js').CompareResult} CompareResult
 * @typedef {import('./types.js').ProviderVerifyInput} ProviderVerifyInput
 * @typedef {import('./types.js').ProviderVerifyResult} ProviderVerifyResult
 */

/**
 * @typedef {object} FaceVerificationProvider
 * @property {FaceProviderId} id
 * @property {string} modelVersion
 * @property {() => Promise<void>} initialize
 * @property {(imageBytes: Uint8Array, contentType: string) => Promise<DetectedFace[]>} detectFace
 * @property {(imageBytes: Uint8Array, contentType: string) => Promise<FaceEmbedding|null>} extractEmbedding
 * @property {(a: FaceEmbedding, b: FaceEmbedding) => Promise<CompareResult>} compare
 * @property {(input: ProviderVerifyInput) => Promise<ProviderVerifyResult>} verify
 */

export {};
