import type {
  CareerRoleRecord,
  CultureHighlight,
  HiringProcessStep,
  ValueHighlight
} from "../types/careers";

export const CAREER_ROLES_SEED: CareerRoleRecord[] = [
  {
    id: "role_relationship_consultant",
    slug: "relationship-consultant",
    title: "Relationship Consultant",
    categoryId: "signal-concierge",
    location: "Lagos",
    employmentType: "Full-time",
    summary: "Guide members through discreet concierge journeys with empathy and judgment.",
    responsibilities: [
      "Conduct structured consultations and journey reviews",
      "Coordinate with operations on scheduling and follow-up",
      "Maintain confidentiality across every member interaction"
    ],
    qualifications: [
      "Experience in counseling, coaching, or premium client services",
      "Strong emotional intelligence and discretion",
      "Comfort with Nigerian relationship context and diaspora corridors"
    ],
    featured: true
  },
  {
    id: "role_senior_matchmaker",
    slug: "senior-matchmaker",
    title: "Senior Matchmaker",
    categoryId: "signal-concierge",
    location: "Hybrid",
    employmentType: "Full-time",
    summary: "Lead compatibility reviews and introduction decisions for premium journeys.",
    responsibilities: [
      "Review candidate pairings and compatibility signals",
      "Partner with consultants on introduction strategy",
      "Mentor junior matchmakers on quality standards"
    ],
    qualifications: [
      "Five or more years in matchmaking or relationship advisory",
      "Track record of high-trust client outcomes",
      "Excellent written and verbal communication"
    ],
    featured: true
  },
  {
    id: "role_compatibility_specialist",
    slug: "compatibility-specialist",
    title: "Compatibility Specialist",
    categoryId: "signal-concierge",
    location: "Remote",
    employmentType: "Full-time",
    summary: "Translate member profiles and values into thoughtful compatibility assessments.",
    responsibilities: [
      "Evaluate profile depth, intent, and values alignment",
      "Document compatibility rationale for internal review",
      "Collaborate with research on scoring improvements"
    ],
    qualifications: [
      "Analytical mindset with human-centered judgment",
      "Experience in assessment, HR, or relationship services",
      "Attention to detail and structured note-taking"
    ],
    featured: false
  },
  {
    id: "role_family_values_advisor",
    slug: "family-values-advisor",
    title: "Family Values Advisor",
    categoryId: "signal-concierge",
    location: "Lagos",
    employmentType: "Full-time",
    summary: "Support journeys where family values and faith context require careful stewardship.",
    responsibilities: [
      "Advise consultants on family-aligned introductions",
      "Facilitate respectful conversations across value systems",
      "Contribute to BamSignal family advisory playbooks"
    ],
    qualifications: [
      "Background in family counseling, faith leadership, or community mediation",
      "Cultural fluency across Nigerian family structures",
      "High discretion and neutrality"
    ],
    featured: false
  },
  {
    id: "role_diaspora_consultant",
    slug: "diaspora-consultant",
    title: "Diaspora Consultant",
    categoryId: "signal-concierge",
    location: "Remote",
    employmentType: "Full-time",
    summary: "Serve members navigating long-distance and corridor relationships.",
    responsibilities: [
      "Support diaspora members across time zones",
      "Coordinate with events and community stewards",
      "Advise on corridor-specific relationship dynamics"
    ],
    qualifications: [
      "Lived experience across Nigeria and diaspora markets",
      "Strong async communication habits",
      "Consulting or community leadership background"
    ],
    featured: true
  },
  {
    id: "role_operations_coordinator",
    slug: "operations-coordinator",
    title: "Operations Coordinator",
    categoryId: "operations",
    location: "Lagos",
    employmentType: "Full-time",
    summary: "Keep concierge operations moving — scheduling, assignments, and follow-up.",
    responsibilities: [
      "Monitor operations center queues and escalations",
      "Coordinate consultant assignments and calendars",
      "Document operational handoffs with clarity"
    ],
    qualifications: [
      "Operations or project coordination experience",
      "Calm under pressure with multiple priorities",
      "Familiarity with CRM-style workflows"
    ],
    featured: true
  },
  {
    id: "role_research_associate",
    slug: "research-associate",
    title: "Research Associate",
    categoryId: "research",
    location: "Hybrid",
    employmentType: "Full-time",
    summary: "Contribute to BamSignal Institute research and relationship insights.",
    responsibilities: [
      "Support qualitative and quantitative relationship studies",
      "Prepare insight briefs for product and concierge teams",
      "Maintain research ethics and anonymization standards"
    ],
    qualifications: [
      "Degree in social science, data, or related field",
      "Strong synthesis and writing skills",
      "Interest in African relationship dynamics"
    ],
    featured: false
  },
  {
    id: "role_community_steward",
    slug: "community-steward",
    title: "Community Steward",
    categoryId: "community",
    location: "Hybrid",
    employmentType: "Full-time",
    summary: "Grow trusted city and diaspora communities around BamSignal values.",
    responsibilities: [
      "Host and support community gatherings",
      "Identify ambassadors and local partners",
      "Feed community signals back to product and events"
    ],
    qualifications: [
      "Community building or events experience",
      "Strong local network in target city or corridor",
      "Alignment with BamSignal safety and discretion standards"
    ],
    featured: false
  },
  {
    id: "role_customer_support_specialist",
    slug: "customer-support-specialist",
    title: "Customer Support Specialist",
    categoryId: "customer-support",
    location: "Lagos",
    employmentType: "Full-time",
    summary: "Deliver calm, member-first support across the BamSignal experience.",
    responsibilities: [
      "Resolve member questions with clarity and empathy",
      "Escalate trust, safety, and payment issues appropriately",
      "Document patterns for product and operations improvement"
    ],
    qualifications: [
      "Customer support or member services experience",
      "Excellent written English and patience",
      "Comfort with username + PIN login context"
    ],
    featured: false
  },
  {
    id: "role_executive_assistant",
    slug: "executive-assistant",
    title: "Executive Assistant",
    categoryId: "leadership",
    location: "Lagos",
    employmentType: "Full-time",
    summary: "Support leadership with discretion as BamSignal scales institution-wide.",
    responsibilities: [
      "Manage leadership calendars and confidential correspondence",
      "Coordinate cross-functional meetings and follow-ups",
      "Prepare briefing materials for strategic decisions"
    ],
    qualifications: [
      "Executive assistant or chief of staff experience",
      "Exceptional organization and confidentiality",
      "Professional polish in high-trust environments"
    ],
    featured: false
  }
];

export const CULTURE_HIGHLIGHTS_SEED: CultureHighlight[] = [
  {
    id: "culture_discretion",
    title: "Discretion first",
    body: "We protect member stories the way we would want our own protected — in product, in meetings, and in how we hire."
  },
  {
    id: "culture_stewardship",
    title: "Stewardship over speed",
    body: "Relationships unfold on human timelines. We optimize for care, not churn."
  },
  {
    id: "culture_institution",
    title: "Institution mindset",
    body: "We document, refine, and build systems that outlast any single launch cycle."
  },
  {
    id: "culture_nigeria",
    title: "Nigeria-first craft",
    body: "Our teams understand local context — cities, families, faith, and diaspora corridors — without stereotype."
  },
  {
    id: "culture_learning",
    title: "Continuous learning",
    body: "Consultants, researchers, and operators share insight through BamSignal Institute channels."
  },
  {
    id: "culture_accountability",
    title: "Quiet accountability",
    body: "We give direct feedback, own outcomes, and celebrate legacy milestones — not vanity metrics."
  }
];

export const VALUES_HIGHLIGHTS_SEED: ValueHighlight[] = [
  {
    id: "value_integrity",
    title: "Integrity",
    body: "We tell the truth to members, candidates, and each other — especially when it is uncomfortable."
  },
  {
    id: "value_discretion",
    title: "Discretion",
    body: "Confidentiality is a product feature and a cultural requirement."
  },
  {
    id: "value_legacy",
    title: "Legacy",
    body: "We design for relationships that last years and decades, not swipes."
  },
  {
    id: "value_excellence",
    title: "Excellence",
    body: "Compact, fintech-grade craft applies to public pages, member UI, and how we run interviews."
  },
  {
    id: "value_stewardship",
    title: "Stewardship",
    body: "Every role — consultant, researcher, steward — is a caretaker of someone’s journey."
  },
  {
    id: "value_inclusion",
    title: "Thoughtful inclusion",
    body: "We welcome diverse backgrounds while respecting the values members choose for themselves."
  }
];

export const HIRING_PROCESS_STEPS_SEED: HiringProcessStep[] = [
  {
    id: "step_apply",
    order: 1,
    title: "Apply",
    body: "Submit your application for an open role. We review every submission — no black-box bots."
  },
  {
    id: "step_screen",
    order: 2,
    title: "Screening",
    body: "A talent partner reviews your experience, values alignment, and role fit."
  },
  {
    id: "step_interview",
    order: 3,
    title: "Interviews",
    body: "Structured conversations with the hiring manager and cross-functional partners."
  },
  {
    id: "step_assessment",
    order: 4,
    title: "Work sample",
    body: "Role-relevant exercise — case study, writing sample, or operational scenario."
  },
  {
    id: "step_offer",
    order: 5,
    title: "Offer",
    body: "Clear offer terms, start date, and onboarding plan."
  },
  {
    id: "step_onboard",
    order: 6,
    title: "Onboarding",
    body: "Institution onboarding — tools, values, confidentiality, and your first 30-day goals."
  }
];
