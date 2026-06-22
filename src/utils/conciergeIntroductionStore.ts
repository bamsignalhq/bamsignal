import { CONCIERGE_INTRODUCTION_SEED } from "../data/conciergeIntroductionSeed";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import { registerExistingIntroductionId } from "./introductionIdRegistry";
import {
  assertIntroductionHistoryIntegrity,
  assertNoDuplicateIntroduction,
  normalizeIntroductionRecord
} from "./introductionEngineLogic";
import { readJson, writeJson } from "./storage";

const INTRO_STORE_KEY = "bamsignal-concierge-introduction-store";

type IntroductionStore = {
  introductions: IntroductionRecord[];
  updatedAt: string;
};

function seedRegistry(records: IntroductionRecord[]): void {
  for (const record of records) {
    if (record.introductionId) {
      registerExistingIntroductionId({
        recordId: record.id,
        introductionId: record.introductionId,
        createdAt: record.createdAt
      });
    }
  }
}

function loadIntroductionStore(): IntroductionStore {
  const stored = readJson<IntroductionStore | null>(INTRO_STORE_KEY, null);
  if (stored?.introductions?.length) {
    return {
      ...stored,
      introductions: stored.introductions.map((record) => normalizeIntroductionRecord(record))
    };
  }
  const initial: IntroductionStore = {
    introductions: CONCIERGE_INTRODUCTION_SEED.map((record) => normalizeIntroductionRecord(record)),
    updatedAt: new Date().toISOString()
  };
  seedRegistry(initial.introductions);
  writeJson(INTRO_STORE_KEY, initial);
  return initial;
}

function saveIntroductionStore(store: IntroductionStore): void {
  writeJson(INTRO_STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function listIntroductionRecords(): IntroductionRecord[] {
  return loadIntroductionStore().introductions;
}

export function getIntroductionRecord(id: string): IntroductionRecord | null {
  return (
    listIntroductionRecords().find((record) => record.id === id || record.introductionId === id) ?? null
  );
}

export function saveIntroductionRecord(record: IntroductionRecord): IntroductionRecord {
  const store = loadIntroductionStore();
  const normalized = normalizeIntroductionRecord(record);
  const index = store.introductions.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    assertIntroductionHistoryIntegrity(store.introductions[index], normalized);
  } else {
    assertNoDuplicateIntroduction(
      store.introductions,
      normalized.memberAId,
      normalized.memberBId
    );
  }

  const next = { ...normalized, updatedAt: new Date().toISOString() };
  if (index >= 0) store.introductions[index] = next;
  else store.introductions.unshift(next);
  saveIntroductionStore(store);
  return next;
}

export function upsertIntroductionRecords(records: IntroductionRecord[]): void {
  const store = loadIntroductionStore();
  for (const record of records) {
    const normalized = normalizeIntroductionRecord(record);
    const index = store.introductions.findIndex((item) => item.id === normalized.id);
    if (index >= 0) store.introductions[index] = normalized;
    else store.introductions.push(normalized);
  }
  saveIntroductionStore(store);
  seedRegistry(records);
}
