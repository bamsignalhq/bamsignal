/** Introduction ID allocation — permanent, never reused. */

export const INTRODUCTION_ID_PREFIX = "BS-IN";

export function formatIntroductionId(year, sequence) {
  return `${INTRODUCTION_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidIntroductionId(value) {
  return /^BS-IN-\d{4}-\d{4}$/.test(value.trim().toUpperCase());
}

export function normalizeIntroductionId(value) {
  return value.trim().toUpperCase();
}

export function introductionIdYearFromDate(isoDate, fallbackYear = new Date().getFullYear()) {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}

export function createEmptyIntroductionRegistry(now = new Date().toISOString()) {
  return { byIntroductionId: {}, byRecordId: {}, yearSequence: {}, updatedAt: now };
}

export function assignIntroductionId(state, input) {
  const year = introductionIdYearFromDate(input.createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const introductionId = formatIntroductionId(year, nextSequence);

  if (state.byIntroductionId[introductionId]) {
    throw new Error(`Introduction ID already allocated: ${introductionId}`);
  }

  return {
    introductionId,
    state: {
      ...state,
      byIntroductionId: { ...state.byIntroductionId, [introductionId]: input.recordId },
      byRecordId: { ...state.byRecordId, [input.recordId]: introductionId },
      yearSequence: { ...state.yearSequence, [year]: nextSequence },
      updatedAt: new Date().toISOString()
    }
  };
}

export function registerExistingIntroductionId(state, input) {
  if (state.byIntroductionId[input.introductionId]) {
    return state;
  }
  const parsed = input.introductionId.match(/^BS-IN-(\d{4})-(\d{4})$/);
  const year = parsed ? Number(parsed[1]) : introductionIdYearFromDate(input.createdAt);
  const sequence = parsed ? Number(parsed[2]) : 1;
  return {
    ...state,
    byIntroductionId: { ...state.byIntroductionId, [input.introductionId]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: input.introductionId },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    },
    updatedAt: new Date().toISOString()
  };
}

export function getIntroductionIdForRecord(state, recordId) {
  return state.byRecordId[recordId] ?? null;
}
