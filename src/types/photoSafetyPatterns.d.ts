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
