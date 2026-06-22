import type {
  PreparedReflectionPurposeDefinition,
  PreparedReflectionPurposeId
} from "../constants/reflectionRoom";
import {
  MEDITATION_CARD_LABEL,
  PRAYER_CARD_LABEL,
  PREPARED_REFLECTION_PURPOSES,
  REFLECTION_CARD_LABEL
} from "../constants/reflectionRoom";

export type ReflectionCardViewModel = {
  id: PreparedReflectionPurposeId;
  title: string;
  description: string;
  reflectionLabel: string;
  statusLabel: string;
};

export type PrayerCardViewModel = {
  id: PreparedReflectionPurposeId;
  title: string;
  description: string;
  prayerLabel: string;
  statusLabel: string;
};

export type MeditationCardViewModel = {
  id: PreparedReflectionPurposeId;
  title: string;
  description: string;
  meditationLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildReflectionCardViewModel(
  purpose: PreparedReflectionPurposeDefinition
): ReflectionCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    reflectionLabel: REFLECTION_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildPrayerCardViewModel(
  purpose: PreparedReflectionPurposeDefinition
): PrayerCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    prayerLabel: PRAYER_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildMeditationCardViewModel(
  purpose: PreparedReflectionPurposeDefinition
): MeditationCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    meditationLabel: MEDITATION_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitecturePrayerPurposes(): PrayerCardViewModel[] {
  return PREPARED_REFLECTION_PURPOSES.filter((purpose) => purpose.kind === "prayer").map(
    buildPrayerCardViewModel
  );
}

export function listArchitectureReflectionPurposes(): ReflectionCardViewModel[] {
  return PREPARED_REFLECTION_PURPOSES.filter((purpose) => purpose.kind === "reflection").map(
    buildReflectionCardViewModel
  );
}

export function listArchitectureMeditationPurposes(): MeditationCardViewModel[] {
  return PREPARED_REFLECTION_PURPOSES.filter((purpose) => purpose.kind === "meditation").map(
    buildMeditationCardViewModel
  );
}
