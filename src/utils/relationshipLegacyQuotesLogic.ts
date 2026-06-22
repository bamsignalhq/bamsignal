import {
  DEFAULT_LEGACY_QUOTE_VISIBILITY,
  type LegacyQuoteConsentLevel,
  type LegacyQuoteEntry
} from "../constants/relationshipLegacyQuotes";

export function normalizeLegacyQuoteEntry(entry: LegacyQuoteEntry): LegacyQuoteEntry {
  return {
    ...entry,
    visibility: DEFAULT_LEGACY_QUOTE_VISIBILITY,
    consentGranted: entry.consentGranted === true && Boolean(entry.consentLevel)
  };
}

export function assertLegacyQuotePrivacy(entry: LegacyQuoteEntry): void {
  if (entry.visibility !== "private") {
    throw new Error("Legacy quotes must remain private by default");
  }
}

export function assertLegacyQuoteConsent(entry: LegacyQuoteEntry): void {
  if (entry.consentGranted && !entry.consentLevel) {
    throw new Error("Legacy quote consent level is required before granting consent");
  }
}

export function assertLegacyQuoteTimelineIntegrity(
  previous: LegacyQuoteEntry[],
  next: LegacyQuoteEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Legacy quote timeline cannot shrink");
  }
  const previousIds = new Set(previous.map((entry) => entry.id));
  for (const id of previousIds) {
    if (!next.some((entry) => entry.id === id)) {
      throw new Error("Legacy quotes are never deleted");
    }
  }
  for (const entry of next) {
    assertLegacyQuotePrivacy(entry);
    assertLegacyQuoteConsent(entry);
  }
}

export function createLegacyQuoteEntry(input: {
  id?: string;
  journeyId: string;
  body: string;
  recordedAt?: string;
  recordedBy?: string;
  consentLevel?: LegacyQuoteConsentLevel | null;
  consentGranted?: boolean;
}): LegacyQuoteEntry {
  const entry = normalizeLegacyQuoteEntry({
    id: input.id ?? `rlq_${Date.now().toString(36)}`,
    journeyId: input.journeyId,
    body: input.body.trim(),
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    recordedBy: input.recordedBy,
    visibility: DEFAULT_LEGACY_QUOTE_VISIBILITY,
    consentLevel: input.consentLevel ?? null,
    consentGranted: input.consentGranted ?? false
  });
  assertLegacyQuotePrivacy(entry);
  assertLegacyQuoteConsent(entry);
  return entry;
}

export function sortLegacyQuotes(entries: LegacyQuoteEntry[]): LegacyQuoteEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}
