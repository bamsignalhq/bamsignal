/** Permanent Consultation Meeting IDs — BS-CN-YYYY-#### */

export const CONSULTATION_MEETING_ID_PREFIX = "BS-CN";
export const CONSULTATION_MEETING_ID_PATTERN = /^BS-CN-\d{4}-\d{4}$/;

export const CONSULTATION_MEETING_ID_LABEL = "Meeting ID";

export function formatConsultationMeetingId(year: number, sequence: number): string {
  return `${CONSULTATION_MEETING_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidConsultationMeetingId(value: string): boolean {
  return CONSULTATION_MEETING_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeConsultationMeetingId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseConsultationMeetingId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-CN-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function consultationMeetingIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
