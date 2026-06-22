/** Permanent Operation IDs — BS-OP-YYYY-#### */

export const OPERATION_ID_PREFIX = "BS-OP";
export const OPERATION_ID_PATTERN = /^BS-OP-\d{4}-\d{4}$/;

export const OPERATION_ID_LABEL = "Operation ID";

export function formatOperationId(year: number, sequence: number): string {
  return `${OPERATION_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidOperationId(value: string): boolean {
  return OPERATION_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeOperationId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseOperationId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-OP-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function operationIdYearFromDate(isoDate: string, fallbackYear = new Date().getFullYear()): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
