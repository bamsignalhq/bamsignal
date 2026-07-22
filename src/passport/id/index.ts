/**
 * Stankings Digital Trust Passport — identifier module.
 *
 * @see docs/architecture/PASSPORT_IDENTIFIER_STANDARD.md
 */

export {
  PASSPORT_PRODUCT_NAME,
  PASSPORT_ID_ALPHABET,
  normalizePassportId,
  formatPassportId,
  parsePassportId,
  isPassportId,
  isCanonicalPassportId,
  validatePassportId,
  isValidPassportSegment,
  buildPassportIdDisplay,
  getActiveIndividualPrefix,
  normalizePassportIdSegmentChar,
  type ParsedPassportId
} from "./format";

export {
  PASSPORT_PREFIX_REGISTRY,
  PASSPORT_PREFIX_SKL_MEANING,
  ACTIVE_INDIVIDUAL_PASSPORT_PREFIX,
  getPassportPrefixDefinition,
  listPassportPrefixes,
  isReservedPassportPrefix,
  isActivePassportPrefix,
  type PassportPrefixId,
  type PassportPrefixDefinition,
  type PassportPrefixStatus
} from "./prefixes";

export { generatePassportId, generateUniquePassportId } from "./generate";
export { resolvePassportId, getPassportIdForAnchor } from "./registry";
