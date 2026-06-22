/** Careers & Talent System™ — public careers site content. */

export const CAREERS_BRAND = "Careers & Talent System™";
export const CAREERS_TITLE = "Careers at BamSignal";

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

export type CareerSectionId =
  | "why-bamsignal"
  | "our-mission"
  | "our-values"
  | "open-roles"
  | "culture"
  | "benefits"
  | "hiring-process"
  | "future-opportunities";

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

export const CAREERS_WHY_BAMSIGNAL = {
  title: "Why BamSignal",
  body: "BamSignal is evolving into an institution — a century-scale relationship platform rooted in Nigeria and trusted across the diaspora. We are building teams that steward real journeys, not vanity metrics."
};

export const CAREERS_MISSION = {
  title: "Our Mission",
  body: "Help Nigerians and the diaspora discover meaningful relationships with discretion, safety, and long-term legacy — supported by consultants, researchers, and community stewards who treat every journey with care."
};

export const CAREERS_BENEFITS: { title: string; body: string }[] = [
  { title: "Institution-scale impact", body: "Work on products and services designed for decades, not quarterly sprints." },
  { title: "Discretion by design", body: "Operate in environments where member trust and confidentiality are non-negotiable." },
  { title: "Nigeria-first, diaspora-aware", body: "Build for local context with global relationship corridors in view." },
  { title: "Growth paths", body: "Consultant, operations, research, and leadership tracks with clear progression." },
  { title: "Learning culture", body: "Access to BamSignal Institute resources, masterclasses, and internal research." },
  { title: "Flexible collaboration", body: "Hybrid and remote-friendly roles where the work allows it." }
];

export const CAREERS_FUTURE_OPPORTUNITIES = [
  "Chief Relationship Officer",
  "Head of Diaspora Programs",
  "Director of Legacy Archives",
  "Principal Research Scientist",
  "Head of Trust & Safety Operations",
  "VP of Member Experience"
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
