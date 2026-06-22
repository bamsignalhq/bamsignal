import type { IntroductionRecord } from "../types/conciergeIntroduction";

const CONSULTANT_ID = "consultant_ada";
const CONSULTANT_PREVIEW_PLACEHOLDER =
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

export const CONCIERGE_INTRODUCTION_SEED: IntroductionRecord[] = [
  {
    id: "intro_engine_amaka_chidi",
    memberAId: "sc_member_amaka",
    memberBId: "sc_member_chidi",
    consultantId: CONSULTANT_ID,
    tier: "signature",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    status: "conversation-started",
    notes: "Strong values alignment. Both prefer Lagos-based courtship with faith at the center.",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote:
      "I believe your shared values and relationship goals may make for a meaningful conversation.",
    memberBPreviewNote:
      "I believe your shared values and relationship goals may make for a meaningful conversation.",
    memberAApproved: true,
    memberBApproved: true,
    followUpDate: daysFromNow(6),
    followUpInterval: "7-days",
    successProbability: 82,
    internalFlags: ["high-priority", "family-involvement"],
    outcome: "conversation-ongoing",
    bothConsented: true,
    feedback: [
      {
        id: "fb_1",
        at: daysAgo(2),
        author: "consultant",
        body: "Both members responded warmly after the introduction.",
        followUpNotes: "Schedule a gentle 7-day check-in."
      }
    ],
    history: [
      {
        id: "ih_1",
        at: daysAgo(6),
        label: "Candidate identified",
        detail: "Consultant review started"
      },
      {
        id: "ih_2",
        at: daysAgo(5),
        label: "Member approvals received",
        detail: "Mutual consent confirmed"
      },
      {
        id: "ih_3",
        at: daysAgo(4),
        label: "Introduction scheduled"
      },
      {
        id: "ih_4",
        at: daysAgo(3),
        label: "Conversation started",
        outcome: "conversation-ongoing"
      }
    ]
  },
  {
    id: "intro_engine_zara_tunde",
    memberAId: "sc_member_zara",
    memberBId: "sc_member_tunde",
    consultantId: CONSULTANT_ID,
    tier: "global",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    status: "member-b-approval",
    notes: "Cross-border consideration. Proceed only if both are open to diaspora planning.",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote:
      "I believe your shared values and relationship goals may make for a meaningful conversation.",
    memberBPreviewNote:
      "I believe your shared values and relationship goals may make for a meaningful conversation.",
    memberAApproved: true,
    memberBApproved: null,
    followUpDate: daysFromNow(4),
    followUpInterval: "7-days",
    successProbability: 64,
    internalFlags: ["diaspora", "relocation"],
    bothConsented: false,
    feedback: [],
    history: [
      {
        id: "ih_5",
        at: daysAgo(3),
        label: "Candidate identified"
      },
      {
        id: "ih_6",
        at: daysAgo(2),
        label: "Consultant review completed"
      },
      {
        id: "ih_7",
        at: daysAgo(1),
        label: "Member A approval received"
      }
    ]
  },
  {
    id: "intro_engine_ife_review",
    memberAId: "sc_member_ife",
    memberBId: "sc_member_tunde",
    consultantId: CONSULTANT_ID,
    tier: "essential",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    status: "consultant-review",
    notes: "Early candidate. Await video completion before member outreach.",
    consultantMessage:
      "I'd love to introduce you to someone I believe you may enjoy getting to know.\n\nWould you be open to learning more?",
    memberAPreviewNote: CONSULTANT_PREVIEW_PLACEHOLDER,
    memberBPreviewNote: CONSULTANT_PREVIEW_PLACEHOLDER,
    memberAApproved: null,
    memberBApproved: null,
    successProbability: 48,
    internalFlags: ["sensitive-case"],
    bothConsented: false,
    feedback: [],
    history: [
      {
        id: "ih_8",
        at: daysAgo(1),
        label: "Candidate identified"
      }
    ]
  }
];
