/** House Operating System™ — umbrella architecture for BamSignal institution. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const HOUSE_OPERATING_SYSTEM_TITLE = "House Operating System™";
export const HOUSE_OPERATING_SYSTEM_LABEL = "House OS";
export const HOUSE_SYSTEM_LABEL = "House System";
export const INSTITUTION_MAP_LABEL = "Institution Map";

export const HOUSE_OPERATING_SYSTEM_SUBCOPY =
  "House Operating System™ — the top layer above Signal Concierge, Operations, Journey Intelligence, House Institute, Events, Communities, Governance, Stewardship, Trust, and Knowledge.";
export const HOUSE_OPERATING_SYSTEM_PURPOSE_COPY =
  "Every major institutional system now exists — House OS is the umbrella architecture that unifies them. Documented only, not dashboards or planning tools.";
export const HOUSE_OPERATING_SYSTEM_RESERVED_COPY =
  "Architecture prepared. Institution dashboard, strategic planning, and annual stewardship review are not enabled yet.";

export const HOUSE_OPERATING_SYSTEM_GOOD_COPY = [
  "The House",
  "The Institution",
  "The Next Century"
] as const;

export const HOUSE_OPERATING_SYSTEM_FORBIDDEN_COPY = [
  "Platform",
  "Startup",
  "Marketplace"
] as const;

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type HouseSystemId =
  | "signal-concierge"
  | "operations-center"
  | "journey-intelligence"
  | "house-institute"
  | "events"
  | "communities"
  | "governance"
  | "stewardship-council"
  | "century-trust"
  | "knowledge-base";

export type HouseSystemDefinition = {
  id: HouseSystemId;
  title: string;
  description: string;
  systemOrder: number;
};

export const HOUSE_SYSTEMS: HouseSystemDefinition[] = [
  {
    id: "signal-concierge",
    title: "Signal Concierge™",
    description: "Human-first concierge journeys — applications through legacy families.",
    systemOrder: 1
  },
  {
    id: "operations-center",
    title: "Operations Center™",
    description: "Institutional operations coordination — consultants, assignments, and workflow memory.",
    systemOrder: 2
  },
  {
    id: "journey-intelligence",
    title: "Journey Intelligence™",
    description: "Executive journey insights — dignified aggregates for stewarded outcomes.",
    systemOrder: 3
  },
  {
    id: "house-institute",
    title: "House Institute™",
    description: "Research, observatory, and relationship index at The BamSignal House™.",
    systemOrder: 4
  },
  {
    id: "events",
    title: "Events™",
    description: "Signal Events — communities, diaspora corridors, and relationship gatherings.",
    systemOrder: 5
  },
  {
    id: "communities",
    title: "Communities™",
    description: "City and corridor communities — local dignity, never leaderboard culture.",
    systemOrder: 6
  },
  {
    id: "governance",
    title: "Governance™",
    description: "BamSignal Governance Framework™ — stewardship pillars, not permissions or voting.",
    systemOrder: 7
  },
  {
    id: "stewardship-council",
    title: "Stewardship Council™",
    description: "Institutional custodians — council roles architecture, not authority systems.",
    systemOrder: 8
  },
  {
    id: "century-trust",
    title: "Century Trust™",
    description: "Generational vision preservation — trust layers, not legal or financial instruments.",
    systemOrder: 9
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base™",
    description: "Institutional Knowledge Base™ — central memory for lessons, principles, and culture.",
    systemOrder: 10
  }
];

export type HouseOperatingPrincipleId =
  | "families-first"
  | "trust-first"
  | "long-term-thinking"
  | "stewardship"
  | "institution-building"
  | "generational-impact";

export type HouseOperatingPrincipleDefinition = {
  id: HouseOperatingPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
};

export const HOUSE_OPERATING_PRINCIPLES: HouseOperatingPrincipleDefinition[] = [
  {
    id: "families-first",
    title: "Families first",
    description: "Every system serves family dignity — outcomes over metrics.",
    principleOrder: 1
  },
  {
    id: "trust-first",
    title: "Trust first",
    description: "Trust is institutional capital — guarded across all House systems.",
    principleOrder: 2
  },
  {
    id: "long-term-thinking",
    title: "Long-term thinking",
    description: "The Next Century horizon — never quarterly convenience over legacy.",
    principleOrder: 3
  },
  {
    id: "stewardship",
    title: "Stewardship",
    description: "Custodians serve the mission — House OS coordinates stewardship, not control.",
    principleOrder: 4
  },
  {
    id: "institution-building",
    title: "Institution building",
    description: "The Institution endures beyond founders — systems documented as one House.",
    principleOrder: 5
  },
  {
    id: "generational-impact",
    title: "Generational impact",
    description: "Generational impact over growth theatre — architecture for generations ahead.",
    principleOrder: 6
  }
];

export type InstitutionMapNodeDefinition = {
  id: string;
  label: string;
  systemId: HouseSystemId;
  layer: "experience" | "operations" | "research" | "governance" | "century";
  description: string;
  mapOrder: number;
};

export const INSTITUTION_MAP_NODES: InstitutionMapNodeDefinition[] = [
  {
    id: "map-concierge",
    label: "Concierge journeys",
    systemId: "signal-concierge",
    layer: "experience",
    description: "Member-facing concierge — human-first, never marketplace dynamics.",
    mapOrder: 1
  },
  {
    id: "map-operations",
    label: "Operations layer",
    systemId: "operations-center",
    layer: "operations",
    description: "Consultant operations and assignments — institutional coordination.",
    mapOrder: 2
  },
  {
    id: "map-intelligence",
    label: "Journey intelligence",
    systemId: "journey-intelligence",
    layer: "operations",
    description: "Aggregate journey insights feeding House research and governance.",
    mapOrder: 3
  },
  {
    id: "map-institute",
    label: "House Institute",
    systemId: "house-institute",
    layer: "research",
    description: "Research pipeline, observatory, and relationship index.",
    mapOrder: 4
  },
  {
    id: "map-events",
    label: "Events & communities",
    systemId: "events",
    layer: "experience",
    description: "Events and communities — diaspora corridors and city dignity.",
    mapOrder: 5
  },
  {
    id: "map-governance",
    label: "Governance stack",
    systemId: "governance",
    layer: "governance",
    description: "Governance Framework, Stewardship Council, and institutional commitments.",
    mapOrder: 6
  },
  {
    id: "map-trust",
    label: "Century trust",
    systemId: "century-trust",
    layer: "century",
    description: "Trust layers preserving Century Room vision across generations.",
    mapOrder: 7
  },
  {
    id: "map-knowledge",
    label: "Institutional memory",
    systemId: "knowledge-base",
    layer: "century",
    description: "Knowledge Base — lessons, principles, decisions, and culture preserved.",
    mapOrder: 8
  }
];

export const CENTURY_VISION_COPY =
  "The House stands for dignified relationship discovery. The Institution endures beyond any single product. The Next Century is the horizon — House OS unifies every system beneath that vision.";

export const HOUSE_OPERATING_SYSTEM_FUTURE_MODULES = [
  {
    id: "institution-dashboard",
    label: "Institution dashboard",
    description: "Unified House OS dashboard — documented, not implemented."
  },
  {
    id: "strategic-planning",
    label: "Strategic planning",
    description: "Century strategic planning workflow — architecture reserved."
  },
  {
    id: "annual-stewardship-review",
    label: "Annual stewardship review",
    description: "Yearly stewardship review cycle — not enabled yet."
  }
] as const;

export function getHouseSystem(systemId: HouseSystemId): HouseSystemDefinition | undefined {
  return HOUSE_SYSTEMS.find((system) => system.id === systemId);
}
