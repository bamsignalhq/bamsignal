import type { IntroductionRecord } from "../types/conciergeIntroduction";

const CONSULTANT_ID = "consultant_ada";
const CONSULTANT_NAME = "Ada Okafor";
const CONSULTANT_PREVIEW =
  "I believe your shared values and relationship goals may make for a meaningful conversation.";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const compatibilityBase = {
  faith: "Christian / Christian",
  lifestyle: "Active · Active",
  marriageTimeline: "Within 2 years / Within 2 years",
  familyValues: "Very important · Very important",
  childrenPreference: "Want children / Want children",
  careerCompatibility: "Marketing Manager / Software Engineer",
  location: "Lagos / Lagos",
  relocationOpenness: "Same city preference",
  communicationStyle: "Direct / Thoughtful",
  loveLanguage: "Quality time · Acts of service",
  dealBreakers: "Dishonesty · Lack of faith"
};

export const CONCIERGE_INTRODUCTION_SEED: IntroductionRecord[] = [
  {
    id: "intro_engine_amaka_chidi",
    introductionId: "BS-IN-2026-0001",
    memberAId: "sc_member_amaka",
    memberBId: "sc_member_chidi",
    journeyAId: "BS-JR-2026-0001",
    journeyBId: "BS-JR-2026-0002",
    consultantId: CONSULTANT_ID,
    consultantName: CONSULTANT_NAME,
    tier: "signature",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    status: "active-conversation",
    pipelinePhase: "introduction-made",
    notes: "Strong values alignment. Both prefer Lagos-based courtship with faith at the center.",
    matchNotes: [
      "Strong values alignment.",
      "Both family-oriented.",
      "Strong communication styles."
    ],
    connectionReasons: [
      "Both value faith.",
      "Both are family-oriented.",
      "Similar marriage goals.",
      "Enjoy meaningful conversations."
    ],
    compatibilitySummary: "Shared faith, family values, marriage timeline alignment.",
    confidenceLevel: "strong-fit",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote: CONSULTANT_PREVIEW,
    memberBPreviewNote: CONSULTANT_PREVIEW,
    memberAApproved: true,
    memberBApproved: true,
    memberAPresentedAt: daysAgo(5),
    memberBPresentedAt: daysAgo(4),
    followUpDate: daysFromNow(6),
    followUpInterval: "7-days",
    compatibility: compatibilityBase,
    internalFlags: ["high-priority", "family-involvement"],
    outcome: "still-talking",
    bothConsented: true,
    isInternalCandidate: false,
    feedback: [
      {
        id: "fb_1",
        at: daysAgo(2),
        author: "consultant",
        body: "Both members responded warmly after the introduction.",
        category: "strong-alignment",
        followUpNotes: "Schedule a gentle 7-day check-in."
      }
    ],
    history: [
      { id: "ih_1", at: daysAgo(6), label: "Candidate Identified", pipelinePhase: "candidate-identified" },
      { id: "ih_2", at: daysAgo(5), label: "Presented", detail: "Member A", pipelinePhase: "member-a-presented" },
      { id: "ih_3", at: daysAgo(4), label: "Presented", detail: "Member B", pipelinePhase: "member-b-presented" },
      { id: "ih_4", at: daysAgo(4), label: "Accepted", detail: "Mutual acceptance confirmed", pipelinePhase: "mutual-acceptance" },
      { id: "ih_5", at: daysAgo(3), label: "Introduction Made", pipelinePhase: "introduction-made" }
    ]
  },
  {
    id: "intro_engine_zara_tunde",
    introductionId: "BS-IN-2026-0002",
    memberAId: "sc_member_zara",
    memberBId: "sc_member_tunde",
    journeyAId: "BS-JR-2026-0003",
    journeyBId: "BS-JR-2026-0004",
    consultantId: CONSULTANT_ID,
    consultantName: CONSULTANT_NAME,
    tier: "global",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    status: "awaiting-response",
    pipelinePhase: "member-b-presented",
    notes: "Cross-border consideration. Proceed only if both are open to diaspora planning.",
    matchNotes: ["Open to relocation.", "Strong values alignment.", "Good long-term outlook."],
    connectionReasons: [
      "Both value faith.",
      "Open to relocation.",
      "Love travelling.",
      "Strong communication styles."
    ],
    compatibilitySummary: "Shared faith with cross-border relocation review.",
    confidenceLevel: "promising",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote: CONSULTANT_PREVIEW,
    memberBPreviewNote: CONSULTANT_PREVIEW,
    memberAApproved: true,
    memberBApproved: null,
    memberAPresentedAt: daysAgo(1),
    followUpDate: daysFromNow(4),
    followUpInterval: "7-days",
    compatibility: {
      ...compatibilityBase,
      lifestyle: "Moderate · Active",
      marriageTimeline: "Within 3 years / Within 2 years",
      careerCompatibility: "Finance Analyst / Product Designer",
      location: "London / Lagos",
      relocationOpenness: "Open to relocation"
    },
    internalFlags: ["diaspora", "relocation"],
    bothConsented: false,
    isInternalCandidate: false,
    feedback: [],
    history: [
      { id: "ih_6", at: daysAgo(3), label: "Candidate Identified", pipelinePhase: "candidate-identified" },
      { id: "ih_7", at: daysAgo(2), label: "Compatibility Review", pipelinePhase: "compatibility-review" },
      { id: "ih_8", at: daysAgo(1), label: "Presented", detail: "Member A", pipelinePhase: "member-a-presented" }
    ]
  },
  {
    id: "intro_engine_ife_review",
    introductionId: "BS-IN-2026-0003",
    memberAId: "sc_member_ife",
    memberBId: "sc_member_tunde",
    journeyAId: "BS-JR-2026-0005",
    journeyBId: "BS-JR-2026-0004",
    consultantId: CONSULTANT_ID,
    consultantName: CONSULTANT_NAME,
    tier: "essential",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    status: "compatibility-review",
    pipelinePhase: "compatibility-review",
    notes: "Early candidate. Await video completion before member outreach.",
    matchNotes: ["Strong communication styles."],
    connectionReasons: ["Similar marriage goals.", "Enjoy meaningful conversations."],
    compatibilitySummary: "Thoughtful Journey Match under consultant review.",
    confidenceLevel: "worth-exploring",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote: CONSULTANT_PREVIEW,
    memberBPreviewNote: CONSULTANT_PREVIEW,
    memberAApproved: null,
    memberBApproved: null,
    compatibility: {
      ...compatibilityBase,
      lifestyle: "Moderate · Active",
      marriageTimeline: "Flexible / Within 2 years",
      careerCompatibility: "Teacher / Product Designer",
      location: "Abuja / Lagos",
      relocationOpenness: "Cross-city — review relocation openness",
      communicationStyle: "Reserved / Direct"
    },
    internalFlags: ["sensitive-case"],
    bothConsented: false,
    isInternalCandidate: true,
    feedback: [],
    history: [
      { id: "ih_9", at: daysAgo(1), label: "Candidate Identified", pipelinePhase: "candidate-identified" }
    ]
  }
];
