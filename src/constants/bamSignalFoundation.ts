/** BamSignal Foundation™ — social impact architecture (prepared, not enabled). */

export const BAMSIGNAL_FOUNDATION_TITLE = "BamSignal Foundation™";
export const BAMSIGNAL_FOUNDATION_SUBCOPY =
  "Giving Back — the social impact arm of BamSignal, prepared with dignity.";
export const IMPACT_LABEL = "Impact";
export const GIVING_BACK_LABEL = "Giving Back";
export const SUPPORTING_FAMILIES_LABEL = "Supporting Families";
export const BUILDING_STRONG_COMMUNITIES_LABEL = "Building Strong Communities";

export const BAMSIGNAL_FOUNDATION_PURPOSE_COPY =
  "Create the social impact arm of BamSignal — supporting families and building strong communities.";
export const BAMSIGNAL_FOUNDATION_RESERVED_COPY =
  "Architecture prepared. Programs, partnerships, and giving flows are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const BAMSIGNAL_FOUNDATION_AVOID_COPY = ["CSR", "Campaign", "Marketing Initiative"] as const;

export type FoundationProgramId =
  | "relationship-education"
  | "marriage-preparation"
  | "youth-mentorship"
  | "scholarships"
  | "widows-support"
  | "single-parents-support"
  | "family-counseling-partnerships"
  | "domestic-violence-awareness"
  | "mental-health-partnerships"
  | "diaspora-family-integration";

export type FoundationProgramCardKind = "standard" | "scholarship" | "widows" | "family";

export type FoundationProgramDefinition = {
  id: FoundationProgramId;
  title: string;
  description: string;
  cardKind: FoundationProgramCardKind;
};

export const FOUNDATION_PROGRAMS: FoundationProgramDefinition[] = [
  {
    id: "relationship-education",
    title: "Relationship Education",
    description: "Warm relationship education — dignity and consent first.",
    cardKind: "standard"
  },
  {
    id: "marriage-preparation",
    title: "Marriage Preparation",
    description: "Marriage preparation with care — never a sales funnel.",
    cardKind: "standard"
  },
  {
    id: "youth-mentorship",
    title: "Youth Mentorship",
    description: "Youth mentorship for healthy relationship culture.",
    cardKind: "standard"
  },
  {
    id: "scholarships",
    title: "Scholarships",
    description: "Scholarships reserved — impact without publicity chasing.",
    cardKind: "scholarship"
  },
  {
    id: "widows-support",
    title: "Widows Support",
    description: "Widows support — compassion and dignity.",
    cardKind: "widows"
  },
  {
    id: "single-parents-support",
    title: "Single Parents Support",
    description: "Single parents support — families strengthened with care.",
    cardKind: "family"
  },
  {
    id: "family-counseling-partnerships",
    title: "Family Counseling Partnerships",
    description: "Family counseling partnerships — professional and private.",
    cardKind: "family"
  },
  {
    id: "domestic-violence-awareness",
    title: "Domestic Violence Awareness",
    description: "Domestic violence awareness — safety and dignity first.",
    cardKind: "standard"
  },
  {
    id: "mental-health-partnerships",
    title: "Mental Health Partnerships",
    description: "Mental health partnerships — stigma-free support pathways.",
    cardKind: "standard"
  },
  {
    id: "diaspora-family-integration",
    title: "Diaspora Family Integration",
    description: "Diaspora family integration — Journey Across Borders with care.",
    cardKind: "family"
  }
];

export type FoundationImpactPillarId =
  | "giving-back"
  | "supporting-families"
  | "building-communities";

export const FOUNDATION_IMPACT_PILLARS: {
  id: FoundationImpactPillarId;
  label: string;
  description: string;
}[] = [
  {
    id: "giving-back",
    label: GIVING_BACK_LABEL,
    description: "Impact through giving — never a marketing campaign."
  },
  {
    id: "supporting-families",
    label: SUPPORTING_FAMILIES_LABEL,
    description: "Families supported with dignity and privacy."
  },
  {
    id: "building-communities",
    label: BUILDING_STRONG_COMMUNITIES_LABEL,
    description: "Strong communities built with care — not CSR theater."
  }
];

export type FoundationStorySeed = {
  id: string;
  title: string;
  summary: string;
  recordedAt: string;
  privateByDefault: boolean;
};

export const FOUNDATION_STORIES_ARCHITECTURE_SEED: FoundationStorySeed[] = [
  {
    id: "bf_story_scholarship",
    title: "Scholarship pathway",
    summary: "Impact story reserved — private by default until consent is granted.",
    recordedAt: "2026-03-01T00:00:00.000Z",
    privateByDefault: true
  },
  {
    id: "bf_story_widows",
    title: "Widows support journey",
    summary: "Compassion preserved with dignity — not for public marketing.",
    recordedAt: "2026-03-15T00:00:00.000Z",
    privateByDefault: true
  },
  {
    id: "bf_story_family",
    title: "Family support milestone",
    summary: "Supporting families — architecture prepared, story private.",
    recordedAt: "2026-04-01T00:00:00.000Z",
    privateByDefault: true
  }
];

export type FoundationPartnershipFutureId =
  | "ngo-partnerships"
  | "church-partnerships"
  | "mosque-partnerships"
  | "community-organizations"
  | "universities";

export const FOUNDATION_PARTNERSHIP_FUTURE_CAPABILITIES: {
  id: FoundationPartnershipFutureId;
  label: string;
  description: string;
}[] = [
  {
    id: "ngo-partnerships",
    label: "NGO partnerships",
    description: "Reserved — NGO partnerships for social impact."
  },
  {
    id: "church-partnerships",
    label: "Church partnerships",
    description: "Reserved — church partnerships with dignity."
  },
  {
    id: "mosque-partnerships",
    label: "Mosque partnerships",
    description: "Reserved — mosque partnerships with care."
  },
  {
    id: "community-organizations",
    label: "Community organizations",
    description: "Reserved — local community organization partnerships."
  },
  {
    id: "universities",
    label: "Universities",
    description: "Reserved — university partnerships for education impact."
  }
];

export function getFoundationProgram(id: FoundationProgramId): FoundationProgramDefinition | undefined {
  return FOUNDATION_PROGRAMS.find((program) => program.id === id);
}
