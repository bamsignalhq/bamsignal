/** Permanent Signal Concierge Journey ID — BS-JR-YYYY-NNNN */

export const JOURNEY_ID_PREFIX = "BS-JR";
export const JOURNEY_ID_PATTERN = /^BS-JR-\d{4}-\d{4}$/;

export function formatJourneyId(year, sequence) {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error("Invalid journey ID year");
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 9999) {
    throw new Error("Invalid journey ID sequence");
  }
  return `${JOURNEY_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function parseJourneyId(value) {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-JR-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function isValidJourneyId(value) {
  return JOURNEY_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeJourneyId(value) {
  return value.trim().toUpperCase();
}

export function journeyIdYearFromDate(isoDate, fallbackYear = new Date().getFullYear()) {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
