import type { PreparedLegacyJourneyDefinition } from "../constants/hallOfLegacy";
import { PREPARED_LEGACY_JOURNEYS, getPreservedLegacyCategory } from "../constants/hallOfLegacy";

export type LegacyJourneyViewModel = {
  id: string;
  title: string;
  summary: string;
  categoryLabel: string;
  privateLabel: string;
  consentLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not published yet";
const PRIVATE_LABEL = "Private by default";
const CONSENT_LABEL = "Consent required";

function buildLegacyJourneyViewModel(journey: PreparedLegacyJourneyDefinition): LegacyJourneyViewModel {
  const category = getPreservedLegacyCategory(journey.categoryId);
  return {
    id: journey.id,
    title: journey.title,
    summary: journey.summary,
    categoryLabel: category?.label ?? journey.categoryId,
    privateLabel: PRIVATE_LABEL,
    consentLabel: CONSENT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

function sortByTitle(journeys: LegacyJourneyViewModel[]): LegacyJourneyViewModel[] {
  return [...journeys].sort((a, b) => a.title.localeCompare(b.title));
}

function listJourneysByKind(
  kind: PreparedLegacyJourneyDefinition["kind"]
): LegacyJourneyViewModel[] {
  return sortByTitle(
    PREPARED_LEGACY_JOURNEYS.filter((journey) => journey.kind === kind).map(buildLegacyJourneyViewModel)
  );
}

export function listArchitectureLegacyJourneys(): LegacyJourneyViewModel[] {
  return sortByTitle(PREPARED_LEGACY_JOURNEYS.map(buildLegacyJourneyViewModel));
}

export function listLegacyCoupleJourneys(): LegacyJourneyViewModel[] {
  return listJourneysByKind("legacy-couple");
}

export function listGoldenAnniversaryJourneys(): LegacyJourneyViewModel[] {
  return listJourneysByKind("golden-anniversary");
}

export function listFoundersCoupleJourneys(): LegacyJourneyViewModel[] {
  return listJourneysByKind("founders-couple");
}

export function listDiasporaStoryJourneys(): LegacyJourneyViewModel[] {
  return listJourneysByKind("diaspora-story");
}
