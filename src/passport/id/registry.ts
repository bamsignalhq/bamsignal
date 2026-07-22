/**
 * Passport ID registry — immutable anchor → Passport ID assignment.
 */

import { generateUniquePassportId } from "./generate";
import { isPassportId } from "./format";
import type { PassportId } from "../types";

const PASSPORT_ID_REGISTRY_KEY = "stankings-passport-id-registry-v1";

/** Dev-era provisional prefix — upgraded to SKL on next bind. */
const DEV_PROVISIONAL_STP_PATTERN = /^STP-/i;

type PassportIdRecord = {
  passportId: PassportId;
  createdAt: string;
};

function readRegistry(): Record<string, PassportIdRecord> {
  try {
    const raw = localStorage.getItem(PASSPORT_ID_REGISTRY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PassportIdRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRegistry(registry: Record<string, PassportIdRecord>): void {
  try {
    localStorage.setItem(PASSPORT_ID_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    /* ignore quota */
  }
}

function listAssignedPassportIds(registry: Record<string, PassportIdRecord>): string[] {
  return Object.values(registry)
    .map((record) => record.passportId)
    .filter((id): id is PassportId => isPassportId(id));
}

function assignPassportId(
  registry: Record<string, PassportIdRecord>,
  recordKey: string,
  createdAt?: string
): PassportId {
  const passportId = generateUniquePassportId(listAssignedPassportIds(registry));
  registry[recordKey] = {
    passportId,
    createdAt: createdAt ?? new Date().toISOString()
  };
  writeRegistry(registry);
  return passportId;
}

/**
 * Resolve or assign Passport ID for an identity anchor.
 * Once assigned, the ID never changes for that anchor.
 * New assignments receive SKL-XXXX-XXXX.
 */
export function resolvePassportId(anchor: string): PassportId {
  const key = anchor.trim().toLowerCase();
  const registry = readRegistry();

  if (key) {
    const existing = registry[key];
    if (existing?.passportId) {
      if (isPassportId(existing.passportId)) {
        return existing.passportId;
      }
      // One-time dev migration: provisional STP-* → canonical SKL-*
      if (DEV_PROVISIONAL_STP_PATTERN.test(existing.passportId)) {
        return assignPassportId(registry, key, existing.createdAt);
      }
    }
  }

  const recordKey = key || `anonymous:${Date.now()}`;
  return assignPassportId(registry, recordKey);
}

export function getPassportIdForAnchor(anchor: string): PassportId | null {
  const key = anchor.trim().toLowerCase();
  const existing = readRegistry()[key]?.passportId;
  return existing && isPassportId(existing) ? existing : null;
}
