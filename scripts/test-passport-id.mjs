/**
 * Passport ID regression — SKL format, validation, normalization (spec mirror).
 * Keep in sync with src/passport/id/format.ts.
 */

const PASSPORT_ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CANONICAL_SEGMENT = `[${PASSPORT_ID_ALPHABET}]{4}`;
const CANONICAL_PATTERN = new RegExp(`^SKL-${CANONICAL_SEGMENT}-${CANONICAL_SEGMENT}$`, "i");
const GENERIC_PATTERN = /^SKL-([0-9A-Z]{4})-([0-9A-Z]{4})$/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPassportId(value) {
  return Boolean(value && CANONICAL_PATTERN.test(value.trim()));
}

function normalizePassportId(value) {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, "").toUpperCase();
  const match = trimmed.match(GENERIC_PATTERN);
  if (!match) return null;
  const canonical = `SKL-${match[1]}-${match[2]}`;
  return CANONICAL_PATTERN.test(canonical) ? canonical : null;
}

assert("Stankings Legacy" === "Stankings Legacy", "SKL = Stankings Legacy");

const sample = "SKL-4A7D-9XQ2";
assert(isPassportId(sample), "canonical SKL ID accepted");
assert(!isPassportId("STP-8K4D-72QX"), "retired STP prefix rejected");
assert(!isPassportId("SKL-4A7I-9XQ2"), "I excluded from canonical segments");
assert(!isPassportId("ABC-1234-5678"), "unknown prefix rejected");

assert(normalizePassportId(" skl-4a7d-9xq2 ") === "SKL-4A7D-9XQ2", "normalize uppercases SKL");

const parsed = normalizePassportId("SKL-4A7D-9XQ2")?.split("-");
assert(parsed?.[0] === "SKL" && parsed[1] === "4A7D", "parse segments");

assert([..."4A7D"].every((c) => PASSPORT_ID_ALPHABET.includes(c)), "valid canonical segment");
assert(![..."4A7I"].every((c) => PASSPORT_ID_ALPHABET.includes(c)), "I invalid in canonical segment");

console.log("passport-id ok");
