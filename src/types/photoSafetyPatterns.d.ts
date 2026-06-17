declare module "../../shared/photoSafetyPatterns.mjs" {
  export function containsDocumentKeywords(text: string): boolean;
  export function containsImageUrlLeak(text: string): boolean;
  export function containsNigerianPhoneInText(text: string): boolean;
  export function scanPhotoSafetyText(
    text: string,
    options?: { allowDocuments?: boolean }
  ): { blocked: boolean; category: "document_detected" | "contact_information" | null };
}

declare module "*/shared/photoSafetyPatterns.mjs" {
  export function containsDocumentKeywords(text: string): boolean;
  export function containsImageUrlLeak(text: string): boolean;
  export function containsNigerianPhoneInText(text: string): boolean;
  export function scanPhotoSafetyText(
    text: string,
    options?: { allowDocuments?: boolean }
  ): { blocked: boolean; category: "document_detected" | "contact_information" | null };
}

type PhotoAssessResult = {
  hardBlock: boolean;
  hardBlockCategory: string | null;
  pendingReview: boolean;
  riskFlags: string[];
  riskScore: number;
};

declare module "../../shared/photoQualityScore.mjs" {
  export const PHOTO_RISK_WEIGHTS: Record<string, number>;
  export const PHOTO_RISK_REJECT_THRESHOLD: number;
  export const MIN_LARGEST_FACE_AREA_RATIO: number;
  export const MIN_TOTAL_FACE_AREA_RATIO: number;
  export const LOGO_LIKELIHOOD_THRESHOLD: number;
  export const TEXT_HEAVY_DENSITY: number;
  export const TEXT_HEAVY_RISK_DENSITY: number;
  export function containsBusinessFlyerText(text: string): boolean;
  export function shouldRejectByRiskScore(score: number): boolean;
  export function addRisk(score: number, key: string): number;
  export function faceAreaPassesProfileCheck(largestRatio: number, totalRatio: number): boolean;
  export function classifyProfileRisk(input: {
    hasAdequateFace: boolean;
    logoLikelihood: number;
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
  }): { reject: boolean; category: string; riskScore: number };
  export function classifyCoverRisk(input: {
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    hasFlyerText: boolean;
  }): { reject: boolean; category: string; riskScore: number };
  export function assessProfilePhoto(input: {
    hasAdequateFace: boolean;
    logoLikelihood: number;
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    ocrText?: string;
  }): PhotoAssessResult;
  export function assessCoverPhoto(input: {
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    hasFlyerText: boolean;
  }): PhotoAssessResult;
}

declare module "*/shared/photoQualityScore.mjs" {
  export const PHOTO_RISK_WEIGHTS: Record<string, number>;
  export const PHOTO_RISK_REJECT_THRESHOLD: number;
  export const MIN_LARGEST_FACE_AREA_RATIO: number;
  export const MIN_TOTAL_FACE_AREA_RATIO: number;
  export const LOGO_LIKELIHOOD_THRESHOLD: number;
  export const TEXT_HEAVY_DENSITY: number;
  export const TEXT_HEAVY_RISK_DENSITY: number;
  export function containsBusinessFlyerText(text: string): boolean;
  export function shouldRejectByRiskScore(score: number): boolean;
  export function addRisk(score: number, key: string): number;
  export function faceAreaPassesProfileCheck(largestRatio: number, totalRatio: number): boolean;
  export function classifyProfileRisk(input: {
    hasAdequateFace: boolean;
    logoLikelihood: number;
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
  }): { reject: boolean; category: string; riskScore: number };
  export function classifyCoverRisk(input: {
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    hasFlyerText: boolean;
  }): { reject: boolean; category: string; riskScore: number };
  export function assessProfilePhoto(input: {
    hasAdequateFace: boolean;
    logoLikelihood: number;
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    ocrText?: string;
  }): PhotoAssessResult;
  export function assessCoverPhoto(input: {
    textDensity: number;
    hasQr: boolean;
    hasDocumentKeywords: boolean;
    hasContactLeak: boolean;
    hasFlyerText: boolean;
  }): PhotoAssessResult;
}

declare module "../../shared/photoReview.mjs" {
  export function filterPhotosForPublicView(
    photos: string[],
    photoMeta?: Record<string, { photoReviewStatus?: string }>
  ): string[];
  export function isPhotoCountableForSignup(
    url: string,
    photoMeta?: Record<string, { photoReviewStatus?: string }>
  ): boolean;
  export function normalizePhotoMetaMap(raw: unknown): Record<string, unknown>;
}

declare module "*/shared/photoReview.mjs" {
  export function filterPhotosForPublicView(
    photos: string[],
    photoMeta?: Record<string, { photoReviewStatus?: string }>
  ): string[];
  export function isPhotoCountableForSignup(
    url: string,
    photoMeta?: Record<string, { photoReviewStatus?: string }>
  ): boolean;
  export function normalizePhotoMetaMap(raw: unknown): Record<string, unknown>;
}
