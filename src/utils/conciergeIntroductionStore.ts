import { CONCIERGE_INTRODUCTION_SEED } from "../data/conciergeIntroductionSeed";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import { readJson, writeJson } from "./storage";

const INTRO_STORE_KEY = "bamsignal-concierge-introduction-store";

type IntroductionStore = {
  introductions: IntroductionRecord[];
  updatedAt: string;
};

function loadIntroductionStore(): IntroductionStore {
  const stored = readJson<IntroductionStore | null>(INTRO_STORE_KEY, null);
  if (stored?.introductions?.length) return stored;
  const initial: IntroductionStore = {
    introductions: CONCIERGE_INTRODUCTION_SEED,
    updatedAt: new Date().toISOString()
  };
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
  return listIntroductionRecords().find((record) => record.id === id) ?? null;
}

export function saveIntroductionRecord(record: IntroductionRecord): IntroductionRecord {
  const store = loadIntroductionStore();
  const index = store.introductions.findIndex((item) => item.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (index >= 0) store.introductions[index] = next;
  else store.introductions.unshift(next);
  saveIntroductionStore(store);
  return next;
}

export function upsertIntroductionRecords(records: IntroductionRecord[]): void {
  const store = loadIntroductionStore();
  for (const record of records) {
    const index = store.introductions.findIndex((item) => item.id === record.id);
    if (index >= 0) store.introductions[index] = record;
    else store.introductions.push(record);
  }
  saveIntroductionStore(store);
}
