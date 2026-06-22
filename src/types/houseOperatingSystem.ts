import type { HouseOperatingPrincipleId, HouseSystemId } from "../constants/houseOperatingSystem";

export type SystemOverviewCardViewModel = {
  id: HouseSystemId;
  title: string;
  description: string;
  systemOrder: number;
  systemLabel: string;
  statusLabel: string;
};

export type InstitutionMapNodeViewModel = {
  id: string;
  label: string;
  systemId: HouseSystemId;
  systemTitle: string;
  layer: string;
  description: string;
  mapOrder: number;
};

export type OperatingPrincipleCardViewModel = {
  id: HouseOperatingPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
  statusLabel: string;
};

export type CenturyVisionCardViewModel = {
  goodCopy: readonly string[];
  forbiddenCopy: readonly string[];
  narrative: string;
};

export type HouseOperatingSystemBundle = {
  systems: SystemOverviewCardViewModel[];
  mapNodes: InstitutionMapNodeViewModel[];
  principles: OperatingPrincipleCardViewModel[];
  centuryVision: CenturyVisionCardViewModel;
  systemCount: number;
};
