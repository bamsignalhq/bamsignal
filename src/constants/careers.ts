/** Careers — public Join Our Team landing; hiring centralized under Stankings Legacy Ltd. */

export const STANKINGS_COMPANY_NAME = "Stankings Legacy Ltd";
export const STANKINGS_SITE_URL = "https://stankings.com";
export const STANKINGS_CAREERS_URL = "https://stankings.com/careers";

export const CAREERS_BRAND = "Join Our Team";
export const CAREERS_TITLE = "Careers at BamSignal";

export const CAREERS_JOIN_HEADING = "Join Our Team";

export const CAREERS_JOIN_BODY = [
  "BamSignal is a product of Stankings Legacy Ltd.",
  "Stankings Legacy Ltd designs, builds, operates and supports a growing portfolio of technology products across Africa, including BamSignal, Yike, BayRight and future ventures.",
  "Recruitment for all companies within the group is managed centrally through Stankings Legacy Ltd."
] as const;

export const CAREERS_PRIMARY_CTA = {
  label: "Explore Opportunities at Stankings",
  href: STANKINGS_CAREERS_URL
} as const;

export const CAREERS_SECONDARY_CTA = {
  label: "Learn About Stankings Legacy Ltd",
  href: STANKINGS_SITE_URL
} as const;

export const CAREERS_COMPANIES_HEADING = "Technology built by Stankings Legacy Ltd";

export type StankingsPortfolioCompany = {
  name: string;
  tagline: string;
  href: string;
  /** Same-origin BamSignal destinations stay in-tab */
  external?: boolean;
};

export const CAREERS_PORTFOLIO_COMPANIES: readonly StankingsPortfolioCompany[] = [
  {
    name: "BamSignal",
    tagline: "Meaningful relationships.",
    href: "/",
    external: false
  },
  {
    name: "Yike",
    tagline: "Property & mobility marketplace.",
    href: "https://yike.ng",
    external: true
  },
  {
    name: "BayRight",
    tagline: "Digital financial services.",
    href: "https://bayright.com",
    external: true
  },
  {
    name: "More Coming",
    tagline: "Building the future.",
    href: STANKINGS_SITE_URL,
    external: true
  }
] as const;

export const CAREERS_CLOSING_HEADING =
  "Join the Team Behind Africa's Next Generation of Digital Products.";

export const CAREERS_SEO = {
  title: "Careers at BamSignal | Hiring via Stankings Legacy Ltd",
  description:
    "BamSignal is a product of Stankings Legacy Ltd. Explore opportunities across BamSignal, Yike, BayRight and the Stankings group at stankings.com/careers."
} as const;

/** @deprecated Legacy hosted careers taxonomy — admin talent tooling / seeds only. */
export type CareerCategoryId =
  | "signal-concierge"
  | "operations"
  | "research"
  | "community"
  | "events"
  | "institute"
  | "leadership"
  | "technology"
  | "customer-support";

/** @deprecated */
export type CareerSectionId =
  | "why-bamsignal"
  | "our-mission"
  | "our-values"
  | "open-roles"
  | "culture"
  | "benefits"
  | "hiring-process"
  | "future-opportunities";

/** @deprecated Admin / seed compatibility */
export const CAREER_CATEGORIES: {
  id: CareerCategoryId;
  label: string;
  hint: string;
}[] = [
  { id: "signal-concierge", label: "Signal Concierge", hint: "Relationship consultants and matchmakers." },
  { id: "operations", label: "Operations", hint: "Coordination across the concierge journey." },
  { id: "research", label: "Research", hint: "Relationship science and institute insights." },
  { id: "community", label: "Community", hint: "Stewards for cities, diaspora, and events." },
  { id: "events", label: "Events", hint: "Summits, gatherings, and legacy celebrations." },
  { id: "institute", label: "Institute", hint: "Academy, curriculum, and professional networks." },
  { id: "leadership", label: "Leadership", hint: "Executive and strategic roles." },
  { id: "technology", label: "Technology", hint: "Product, platform, and infrastructure." },
  { id: "customer-support", label: "Customer Support", hint: "Member care and trust operations." }
];

export const CAREER_CATEGORY_LABELS: Record<CareerCategoryId, string> = Object.fromEntries(
  CAREER_CATEGORIES.map((item) => [item.id, item.label])
) as Record<CareerCategoryId, string>;

/** @deprecated */
export const CAREER_SECTIONS: {
  id: CareerSectionId;
  label: string;
  hint: string;
}[] = [
  { id: "why-bamsignal", label: "Why BamSignal", hint: "Build an institution, not just an app." },
  { id: "our-mission", label: "Our Mission", hint: "Nigerian-first relationship discovery with legacy." },
  { id: "our-values", label: "Our Values", hint: "Integrity, discretion, and long-term stewardship." },
  { id: "open-roles", label: "Open Roles", hint: "Current opportunities across BamSignal." },
  { id: "culture", label: "Culture", hint: "How we work together as an institution." },
  { id: "benefits", label: "Benefits", hint: "Support for people building lasting work." },
  { id: "hiring-process", label: "Hiring Process", hint: "Transparent stages from application to offer." },
  {
    id: "future-opportunities",
    label: "Future Opportunities",
    hint: "Roles we are preparing for as BamSignal scales."
  }
];

/** @deprecated */
export const CAREERS_WHY_BAMSIGNAL = {
  title: "Why BamSignal",
  body: "BamSignal is evolving into an institution — a century-scale relationship platform rooted in Nigeria and trusted across the diaspora."
};

/** @deprecated */
export const CAREERS_MISSION = {
  title: "Our Mission",
  body: "Help Nigerians and the diaspora discover meaningful relationships with discretion, safety, and long-term legacy."
};

/** @deprecated */
export const CAREERS_BENEFITS: { title: string; body: string }[] = [
  {
    title: "Institution-scale impact",
    body: "Work on products and services designed for decades, not quarterly sprints."
  },
  {
    title: "Discretion by design",
    body: "Operate in environments where member trust and confidentiality are non-negotiable."
  },
  {
    title: "Nigeria-first, diaspora-aware",
    body: "Build for local context with global relationship corridors in view."
  }
];

/** @deprecated */
export const CAREERS_FUTURE_OPPORTUNITIES = [
  "Chief Relationship Officer",
  "Head of Diaspora Programs",
  "Director of Legacy Archives"
];

export const TALENT_RECRUITING_BRAND = "Talent Recruiting™";

/**
 * Applicant tracking, assessments, video interviews, and background verification
 * will plug into TalentRecruitingEngine when production-ready.
 */
export const TALENT_RECRUITING_FUTURE_KINDS = [
  { id: "applicant-tracking", label: "Applicant tracking" },
  { id: "assessments", label: "Assessments" },
  { id: "video-interviews", label: "Video interviews" },
  { id: "background-verification", label: "Background verification" }
] as const;
