import { CENTURY_TRUST_LAYERS } from "../constants/centuryTrust";
import type { CenturyTrustBundle } from "../types/centuryTrust";
import {
  buildFutureGenerationCardViewModel,
  buildTrustPurposeCardViewModel,
  listArchitectureCenturyTrustLayers,
  listArchitectureTrustPrinciples,
  listArchitectureTrustTimeline
} from "./centuryTrustLogic";

export function getCenturyTrustBundle(): CenturyTrustBundle {
  return {
    layers: listArchitectureCenturyTrustLayers(),
    purpose: buildTrustPurposeCardViewModel(),
    timeline: listArchitectureTrustTimeline(),
    principles: listArchitectureTrustPrinciples(),
    futureGeneration: buildFutureGenerationCardViewModel(),
    layerCount: CENTURY_TRUST_LAYERS.length
  };
}
