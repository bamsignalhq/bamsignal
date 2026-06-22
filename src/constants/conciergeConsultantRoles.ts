import type { SignalConciergeTierId } from "./signalConcierge";

export type ConciergeConsultantRoleId =
  | "relationship-consultant"
  | "senior-matchmaker"
  | "compatibility-specialist"
  | "family-values-advisor"
  | "diaspora-consultant";

export type ConciergeConsultantRole = {
  id: ConciergeConsultantRoleId;
  label: string;
  description: string;
  tierFocus?: SignalConciergeTierId[];
  default?: boolean;
};

export const CONCIERGE_CONSULTANT_ROLES: ConciergeConsultantRole[] = [
  {
    id: "relationship-consultant",
    label: "Relationship Consultant",
    description: "Guides members through the full journey — default consultant role.",
    default: true
  },
  {
    id: "senior-matchmaker",
    label: "Senior Matchmaker",
    description: "Leads Legacy™ and Global™ introductions with senior oversight.",
    tierFocus: ["legacy", "global"]
  },
  {
    id: "compatibility-specialist",
    label: "Compatibility Specialist",
    description: "Reviews applications, Voice Vibe, and compatibility signals.",
    tierFocus: ["essential", "signature", "legacy", "global"]
  },
  {
    id: "family-values-advisor",
    label: "Family Values Advisor",
    description: "Supports Legacy™ members with family alignment and values depth.",
    tierFocus: ["legacy"]
  },
  {
    id: "diaspora-consultant",
    label: "Diaspora Consultant",
    description: "Guides Global™ members across borders, relocation, and diaspora goals.",
    tierFocus: ["global"]
  }
];

export const CONCIERGE_CONSULTANT_ROLE_LABELS: Record<ConciergeConsultantRoleId, string> =
  Object.fromEntries(
    CONCIERGE_CONSULTANT_ROLES.map((role) => [role.id, role.label])
  ) as Record<ConciergeConsultantRoleId, string>;

export const CONCIERGE_CONSULTANT_DEFAULT_ROLE: ConciergeConsultantRoleId = "relationship-consultant";

export const CONCIERGE_PORTFOLIO_TITLE = "My Portfolio";
export const CONCIERGE_DIRECTORY_TITLE = "Consultants";
export const CONCIERGE_DIRECTORY_SUBTITLE =
  "Invite consultants, assign roles, and review portfolios. Members belong to BamSignal.";

export const CONCIERGE_ANTI_POACHING_COPY =
  "Consultants guide members — they never own them. BamSignal retains member relationships.";

export const CONCIERGE_CONSULTANT_HOME_ROUTE = "/consultant/portfolio";
