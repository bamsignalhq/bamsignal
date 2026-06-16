import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "./storage";

const SIGNAL_BURST_WINDOW_MS = 60_000;
const SIGNAL_BURST_LIMIT = 50;
const DUPLICATE_MESSAGE_LIMIT = 5;

type SignalEvent = { at: number };
type MessageFingerprint = { body: string; targets: string[]; at: number };

const signalBurstKey = "bamsignal-signal-burst";
const messageFingerprintsKey = "bamsignal-message-fingerprints";
const viewBurstKey = "bamsignal-view-burst";

export type SuspicionEvent =
  | { reason: "signal_burst"; count: number }
  | { reason: "duplicate_message"; count: number }
  | { reason: "profile_view_burst"; count: number }
  | { reason: "report_threshold"; count: number }
  | { reason: "off_platform_pattern" };

function pruneTimestamps(events: number[], windowMs: number, now = Date.now()): number[] {
  return events.filter((t) => now - t <= windowMs);
}

export function checkSignalBurst(): SuspicionEvent | null {
  const now = Date.now();
  const events = pruneTimestamps(readJson<number[]>(signalBurstKey, []), SIGNAL_BURST_WINDOW_MS, now);
  events.push(now);
  localStorage.setItem(signalBurstKey, JSON.stringify(events));
  if (events.length >= SIGNAL_BURST_LIMIT) {
    return { reason: "signal_burst", count: events.length };
  }
  return null;
}

export function checkDuplicateMessage(body: string, targetProfileId: string): SuspicionEvent | null {
  const normalized = body.trim().toLowerCase();
  if (normalized.length < 8) return null;

  const fingerprints = readJson<MessageFingerprint[]>(messageFingerprintsKey, []);
  const existing = fingerprints.find((f) => f.body === normalized);
  const targets = existing ? Array.from(new Set([...existing.targets, targetProfileId])) : [targetProfileId];

  const next = [
    { body: normalized, targets, at: Date.now() },
    ...fingerprints.filter((f) => f.body !== normalized)
  ].slice(0, 30);
  localStorage.setItem(messageFingerprintsKey, JSON.stringify(next));

  if (targets.length >= DUPLICATE_MESSAGE_LIMIT) {
    return { reason: "duplicate_message", count: targets.length };
  }
  return null;
}

export function checkProfileViewBurst(): SuspicionEvent | null {
  const now = Date.now();
  const windowMs = 5 * 60_000;
  const limit = 40;
  const events = pruneTimestamps(readJson<number[]>(viewBurstKey, []), windowMs, now);
  events.push(now);
  localStorage.setItem(viewBurstKey, JSON.stringify(events));
  if (events.length >= limit) {
    return { reason: "profile_view_burst", count: events.length };
  }
  return null;
}

export function checkReportThreshold(profileId: string): SuspicionEvent | null {
  const reports = readJson<{ profileId: string }[]>(STORAGE_KEYS.reports, []);
  const count = reports.filter((r) => r.profileId === profileId).length;
  if (count >= 3) return { reason: "report_threshold", count };
  return null;
}

const OFF_PLATFORM_RE =
  /whatsapp|telegram|instagram|snapchat|facebook|call me on|send money|bank account|crypto|usdt|btc/i;

export function checkOffPlatformMessage(body: string): SuspicionEvent | null {
  if (OFF_PLATFORM_RE.test(body)) return { reason: "off_platform_pattern" };
  return null;
}
