declare module "../../shared/profanityFilter.mjs" {
  export const VULGAR_CONTENT_BLOCK_MESSAGE: string;
  export function scanTextForProfanity(text: string): { blocked: boolean };
  export function containsProfanity(text: string): boolean;
}

declare module "*/shared/profanityFilter.mjs" {
  export const VULGAR_CONTENT_BLOCK_MESSAGE: string;
  export function scanTextForProfanity(text: string): { blocked: boolean };
  export function containsProfanity(text: string): boolean;
}
