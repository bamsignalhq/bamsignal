import type { CenturyTrustLayerId, CenturyTrustPrincipleId } from "../constants/centuryTrust";

export type CenturyTrustCardViewModel = {
  id: CenturyTrustLayerId;
  title: string;
  description: string;
  layerOrder: number;
  layerLabel: string;
  statusLabel: string;
};

export type TrustPurposeCardViewModel = {
  purposeLabel: string;
  themes: readonly string[];
  narrative: string;
};

export type TrustTimelineEntryViewModel = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type TrustPrincipleCardViewModel = {
  id: CenturyTrustPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
  statusLabel: string;
};

export type FutureGenerationCardViewModel = {
  narrative: string;
  futureModules: Array<{
    id: string;
    label: string;
    description: string;
  }>;
};

export type CenturyTrustBundle = {
  layers: CenturyTrustCardViewModel[];
  purpose: TrustPurposeCardViewModel;
  timeline: TrustTimelineEntryViewModel[];
  principles: TrustPrincipleCardViewModel[];
  futureGeneration: FutureGenerationCardViewModel;
  layerCount: number;
};
