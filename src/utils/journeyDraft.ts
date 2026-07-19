import { STORAGE_KEYS } from "../constants/limits";
import { JOURNEY_SCREENS } from "../constants/journey";
import type { JourneyDraft, JourneyScreenId } from "../types/journey";
import { JOURNEY_DRAFT_VERSION } from "../types/journey";
import { readJson, writeJson } from "./storage";

const DEFAULT_SCREEN: JourneyScreenId = "j1-welcome";

export function emptyJourneyDraft(): JourneyDraft {
  return {
    version: JOURNEY_DRAFT_VERSION,
    screen: DEFAULT_SCREEN,
    updatedAt: new Date().toISOString()
  };
}

export function readJourneyDraft(): JourneyDraft | null {
  const raw = readJson<JourneyDraft | null>(STORAGE_KEYS.journeyDraft, null);
  if (!raw || raw.version !== JOURNEY_DRAFT_VERSION) return null;
  if (!JOURNEY_SCREENS.includes(raw.screen)) return null;
  return raw;
}

export function writeJourneyDraft(patch: Partial<JourneyDraft> & { screen?: JourneyScreenId }): JourneyDraft {
  const current = readJourneyDraft() ?? emptyJourneyDraft();
  const next: JourneyDraft = {
    ...current,
    ...patch,
    version: JOURNEY_DRAFT_VERSION,
    updatedAt: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.journeyDraft, next);
  return next;
}

export function clearJourneyDraft(): void {
  writeJson(STORAGE_KEYS.journeyDraft, null);
}

export function ageFromDateOfBirth(dob: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const born = new Date(year, month - 1, day);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1;
  return age;
}

export function maxDateOfBirthForMinAge(minAge: number): string {
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, "0");
  const day = String(cutoff.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function applyJourneyDraftToSignupForm(
  form: { name: string; username: string; phone: string; email: string; pin: string; confirmPin: string },
  draft: JourneyDraft | null
) {
  if (!draft?.name?.trim()) return form;
  if (form.name.trim()) return form;
  return { ...form, name: draft.name.trim() };
}

export function mergeJourneyDraftIntoDatingProfile<T extends Record<string, unknown>>(
  profile: T,
  draft: JourneyDraft | null
): T {
  if (!draft) return profile;
  const age = draft.dateOfBirth ? ageFromDateOfBirth(draft.dateOfBirth) : null;
  return {
    ...profile,
    ...(draft.dateOfBirth ? { dateOfBirth: draft.dateOfBirth, age: age ?? profile.age } : {}),
    ...(draft.gender ? { gender: draft.gender } : {}),
    ...(draft.lookingFor
      ? { lookingFor: draft.lookingFor, interestedInManuallyChanged: true }
      : {}),
    ...(draft.state ? { state: draft.state } : {}),
    ...(draft.city ? { city: draft.city } : {})
  };
}
