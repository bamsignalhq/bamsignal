import type {
  CenturyTrustLayerDefinition,
  CenturyTrustPrincipleDefinition,
  CenturyTrustTimelineEntry
} from "../constants/centuryTrust";
import {
  CENTURY_TRUST_FUTURE_MODULES,
  CENTURY_TRUST_LAYERS,
  CENTURY_TRUST_PRINCIPLES,
  CENTURY_TRUST_THEME_COPY,
  CENTURY_TRUST_TIMELINE_ENTRIES,
  FUTURE_GENERATION_COPY,
  TRUST_LAYER_LABEL,
  TRUST_PURPOSE_LABEL
} from "../constants/centuryTrust";
import type {
  CenturyTrustCardViewModel,
  FutureGenerationCardViewModel,
  TrustPrincipleCardViewModel,
  TrustPurposeCardViewModel,
  TrustTimelineEntryViewModel
} from "../types/centuryTrust";

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildCenturyTrustCardViewModel(
  layer: CenturyTrustLayerDefinition
): CenturyTrustCardViewModel {
  return {
    id: layer.id,
    title: layer.title,
    description: layer.description,
    layerOrder: layer.layerOrder,
    layerLabel: TRUST_LAYER_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustPurposeCardViewModel(): TrustPurposeCardViewModel {
  return {
    purposeLabel: TRUST_PURPOSE_LABEL,
    themes: CENTURY_TRUST_THEME_COPY,
    narrative:
      "Century Room defines vision — Century Trust preserves it across generations with 100-year thinking and generational stewardship."
  };
}

export function buildTrustTimelineEntryViewModel(
  entry: CenturyTrustTimelineEntry
): TrustTimelineEntryViewModel {
  return { ...entry };
}

export function buildTrustPrincipleCardViewModel(
  principle: CenturyTrustPrincipleDefinition
): TrustPrincipleCardViewModel {
  return {
    id: principle.id,
    title: principle.title,
    description: principle.description,
    principleOrder: principle.principleOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFutureGenerationCardViewModel(): FutureGenerationCardViewModel {
  return {
    narrative: FUTURE_GENERATION_COPY,
    futureModules: CENTURY_TRUST_FUTURE_MODULES.map((module) => ({ ...module }))
  };
}

export function listArchitectureCenturyTrustLayers(): CenturyTrustCardViewModel[] {
  return [...CENTURY_TRUST_LAYERS]
    .sort((left, right) => left.layerOrder - right.layerOrder)
    .map(buildCenturyTrustCardViewModel);
}

export function listArchitectureTrustTimeline(): TrustTimelineEntryViewModel[] {
  return [...CENTURY_TRUST_TIMELINE_ENTRIES]
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
    .map(buildTrustTimelineEntryViewModel);
}

export function listArchitectureTrustPrinciples(): TrustPrincipleCardViewModel[] {
  return [...CENTURY_TRUST_PRINCIPLES]
    .sort((left, right) => left.principleOrder - right.principleOrder)
    .map(buildTrustPrincipleCardViewModel);
}
