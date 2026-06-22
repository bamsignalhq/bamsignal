import {
  LEGACY_QUOTE_CONSENT_LEVELS,
  LEGACY_QUOTE_FUTURE_CAPABILITIES,
  RELATIONSHIP_LEGACY_QUOTES_ARCHITECTURE_SEED,
  type LegacyQuoteEntry
} from "../constants/relationshipLegacyQuotes";
import { sortLegacyQuotes } from "./relationshipLegacyQuotesLogic";

export function listLegacyQuoteConsentLevels() {
  return LEGACY_QUOTE_CONSENT_LEVELS;
}

export function listLegacyQuoteFutureCapabilities() {
  return LEGACY_QUOTE_FUTURE_CAPABILITIES;
}

export function getRelationshipLegacyQuotesArchitectureTimeline(): LegacyQuoteEntry[] {
  return sortLegacyQuotes(RELATIONSHIP_LEGACY_QUOTES_ARCHITECTURE_SEED);
}

export { assertLegacyQuoteTimelineIntegrity } from "./relationshipLegacyQuotesLogic";
