import type {
  HouseOperatingPrincipleDefinition,
  HouseSystemDefinition,
  InstitutionMapNodeDefinition
} from "../constants/houseOperatingSystem";
import {
  CENTURY_VISION_COPY,
  HOUSE_OPERATING_PRINCIPLES,
  HOUSE_OPERATING_SYSTEM_FORBIDDEN_COPY,
  HOUSE_OPERATING_SYSTEM_GOOD_COPY,
  HOUSE_SYSTEM_LABEL,
  HOUSE_SYSTEMS,
  INSTITUTION_MAP_NODES,
  getHouseSystem
} from "../constants/houseOperatingSystem";
import type {
  CenturyVisionCardViewModel,
  InstitutionMapNodeViewModel,
  OperatingPrincipleCardViewModel,
  SystemOverviewCardViewModel
} from "../types/houseOperatingSystem";

const ARCHITECTURE_STATUS = "Architecture prepared — not operational yet";

export function buildSystemOverviewCardViewModel(
  system: HouseSystemDefinition
): SystemOverviewCardViewModel {
  return {
    id: system.id,
    title: system.title,
    description: system.description,
    systemOrder: system.systemOrder,
    systemLabel: HOUSE_SYSTEM_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildInstitutionMapNodeViewModel(
  node: InstitutionMapNodeDefinition
): InstitutionMapNodeViewModel {
  const system = getHouseSystem(node.systemId);
  return {
    id: node.id,
    label: node.label,
    systemId: node.systemId,
    systemTitle: system?.title ?? node.systemId,
    layer: node.layer,
    description: node.description,
    mapOrder: node.mapOrder
  };
}

export function buildOperatingPrincipleCardViewModel(
  principle: HouseOperatingPrincipleDefinition
): OperatingPrincipleCardViewModel {
  return {
    id: principle.id,
    title: principle.title,
    description: principle.description,
    principleOrder: principle.principleOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCenturyVisionCardViewModel(): CenturyVisionCardViewModel {
  return {
    goodCopy: HOUSE_OPERATING_SYSTEM_GOOD_COPY,
    forbiddenCopy: HOUSE_OPERATING_SYSTEM_FORBIDDEN_COPY,
    narrative: CENTURY_VISION_COPY
  };
}

export function listArchitectureHouseSystems(): SystemOverviewCardViewModel[] {
  return [...HOUSE_SYSTEMS]
    .sort((left, right) => left.systemOrder - right.systemOrder)
    .map(buildSystemOverviewCardViewModel);
}

export function listArchitectureInstitutionMapNodes(): InstitutionMapNodeViewModel[] {
  return [...INSTITUTION_MAP_NODES]
    .sort((left, right) => left.mapOrder - right.mapOrder)
    .map(buildInstitutionMapNodeViewModel);
}

export function listArchitectureOperatingPrinciples(): OperatingPrincipleCardViewModel[] {
  return [...HOUSE_OPERATING_PRINCIPLES]
    .sort((left, right) => left.principleOrder - right.principleOrder)
    .map(buildOperatingPrincipleCardViewModel);
}
