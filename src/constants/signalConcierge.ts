export const SIGNAL_CONCIERGE_BRAND = "Signal Concierge™";

export const SIGNAL_CONCIERGE_LANDING_HEADLINE = "Signal Concierge™";
export const SIGNAL_CONCIERGE_LANDING_SUBTEXT =
  "Human-led matchmaking for people seeking meaningful relationships and, in time, marriage.";

export const SIGNAL_CONCIERGE_HERO_TAG = "Private by design";

export const SIGNAL_CONCIERGE_CONFIDENTIALITY_HEADLINE = "Private by design";
export const SIGNAL_CONCIERGE_CONFIDENTIALITY_BODY =
  "Members are introduced confidentially and are never displayed publicly.";
export const SIGNAL_CONCIERGE_CONFIDENTIALITY_NOTE = "Introductions happen only with consent.";

export const SIGNAL_CONCIERGE_PRIVATE_HEADLINE = SIGNAL_CONCIERGE_CONFIDENTIALITY_HEADLINE;
export const SIGNAL_CONCIERGE_PRIVATE_BODY = SIGNAL_CONCIERGE_CONFIDENTIALITY_BODY;

export const SIGNAL_CONCIERGE_CTA_PRIMARY = "Schedule Consultation";
export const SIGNAL_CONCIERGE_CTA_SECONDARY = "Learn More";

export const SIGNAL_CONCIERGE_BEFORE_CONTINUE_TITLE = "Before You Continue";
export const SIGNAL_CONCIERGE_BEFORE_CONTINUE_BODY =
  "Signal Concierge is a confidential, human-led matchmaking service.\n\nA consultation helps us understand your goals and determine whether we're the right fit for each other.";
export const SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE = "Consultation Fee";
export const SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL = SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE;
export const SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT = "₦100,000";
export const SIGNAL_CONCIERGE_MEMBERSHIP_FROM = "Membership plans begin from ₦100,000.";
export const SIGNAL_CONCIERGE_PAYMENT_NOTE =
  "Payment is only requested once you're comfortable moving forward.";
export const SIGNAL_CONCIERGE_NO_OBLIGATION_NOTE =
  "There is no obligation to continue after your consultation.";
export const SIGNAL_CONCIERGE_MAYBE_LATER = "Maybe Later";

export const SIGNAL_CONCIERGE_EXPECTATIONS_TITLE = "What to expect";
export const SIGNAL_CONCIERGE_EXPECTATIONS = [
  "A private conversation",
  "Questions are welcome",
  "No pressure",
  "No obligation",
  "Human guidance"
] as const;

export const SIGNAL_CONCIERGE_CONSULTATION_TIMING = "30–45 minutes";

export const SIGNAL_CONCIERGE_NO_PRESSURE_HEADLINE = "Take your time";
export const SIGNAL_CONCIERGE_NO_PRESSURE_BODY =
  "Finding the right person is important.\n\nWe're happy to answer your questions and help you decide whether Signal Concierge is right for you.";

export const SIGNAL_CONCIERGE_NEXT_STEP_HEADLINE = "Ready to finally meet your match?";
export const SIGNAL_CONCIERGE_NEXT_STEP_SUBTEXT =
  "Tell us a little about yourself.\n\nIf we're the right fit for each other, your consultant will be in touch.";

export const SIGNAL_CONCIERGE_PROCESS = [
  { id: "consultation", step: 1, title: "Consultation", detail: "30–45 minutes" },
  { id: "review", step: 2, title: "Compatibility Review", detail: "Values, goals and lifestyle." },
  { id: "search", step: 3, title: "Private Search", detail: "No browsing.\nNo swiping." },
  { id: "introductions", step: 4, title: "Introductions", detail: "Only when both parties agree." }
] as const;

export type SignalConciergeTierId = "essential" | "signature" | "legacy" | "global";

export type SignalConciergeTier = {
  id: SignalConciergeTierId;
  name: string;
  landingName: string;
  tagline: string;
  priceLabel: string;
  priceKobo: number;
  benefits: string[];
  regions?: string[];
};

export const SIGNAL_CONCIERGE_TIERS: SignalConciergeTier[] = [
  {
    id: "essential",
    name: "Signal Concierge Essential™",
    landingName: "Essential™",
    tagline: "Thoughtfully Guided",
    priceLabel: "₦100,000",
    priceKobo: 10_000_000,
    benefits: [
      "Compatibility profile",
      "Consultant review",
      "Voice Vibe review",
      "Video review",
      "Curated introductions",
      "WhatsApp support",
      "One introduction monthly"
    ]
  },
  {
    id: "signature",
    name: "Signal Concierge Signature™",
    landingName: "Signature™",
    tagline: "Personally Curated",
    priceLabel: "₦300,000",
    priceKobo: 30_000_000,
    benefits: [
      "Everything in Essential",
      "Dedicated consultant",
      "Priority search",
      "Monthly strategy sessions",
      "Three introductions monthly",
      "Enhanced compatibility review"
    ]
  },
  {
    id: "legacy",
    name: "Signal Concierge Legacy™",
    landingName: "Legacy™",
    tagline: "White-Glove Matchmaking",
    priceLabel: "₦600,000",
    priceKobo: 60_000_000,
    benefits: [
      "Everything in Signature",
      "Senior consultant",
      "Unlimited active search",
      "Family value alignment",
      "Priority introductions",
      "Concierge follow-up"
    ]
  },
  {
    id: "global",
    name: "Signal Concierge Global™",
    landingName: "Global™",
    tagline: "Worldwide Introductions",
    priceLabel: "₦1,000,000",
    priceKobo: 100_000_000,
    regions: ["Nigeria", "Ghana", "UK", "USA", "Canada"],
    benefits: [
      "Diaspora compatibility",
      "Relocation goals",
      "Cross-border introductions",
      "Senior consultants",
      "Worldwide introduction planning"
    ]
  }
];

export const SIGNAL_CONCIERGE_PROMISES = [
  {
    id: "selective",
    title: "Selective by Design",
    body: "We work with a limited number of members at a time."
  },
  {
    id: "private",
    title: "Private by Default",
    body: "Your information is never displayed publicly."
  },
  {
    id: "human",
    title: "Human Every Step",
    body: "Every introduction is guided by a real consultant."
  },
  {
    id: "intention",
    title: "Built for Intention",
    body: "Designed for people seeking meaningful relationships and, in time, marriage."
  }
] as const;

export type SignalConciergeStatus =
  | "applied"
  | "consultation-scheduled"
  | "under-review"
  | "accepted"
  | "waitlisted"
  | "active-search"
  | "introductions-in-progress"
  | "matched"
  | "paused"
  | "closed";

export const SIGNAL_CONCIERGE_STATUS_LABELS: Record<SignalConciergeStatus, string> = {
  applied: "Applied",
  "consultation-scheduled": "Consultation Scheduled",
  "under-review": "Under Review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  "active-search": "Active Search",
  "introductions-in-progress": "Introductions In Progress",
  matched: "Matched",
  paused: "Paused",
  closed: "Closed"
};

export type SignalConciergeConsultationChannel = "whatsapp" | "phone" | "google-meet" | "zoom";

export const SIGNAL_CONCIERGE_CONSULTATION_CHANNELS: {
  id: SignalConciergeConsultationChannel;
  label: string;
}[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "phone", label: "Phone Call" },
  { id: "google-meet", label: "Google Meet" },
  { id: "zoom", label: "Zoom" }
];

export const SIGNAL_CONCIERGE_FAQ = [
  {
    question: "What is Signal Concierge?",
    answer:
      "Signal Concierge™ is BamSignal's human-led matchmaking service for people seeking meaningful relationships and, in time, marriage. Introductions are private, consent-based, and guided by real consultants."
  },
  {
    question: "Will my profile appear on Discover?",
    answer:
      "No. Signal Concierge members exist outside the public BamSignal ecosystem. Your information is never displayed publicly."
  },
  {
    question: "How does the consultation work?",
    answer:
      "A consultation helps us understand your goals, values, and preferences. The consultation fee is ₦100,000. Payment is only requested once you're comfortable moving forward."
  },
  {
    question: "Can I apply without a membership tier?",
    answer:
      "Yes. You may begin with a consultation. Membership plans begin from ₦100,000 and are discussed after your consultation."
  },
  {
    question: "Do you offer worldwide introductions?",
    answer:
      "Signal Concierge Global™ supports diaspora compatibility and cross-border introductions across Nigeria, Ghana, the UK, USA, and Canada."
  }
] as const;

/** Reserved for future products — not implemented. */
export type SignalConciergeFutureTier =
  | "relationship-consultants"
  | "compatibility-specialists"
  | "family-value-advisors"
  | "senior-matchmakers"
  | "diaspora-consultants"
  | "private-events"
  | "success-stories"
  | "relationship-coaching";

export type SignalConciergeFutureConfig = {
  tier?: SignalConciergeFutureTier;
  consultantId?: string;
  eventId?: string;
};
