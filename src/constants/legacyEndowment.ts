/** Legacy Endowment™ — long-term impact structures architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const LEGACY_ENDOWMENT_TITLE = "Legacy Endowment™";
export const LEGACY_ENDOWMENT_LABEL = "Legacy Endowment";
export const ENDOWMENT_PROGRAM_LABEL = "Endowment Program";
export const IMPACT_FUND_LABEL = "Impact Fund";
export const COMMUNITY_IMPACT_LABEL = "Community Impact";
export const GIVING_BACK_LABEL = "Giving Back";
export const STRENGTHENING_FAMILIES_LABEL = "Strengthening Families";

export const LEGACY_ENDOWMENT_GOOD_COPY = [
  "Legacy Endowment",
  "Impact",
  "Giving Back",
  "Strengthening Families"
] as const;

export const LEGACY_ENDOWMENT_FORBIDDEN_COPY = ["CSR", "Campaign", "Fundraising"] as const;

export const LEGACY_ENDOWMENT_SUBCOPY =
  "Long-term impact structures — Legacy Endowment and Giving Back with dignity, never CSR campaigns or fundraising drives.";
export const LEGACY_ENDOWMENT_PURPOSE_COPY =
  "Prepare long-term impact structures — programs, funds, and community impact reserved, not donor flows yet.";
export const LEGACY_ENDOWMENT_RESERVED_COPY =
  "Architecture prepared. Endowment programs, impact funds, and community impact projects are not enabled yet.";
export const LEGACY_ENDOWMENT_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — foundations, trusts, donor programs, and university partnerships are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyEndowmentCapabilityId =
  | "foundations"
  | "trusts"
  | "donor-programs"
  | "university-partnerships";

export type FutureReadyEndowmentCapabilityDefinition = {
  id: FutureReadyEndowmentCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_ENDOWMENT_CAPABILITIES: FutureReadyEndowmentCapabilityDefinition[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Foundations — architecture reserved, not implemented."
  },
  {
    id: "trusts",
    title: "Trusts",
    description: "Trusts — architecture reserved, not implemented."
  },
  {
    id: "donor-programs",
    title: "Donor Programs",
    description: "Donor Programs — architecture reserved, not implemented."
  },
  {
    id: "university-partnerships",
    title: "University Partnerships",
    description: "University Partnerships — architecture reserved, not implemented."
  }
];

export type PreparedEndowmentProgramId =
  | "scholarships"
  | "family-funds"
  | "relationship-research-grants"
  | "community-impact-projects"
  | "marriage-education-grants"
  | "widows-support"
  | "single-parent-support"
  | "diaspora-family-programs"
  | "youth-mentorship"
  | "faith-family-programs";

export type PreparedEndowmentProgramKind = "fund" | "community";

export type PreparedEndowmentProgramDefinition = {
  id: PreparedEndowmentProgramId;
  title: string;
  description: string;
  kind: PreparedEndowmentProgramKind;
  fundId: string;
  communityImpactId?: string;
};

export const PREPARED_ENDOWMENT_PROGRAMS: PreparedEndowmentProgramDefinition[] = [
  {
    id: "scholarships",
    title: "Scholarships",
    description: "Scholarships — long-term learning impact, not a fundraising campaign.",
    kind: "fund",
    fundId: "lgnd_fund_scholarships"
  },
  {
    id: "family-funds",
    title: "Family Funds",
    description: "Family Funds — strengthening families through lasting endowment structures.",
    kind: "fund",
    fundId: "lgnd_fund_family"
  },
  {
    id: "relationship-research-grants",
    title: "Relationship Research Grants",
    description: "Relationship Research Grants — impact for understanding relationships.",
    kind: "fund",
    fundId: "lgnd_fund_research"
  },
  {
    id: "community-impact-projects",
    title: "Community Impact Projects",
    description: "Community Impact Projects — local giving back with dignity.",
    kind: "community",
    fundId: "lgnd_fund_community",
    communityImpactId: "lgnd_impact_community"
  },
  {
    id: "marriage-education-grants",
    title: "Marriage Education Grants",
    description: "Marriage Education Grants — strengthening families through education impact.",
    kind: "fund",
    fundId: "lgnd_fund_marriage_education"
  },
  {
    id: "widows-support",
    title: "Widows Support",
    description: "Widows Support — compassionate community impact, not CSR optics.",
    kind: "community",
    fundId: "lgnd_fund_widows",
    communityImpactId: "lgnd_impact_widows"
  },
  {
    id: "single-parent-support",
    title: "Single Parent Support",
    description: "Single Parent Support — family strengthening through endowment care.",
    kind: "community",
    fundId: "lgnd_fund_single_parent",
    communityImpactId: "lgnd_impact_single_parent"
  },
  {
    id: "diaspora-family-programs",
    title: "Diaspora Family Programs",
    description: "Diaspora Family Programs — cross-border impact for family builders.",
    kind: "community",
    fundId: "lgnd_fund_diaspora",
    communityImpactId: "lgnd_impact_diaspora"
  },
  {
    id: "youth-mentorship",
    title: "Youth Mentorship",
    description: "Youth Mentorship — long-term guidance impact for the next generation.",
    kind: "community",
    fundId: "lgnd_fund_youth",
    communityImpactId: "lgnd_impact_youth"
  },
  {
    id: "faith-family-programs",
    title: "Faith & Family Programs",
    description: "Faith & Family Programs — faith-aligned impact strengthening households.",
    kind: "community",
    fundId: "lgnd_fund_faith_family",
    communityImpactId: "lgnd_impact_faith_family"
  }
];

export type PreparedImpactFundId =
  | "lgnd_fund_scholarships"
  | "lgnd_fund_family"
  | "lgnd_fund_research"
  | "lgnd_fund_community"
  | "lgnd_fund_marriage_education"
  | "lgnd_fund_widows"
  | "lgnd_fund_single_parent"
  | "lgnd_fund_diaspora"
  | "lgnd_fund_youth"
  | "lgnd_fund_faith_family";

export type PreparedImpactFundDefinition = {
  id: PreparedImpactFundId;
  title: string;
  description: string;
  programId: PreparedEndowmentProgramId;
};

export const PREPARED_IMPACT_FUNDS: PreparedImpactFundDefinition[] = PREPARED_ENDOWMENT_PROGRAMS.map(
  (program) => ({
    id: program.fundId as PreparedImpactFundId,
    title: `${program.title} fund`,
    description: `${program.title} — Impact Fund reserved, not fundraising.`,
    programId: program.id
  })
);

export type PreparedCommunityImpactId =
  | "lgnd_impact_community"
  | "lgnd_impact_widows"
  | "lgnd_impact_single_parent"
  | "lgnd_impact_diaspora"
  | "lgnd_impact_youth"
  | "lgnd_impact_faith_family";

export type PreparedCommunityImpactDefinition = {
  id: PreparedCommunityImpactId;
  title: string;
  description: string;
  programId: PreparedEndowmentProgramId;
};

export const PREPARED_COMMUNITY_IMPACTS: PreparedCommunityImpactDefinition[] =
  PREPARED_ENDOWMENT_PROGRAMS.filter(
    (program): program is PreparedEndowmentProgramDefinition & { communityImpactId: string } =>
      program.kind === "community" && Boolean(program.communityImpactId)
  ).map((program) => ({
    id: program.communityImpactId as PreparedCommunityImpactId,
    title: program.title,
    description: `${program.title} — Community Impact structure reserved, not a CSR campaign.`,
    programId: program.id
  }));

export function getPreparedEndowmentProgram(
  programId: PreparedEndowmentProgramId
): PreparedEndowmentProgramDefinition | undefined {
  return PREPARED_ENDOWMENT_PROGRAMS.find((program) => program.id === programId);
}
