/** Client constants — mirrors server/services/journeyId */

export const JOURNEY_ID_PREFIX = "BS-JR";
export const JOURNEY_ID_PATTERN = /^BS-JR-\d{4}-\d{4}$/;

export const JOURNEY_ID_LABEL = "Journey ID";
export const JOURNEY_ID_BRAND = "Signal Concierge™";

export function formatJourneyId(year: number, sequence: number): string {
  return `${JOURNEY_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidJourneyId(value: string): boolean {
  return JOURNEY_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeJourneyId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseJourneyId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-JR-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function journeyIdYearFromDate(isoDate: string, fallbackYear = new Date().getFullYear()): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
