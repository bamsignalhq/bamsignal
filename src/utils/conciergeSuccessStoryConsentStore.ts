import { STORAGE_KEYS } from "../constants/limits";
import type { SuccessStoryConsentRecord } from "../types/conciergeSuccessStoryConsent";
import {
  applyPartyApproval,
  assertConsentHistoryAppendOnly,
  canPublishSuccessStory,
  createDefaultSuccessStoryConsent,
  updateConsentPermissions,
  withdrawSuccessStoryConsent
} from "./successStoryConsentLogic";
import type { SuccessStoryConsentPermissions } from "../types/conciergeSuccessStoryConsent";
import { readJson, writeJson } from "./storage";

type SuccessStoryConsentStore = {
  byJourneyId: Record<string, SuccessStoryConsentRecord>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeSuccessStoryConsent;

function loadStore(): SuccessStoryConsentStore {
  return readJson<SuccessStoryConsentStore>(STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: SuccessStoryConsentStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function persistConsent(consent: SuccessStoryConsentRecord): SuccessStoryConsentRecord {
  const store = loadStore();
  const previous = store.byJourneyId[consent.journeyId];
  if (previous) {
    assertConsentHistoryAppendOnly(previous, consent);
  }
  saveStore({
    ...store,
    byJourneyId: { ...store.byJourneyId, [consent.journeyId]: consent }
  });
  return consent;
}

export function getSuccessStoryConsent(journeyId: string): SuccessStoryConsentRecord | null {
  return loadStore().byJourneyId[journeyId] ?? null;
}

export function ensureSuccessStoryConsent(input: {
  journeyId: string;
  memberAId: string;
  memberBId: string;
  memberAName: string;
  memberBName: string;
}): SuccessStoryConsentRecord {
  const existing = getSuccessStoryConsent(input.journeyId);
  if (existing) return existing;
  return persistConsent(createDefaultSuccessStoryConsent(input));
}

export function listSuccessStoryConsents(): SuccessStoryConsentRecord[] {
  return Object.values(loadStore().byJourneyId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function saveSuccessStoryConsentPermissions(
  journeyId: string,
  permissions: Partial<SuccessStoryConsentPermissions>,
  approvedBy: string
): SuccessStoryConsentRecord | null {
  const consent = getSuccessStoryConsent(journeyId);
  if (!consent) return null;
  return persistConsent(updateConsentPermissions(consent, permissions, approvedBy));
}

export function approveSuccessStoryConsentParty(
  journeyId: string,
  input: { memberId: string; memberName: string }
): SuccessStoryConsentRecord | null {
  const consent = getSuccessStoryConsent(journeyId);
  if (!consent) return null;
  return persistConsent(applyPartyApproval(consent, input));
}

export function withdrawSuccessStoryConsentByJourney(
  journeyId: string,
  input: { memberId: string; approvedBy: string }
): SuccessStoryConsentRecord | null {
  const consent = getSuccessStoryConsent(journeyId);
  if (!consent) return null;
  return persistConsent(withdrawSuccessStoryConsent(consent, input));
}

export function bootstrapSuccessStoryConsentSeeds(
  seeds: SuccessStoryConsentRecord[]
): void {
  const store = loadStore();
  if (Object.keys(store.byJourneyId).length) return;
  const byJourneyId = { ...store.byJourneyId };
  for (const seed of seeds) {
    byJourneyId[seed.journeyId] = seed;
  }
  saveStore({ ...store, byJourneyId });
}

export function resetSuccessStoryConsentStoreForTests(): void {
  writeJson(STORE_KEY, { byJourneyId: {}, updatedAt: new Date().toISOString() });
}

export { canPublishSuccessStory, createDefaultSuccessStoryConsent };
