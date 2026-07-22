/**
 * Passport ID format helpers — parse, format, normalize, validate.
 *
 * Canonical format: SKL-XXXX-XXXX (Crockford-style alphabet, no I/O/1/0).
 *
 * @see docs/architecture/PASSPORT_IDENTIFIER_STANDARD.md
 */

import { ACTIVE_INDIVIDUAL_PASSPORT_PREFIX, type PassportPrefixId } from "./prefixes";

/** Official product name — use in all public-facing UI and documentation. */
export const PASSPORT_PRODUCT_NAME = "Stankings Digital Trust Passport" as const;

/**
 * Reduced alphabet for generated IDs — excludes ambiguous I, O, 1, 0.
 * 32 characters → 32^8 ≈ 1.1 trillion identifier space per prefix.
 */
export const PASSPORT_ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ" as const;

const CANONICAL_SEGMENT = `[${PASSPORT_ID_ALPHABET}]{4}`;
const CANONICAL_PATTERN = new RegExp(
  `^SKL-${CANONICAL_SEGMENT}-${CANONICAL_SEGMENT}$`,
  "i"
);
const GENERIC_PATTERN = /^SKL-([0-9A-Z]{4})-([0-9A-Z]{4})$/i;

/** Crockford-style normalization map for human transcription errors. */
const NORMALIZE_CHAR: Record<string, string> = {
  "0": "O",
  "1": "I",
  I: "I",
  i: "I",
  L: "I",
  l: "I",
  O: "O",
  o: "O"
};

export type ParsedPassportId = {
  prefix: typeof ACTIVE_INDIVIDUAL_PASSPORT_PREFIX;
  segment1: string;
  segment2: string;
  /** Normalized uppercase display form. */
  formatted: string;
};

export function normalizePassportIdSegmentChar(char: string): string {
  return NORMALIZE_CHAR[char] ?? char.toUpperCase();
}

/**
 * Normalize a Passport ID for lookup and display.
 * Case-insensitive input; always returns uppercase when valid.
 */
export function normalizePassportId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, "").toUpperCase();
  const match = trimmed.match(GENERIC_PATTERN);
  if (!match) return null;

  const segment1 = match[1].split("").map(normalizePassportIdSegmentChar).join("");
  const segment2 = match[2].split("").map(normalizePassportIdSegmentChar).join("");
  const canonical = `${ACTIVE_INDIVIDUAL_PASSPORT_PREFIX}-${segment1}-${segment2}`;
  return CANONICAL_PATTERN.test(canonical) ? canonical : null;
}

export function formatPassportId(value: string | null | undefined): string | null {
  return normalizePassportId(value);
}

export function parsePassportId(value: string | null | undefined): ParsedPassportId | null {
  const formatted = normalizePassportId(value);
  if (!formatted) return null;
  const [, segment1, segment2] = formatted.match(/^SKL-([A-Z0-9]{4})-([A-Z0-9]{4})$/) ?? [];
  if (!segment1 || !segment2) return null;
  return {
    prefix: ACTIVE_INDIVIDUAL_PASSPORT_PREFIX,
    segment1,
    segment2,
    formatted
  };
}

export function isPassportId(value: string | null | undefined): value is string {
  if (!value) return false;
  return CANONICAL_PATTERN.test(value.trim());
}

/** Alias — individual Passport IDs use the SKL namespace exclusively in v1.0. */
export function isCanonicalPassportId(value: string | null | undefined): boolean {
  return isPassportId(value);
}

export function validatePassportId(value: string | null | undefined): {
  valid: boolean;
  formatted: string | null;
  error: string | null;
} {
  const formatted = normalizePassportId(value);
  if (!formatted) {
    return {
      valid: false,
      formatted: null,
      error: "Passport ID must match SKL-XXXX-XXXX."
    };
  }
  return { valid: true, formatted, error: null };
}

export function isValidPassportSegment(segment: string): boolean {
  if (segment.length !== 4) return false;
  return [...segment.toUpperCase()].every((c) => PASSPORT_ID_ALPHABET.includes(c));
}

export function buildPassportIdDisplay(
  prefix: PassportPrefixId,
  segment1: string,
  segment2: string
): string {
  return `${prefix.toUpperCase()}-${segment1.toUpperCase()}-${segment2.toUpperCase()}`;
}

export function getActiveIndividualPrefix(): typeof ACTIVE_INDIVIDUAL_PASSPORT_PREFIX {
  return ACTIVE_INDIVIDUAL_PASSPORT_PREFIX;
}
