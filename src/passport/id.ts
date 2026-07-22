/**
 * Passport ID — re-export barrel for existing imports from `./id`.
 *
 * @see docs/architecture/PASSPORT_IDENTIFIER_STANDARD.md
 */

export {
  PASSPORT_PRODUCT_NAME,
  PASSPORT_ID_ALPHABET,
  PASSPORT_PREFIX_REGISTRY,
  PASSPORT_PREFIX_SKL_MEANING,
  ACTIVE_INDIVIDUAL_PASSPORT_PREFIX,
  generatePassportId,
  generateUniquePassportId,
  resolvePassportId,
  getPassportIdForAnchor,
  normalizePassportId,
  formatPassportId,
  parsePassportId,
  isPassportId,
  isCanonicalPassportId,
  validatePassportId,
  isValidPassportSegment,
  buildPassportIdDisplay,
  getActiveIndividualPrefix,
  getPassportPrefixDefinition,
  listPassportPrefixes,
  isReservedPassportPrefix,
  isActivePassportPrefix
} from "./id/index";

export type {
  ParsedPassportId,
  PassportPrefixId,
  PassportPrefixDefinition,
  PassportPrefixStatus
} from "./id/index";
