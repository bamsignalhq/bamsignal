/**
 * Passport ID generation — cryptographically secure random SKL identifiers.
 */

import { PASSPORT_ID_ALPHABET, buildPassportIdDisplay } from "./format";
import { ACTIVE_INDIVIDUAL_PASSPORT_PREFIX, type PassportPrefixId } from "./prefixes";
import type { PassportId } from "../types";

function randomSegment(): string {
  const alphabet = PASSPORT_ID_ALPHABET;
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Generate a new Passport ID with the active individual prefix (SKL).
 * Uses cryptographically secure randomness and the reduced alphabet.
 */
export function generatePassportId(prefix: PassportPrefixId = ACTIVE_INDIVIDUAL_PASSPORT_PREFIX): PassportId {
  if (prefix !== ACTIVE_INDIVIDUAL_PASSPORT_PREFIX) {
    throw new Error(`Only ${ACTIVE_INDIVIDUAL_PASSPORT_PREFIX} Passport IDs may be generated in this release.`);
  }
  return buildPassportIdDisplay(prefix, randomSegment(), randomSegment());
}

/** Generate until the ID is not present in the provided set (collision guard). */
export function generateUniquePassportId(existingIds: Iterable<string>): PassportId {
  const taken = new Set([...existingIds].map((id) => id.toUpperCase()));
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const candidate = generatePassportId();
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error("Unable to generate a unique Passport ID after multiple attempts.");
}
