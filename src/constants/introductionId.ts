/** Permanent Introduction IDs — BS-IN-YYYY-#### */

export const INTRODUCTION_ID_PREFIX = "BS-IN";
export const INTRODUCTION_ID_PATTERN = /^BS-IN-\d{4}-\d{4}$/;

export const INTRODUCTION_ID_LABEL = "Introduction ID";

export function formatIntroductionId(year: number, sequence: number): string {
  return `${INTRODUCTION_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidIntroductionId(value: string): boolean {
  return INTRODUCTION_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeIntroductionId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseIntroductionId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-IN-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function introductionIdYearFromDate(isoDate: string, fallbackYear = new Date().getFullYear()): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
