/** Century Trust™ — generational vision preservation architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const CENTURY_TRUST_TITLE = "Century Trust™";
export const CENTURY_TRUST_LABEL = "Century Trust";
export const TRUST_LAYER_LABEL = "Trust Layer";
export const TRUST_PURPOSE_LABEL = "Trust Purpose";

export const CENTURY_TRUST_SUBCOPY =
  "Century Trust™ — preserving Century Room vision across generations through mission, family, community, research, legacy, and institution trust layers.";
export const CENTURY_TRUST_PURPOSE_COPY =
  "Build Century Trust architecture — 100-year thinking for generational stewardship. Documented only, not legal, financial, or operational.";
export const CENTURY_TRUST_RESERVED_COPY =
  "Architecture prepared. Legal trusts, foundations, and endowments are not enabled yet.";

export const CENTURY_TRUST_THEME_COPY = [
  "100-year thinking",
  "Generational stewardship",
  "Protecting the mission",
  "Protecting future families"
] as const;

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type CenturyTrustLayerId =
  | "mission-trust"
  | "family-trust"
  | "community-trust"
  | "research-trust"
  | "legacy-trust"
  | "institution-trust";

export type CenturyTrustLayerDefinition = {
  id: CenturyTrustLayerId;
  title: string;
  description: string;
  layerOrder: number;
};

export const CENTURY_TRUST_LAYERS: CenturyTrustLayerDefinition[] = [
  {
    id: "mission-trust",
    title: "Mission Trust",
    description: "Preserves BamSignal's dignified relationship mission across the century — never diluted by metrics.",
    layerOrder: 1
  },
  {
    id: "family-trust",
    title: "Family Trust",
    description: "Guards family dignity in every programme — protecting future families, not just today's growth.",
    layerOrder: 2
  },
  {
    id: "community-trust",
    title: "Community Trust",
    description: "Stewards community trust with local respect — corridors and cities, never identities.",
    layerOrder: 3
  },
  {
    id: "research-trust",
    title: "Research Trust",
    description: "Protects House Institute research ethics — anonymous aggregates, never member data.",
    layerOrder: 4
  },
  {
    id: "legacy-trust",
    title: "Legacy Trust",
    description: "Preserves legacy families and archives for generations — Century Room vision made durable.",
    layerOrder: 5
  },
  {
    id: "institution-trust",
    title: "Institution Trust",
    description: "Holds The BamSignal House™, Institute, Observatory, and Governance Framework as one trusted institution.",
    layerOrder: 6
  }
];

export type CenturyTrustPrincipleId =
  | "hundred-year-thinking"
  | "generational-stewardship"
  | "protecting-mission"
  | "protecting-future-families";

export type CenturyTrustPrincipleDefinition = {
  id: CenturyTrustPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
};

export const CENTURY_TRUST_PRINCIPLES: CenturyTrustPrincipleDefinition[] = [
  {
    id: "hundred-year-thinking",
    title: "100-year thinking",
    description: "Every trust layer honours the century ahead — not quarterly convenience.",
    principleOrder: 1
  },
  {
    id: "generational-stewardship",
    title: "Generational stewardship",
    description: "Custodians serve generations they may never meet — architecture for long horizon trust.",
    principleOrder: 2
  },
  {
    id: "protecting-mission",
    title: "Protecting the mission",
    description: "Mission trust prevents drift — dignified discovery remains the centre.",
    principleOrder: 3
  },
  {
    id: "protecting-future-families",
    title: "Protecting future families",
    description: "Family trust extends beyond current members — future families inherit dignity.",
    principleOrder: 4
  }
];

export type CenturyTrustTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export const CENTURY_TRUST_TIMELINE_ENTRIES: CenturyTrustTimelineEntry[] = [
  {
    id: "ctrust_timeline_architecture_prepared",
    label: "Century Trust architecture prepared",
    recordedAt: "2026-02-15T00:00:00.000Z",
    note: "Six trust layers documented — not legal, financial, or operational."
  },
  {
    id: "ctrust_timeline_principles_defined",
    label: "Generational principles defined",
    recordedAt: "2026-04-15T00:00:00.000Z",
    note: "100-year thinking and future family protection anchored."
  },
  {
    id: "ctrust_timeline_endowment_reserved",
    label: "Endowment pathway reserved",
    recordedAt: "2026-06-15T00:00:00.000Z",
    note: "Legal trusts and foundations documented for future readiness only."
  }
];

export const FUTURE_GENERATION_COPY =
  "Century Trust exists so Century Room vision survives founders — protecting mission, families, and legacy for generations not yet born.";

export const CENTURY_TRUST_FUTURE_MODULES = [
  {
    id: "legal-trusts",
    label: "Legal trusts",
    description: "Formal legal trust structures — documented, not implemented."
  },
  {
    id: "foundations",
    label: "Foundations",
    description: "Institutional foundation architecture — reserved, not operational."
  },
  {
    id: "endowments",
    label: "Endowments",
    description: "Legacy endowment pathways — not enabled yet."
  }
] as const;

export function getCenturyTrustLayer(
  layerId: CenturyTrustLayerId
): CenturyTrustLayerDefinition | undefined {
  return CENTURY_TRUST_LAYERS.find((layer) => layer.id === layerId);
}
