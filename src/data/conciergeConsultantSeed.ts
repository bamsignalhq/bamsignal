import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import { normalizeConciergeMember } from "../utils/conciergeMemberStewardship";

const CONSULTANT_ID = "consultant_ada";
const CONSULTANT_NAME = "Ada Okafor";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const RAW_CONCIERGE_SEED = [
  {
    id: "sc_member_amaka",
    journeyId: "BS-JR-2026-0001",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(1),
    status: "introductions-in-progress",
    preferredTier: "signature",
    consultationPreference: "whatsapp",
    consultationScheduledAt: daysAgo(14),
    aboutYou: {
      name: "Amaka N.",
      age: "31",
      gender: "Woman",
      city: "Lagos",
      occupation: "Brand strategist",
      education: "MBA",
      religion: "Christian",
      maritalStatus: "Never married",
      children: "Wants children in time"
    },
    relationshipGoals: {
      marriageTimeline: "Within 18–24 months",
      dealBreakers: "Dishonesty, smoking",
      partnerPreferences: "Grounded, emotionally mature, faith-aligned",
      familyGoals: "Marriage with intentional family planning"
    },
    valuesLifestyle: {
      faithImportance: "Central",
      smoking: "No",
      drinking: "Occasionally",
      fitness: "Regular walks and gym",
      travel: "Loves local travel and annual retreats",
      loveLanguage: "Quality time",
      threeWords: "Warm, thoughtful, driven"
    },
    story: {
      longFormStory:
        "I lead a full life in Lagos and want a partner who values depth over noise.",
      whatMakesYouUnique: "I build communities around faith and creativity.",
      whatYouHopeToBuild: "A calm, committed marriage with shared purpose."
    },
    voiceVibe: { completed: true, duration: 24, url: "" },
    videoIntro: { completed: true, duration: 58, url: "" },
    identity: { governmentIdNote: "Verified on file", selfieVerified: true, linkedIn: "linkedin.com/in/amaka" },
    photos: ["/images/placeholders/profile-1.jpg", "/images/placeholders/profile-2.jpg"],
    trustedMember: true,
    assignedConsultantId: CONSULTANT_ID,
    assignedConsultantName: CONSULTANT_NAME,
    currentConsultantId: CONSULTANT_ID,
    assignedBy: "BamSignal Admin",
    assignedAt: daysAgo(17),
    stewardshipHistory: [],
    communicationJournal: [
      {
        id: "comm_1",
        memberId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        consultantName: CONSULTANT_NAME,
        date: daysAgo(14),
        durationMinutes: 45,
        platform: "zoom",
        participants: ["Amaka N.", "Ada Okafor"],
        summary: "Initial consultation — clarified marriage timeline and family values.",
        outcome: "Member accepted into review",
        nextAction: "Profile review and introduction planning",
        loggedAt: daysAgo(14),
        loggedBy: CONSULTANT_NAME
      },
      {
        id: "comm_2",
        memberId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        consultantName: CONSULTANT_NAME,
        date: daysAgo(3),
        durationMinutes: 20,
        platform: "phone",
        participants: ["Amaka N.", "Ada Okafor"],
        summary: "Post-introduction check-in after Introduction #1.",
        outcome: "Both parties interested in continuing",
        nextAction: "Schedule follow-up after second conversation",
        loggedAt: daysAgo(3),
        loggedBy: CONSULTANT_NAME
      }
    ],
    consultantSummary: {
      lines: [
        "Looking for marriage within 2 years.",
        "Strong family values.",
        "Prefers Christian partner."
      ],
      source: "manual",
      updatedAt: daysAgo(6),
      updatedByConsultantId: CONSULTANT_ID
    },
    flags: ["high-priority", "family-involvement"],
    privateNotes: [
      {
        id: "note_1",
        memberId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        body: "Strong communicator. Family-oriented.",
        createdAt: daysAgo(10)
      },
      {
        id: "note_2",
        memberId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        body: "Not interested in smokers.",
        createdAt: daysAgo(6)
      }
    ],
    timeline: [
      {
        id: "tl_1",
        memberId: "sc_member_amaka",
        type: "application-received",
        label: "Application received",
        at: daysAgo(18)
      },
      {
        id: "tl_2",
        memberId: "sc_member_amaka",
        type: "consultation-completed",
        label: "Consultation completed",
        at: daysAgo(14)
      },
      {
        id: "tl_3",
        memberId: "sc_member_amaka",
        type: "profile-reviewed",
        label: "Profile reviewed",
        at: daysAgo(12)
      },
      {
        id: "tl_4",
        memberId: "sc_member_amaka",
        type: "introduction",
        label: "Introduction #1",
        at: daysAgo(4),
        detail: "Introduced to Chidi E."
      }
    ],
    introductions: [
      {
        id: "intro_1",
        memberId: "sc_member_amaka",
        introducedWithName: "Chidi E.",
        introducedWithId: "sc_member_chidi",
        consultantId: CONSULTANT_ID,
        date: daysAgo(4),
        outcome: "ongoing",
        notes: "Both responded warmly. Scheduling follow-up call."
      }
    ],
    followUpTasks: [
      {
        id: "task_1",
        memberId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        type: "check-in-after-introduction",
        title: "Check-in after introduction",
        dueAt: daysAgo(-2),
        completed: false,
        note: "Confirm both parties are comfortable continuing."
      }
    ]
  },
  {
    id: "sc_member_tunde",
    journeyId: "BS-JR-2026-0002",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(2),
    status: "under-review",
    preferredTier: "essential",
    consultationPreference: "google-meet",
    consultationScheduledAt: daysAgo(3),
    aboutYou: {
      name: "Tunde A.",
      age: "34",
      gender: "Man",
      city: "Abuja",
      occupation: "Civil engineer",
      education: "BEng",
      religion: "Christian",
      maritalStatus: "Never married",
      children: "Open to children"
    },
    relationshipGoals: {
      marriageTimeline: "Within 2 years",
      dealBreakers: "Games, inconsistency",
      partnerPreferences: "Kind, family-minded, Lagos or Abuja",
      familyGoals: "Steady home with faith at the center"
    },
    valuesLifestyle: {
      faithImportance: "Important",
      smoking: "No",
      drinking: "Rarely",
      fitness: "Weekend football",
      travel: "Regional travel",
      loveLanguage: "Acts of service",
      threeWords: "Steady, loyal, practical"
    },
    story: {
      longFormStory: "I value consistency and want marriage with clarity.",
      whatMakesYouUnique: "I mentor young professionals in my church.",
      whatYouHopeToBuild: "A marriage built on trust and routine affection."
    },
    voiceVibe: { completed: true, duration: 21, url: "" },
    videoIntro: { completed: true, duration: 45, url: "" },
    identity: { governmentIdNote: "Pending final review", selfieVerified: true },
    photos: ["/images/placeholders/profile-3.jpg"],
    trustedMember: false,
    assignedConsultantId: "consultant_emeka",
    assignedConsultantName: "Emeka Nwosu",
    flags: ["sensitive-case"],
    privateNotes: [
      {
        id: "note_3",
        memberId: "sc_member_tunde",
        consultantId: "consultant_emeka",
        body: "Prefers evening consultation calls.",
        createdAt: daysAgo(3)
      }
    ],
    timeline: [
      {
        id: "tl_5",
        memberId: "sc_member_tunde",
        type: "application-received",
        label: "Application received",
        at: daysAgo(9)
      },
      {
        id: "tl_6",
        memberId: "sc_member_tunde",
        type: "consultation-completed",
        label: "Consultation completed",
        at: daysAgo(3)
      }
    ],
    introductions: [],
    followUpTasks: [
      {
        id: "task_2",
        memberId: "sc_member_tunde",
        consultantId: "consultant_emeka",
        type: "needs-profile-update",
        title: "Needs profile update",
        dueAt: daysAgo(-1),
        completed: false,
        note: "Request clearer photo set before active search."
      }
    ]
  },
  {
    id: "sc_member_zara",
    journeyId: "BS-JR-2026-0003",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(5),
    status: "active-search",
    preferredTier: "global",
    consultationPreference: "zoom",
    aboutYou: {
      name: "Zara M.",
      age: "29",
      gender: "Woman",
      city: "London",
      occupation: "Healthcare analyst",
      education: "MSc",
      religion: "Muslim",
      maritalStatus: "Never married",
      children: "Wants children"
    },
    relationshipGoals: {
      marriageTimeline: "12–18 months",
      dealBreakers: "Disrespect toward family",
      partnerPreferences: "Nigerian diaspora, UK or Canada",
      familyGoals: "Marriage with cross-border planning"
    },
    valuesLifestyle: {
      faithImportance: "Central",
      smoking: "No",
      drinking: "No",
      fitness: "Pilates",
      travel: "Frequent UK–Nigeria travel",
      loveLanguage: "Words of affirmation",
      threeWords: "Gentle, ambitious, grounded"
    },
    story: {
      longFormStory: "I split time between London and Lagos family visits.",
      whatMakesYouUnique: "I bridge diaspora and home culture with ease.",
      whatYouHopeToBuild: "A marriage that can grow across borders thoughtfully."
    },
    voiceVibe: { completed: true, duration: 28, url: "" },
    videoIntro: { completed: true, duration: 60, url: "" },
    identity: { governmentIdNote: "UK ID verified", selfieVerified: true },
    photos: ["/images/placeholders/profile-4.jpg", "/images/placeholders/profile-5.jpg"],
    trustedMember: true,
    assignedConsultantId: "consultant_james",
    assignedConsultantName: "James Okonkwo",
    currentConsultantId: "consultant_james",
    assignedBy: "BamSignal Admin",
    assignedAt: daysAgo(24),
    reassignedAt: daysAgo(20),
    stewardshipHistory: [
      {
        id: "st_zara_1",
        fromConsultantId: CONSULTANT_ID,
        fromConsultantName: CONSULTANT_NAME,
        toConsultantId: "consultant_james",
        toConsultantName: "James Okonkwo",
        transferredBy: "BamSignal Admin",
        transferredAt: daysAgo(20),
        reason: "Continuity support — diaspora steward alignment",
        kind: "journey-transition",
        note: "Journey transitioned from Ada Okafor to James Okonkwo to ensure continuity and support."
      }
    ],
    communicationJournal: [
      {
        id: "comm_zara_1",
        memberId: "sc_member_zara",
        consultantId: "consultant_james",
        consultantName: "James Okonkwo",
        date: daysAgo(12),
        durationMinutes: 50,
        platform: "microsoft-teams",
        participants: ["Zara M.", "James Okonkwo"],
        summary: "Diaspora strategy session — UK and Nigeria alignment.",
        outcome: "Active search approved",
        nextAction: "Identify compatible diaspora introductions",
        loggedAt: daysAgo(12),
        loggedBy: "James Okonkwo"
      }
    ],
    consultantSummary: {
      lines: [
        "Open to relocation.",
        "High compatibility with diaspora professionals."
      ],
      source: "manual",
      updatedAt: daysAgo(8),
      updatedByConsultantId: "consultant_james"
    },
    flags: ["relocation", "diaspora", "high-priority"],
    privateNotes: [
      {
        id: "note_4",
        memberId: "sc_member_zara",
        consultantId: "consultant_james",
        body: "Prefers relocation within 24 months.",
        createdAt: daysAgo(8)
      }
    ],
    timeline: [
      {
        id: "tl_7",
        memberId: "sc_member_zara",
        type: "application-received",
        label: "Application received",
        at: daysAgo(25)
      },
      {
        id: "tl_8",
        memberId: "sc_member_zara",
        type: "profile-reviewed",
        label: "Profile reviewed",
        at: daysAgo(15)
      },
      {
        id: "tl_9",
        memberId: "sc_member_zara",
        type: "relationship-update",
        label: "Relationship update",
        at: daysAgo(5),
        detail: "Moved to active search."
      }
    ],
    introductions: [],
    followUpTasks: [
      {
        id: "task_3",
        memberId: "sc_member_zara",
        consultantId: "consultant_james",
        type: "pending-call",
        title: "Pending call",
        dueAt: daysAgo(-3),
        completed: false
      }
    ]
  },
  {
    id: "sc_member_chidi",
    journeyId: "BS-JR-2026-0004",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(7),
    status: "matched",
    preferredTier: "legacy",
    aboutYou: {
      name: "Chidi E.",
      age: "35",
      gender: "Man",
      city: "Lagos",
      occupation: "Product manager",
      education: "BSc",
      religion: "Christian",
      maritalStatus: "Never married",
      children: "Wants children"
    },
    relationshipGoals: {
      marriageTimeline: "Ready within a year",
      dealBreakers: "Ambiguity about commitment",
      partnerPreferences: "Warm, intelligent, Lagos-based",
      familyGoals: "Marriage and children with shared faith"
    },
    valuesLifestyle: {
      faithImportance: "Central",
      smoking: "No",
      drinking: "Social only",
      fitness: "Running",
      travel: "Enjoys Europe annually",
      loveLanguage: "Quality time",
      threeWords: "Calm, intentional, witty"
    },
    story: {
      longFormStory: "Ready for marriage and looking for a partner with emotional depth.",
      whatMakesYouUnique: "I communicate directly and kindly.",
      whatYouHopeToBuild: "A marriage with laughter and shared routines."
    },
    voiceVibe: { completed: true, duration: 26, url: "" },
    videoIntro: { completed: true, duration: 52, url: "" },
    identity: { governmentIdNote: "Verified", selfieVerified: true },
    photos: ["/images/placeholders/profile-6.jpg"],
    trustedMember: true,
    assignedConsultantId: CONSULTANT_ID,
    assignedConsultantName: CONSULTANT_NAME,
    flags: [],
    privateNotes: [],
    timeline: [
      {
        id: "tl_10",
        memberId: "sc_member_chidi",
        type: "introduction",
        label: "Introduction #1",
        at: daysAgo(4)
      },
      {
        id: "tl_11",
        memberId: "sc_member_chidi",
        type: "feedback-received",
        label: "Feedback received",
        at: daysAgo(2)
      },
      {
        id: "tl_12",
        memberId: "sc_member_chidi",
        type: "success-story",
        label: "Success story",
        at: daysAgo(1),
        detail: "Mutual interest confirmed — relationship update in progress."
      }
    ],
    introductions: [
      {
        id: "intro_2",
        memberId: "sc_member_chidi",
        introducedWithName: "Amaka N.",
        introducedWithId: "sc_member_amaka",
        consultantId: CONSULTANT_ID,
        date: daysAgo(4),
        outcome: "mutual-interest",
        notes: "Both requested continued guidance."
      }
    ],
    followUpTasks: []
  },
  {
    id: "sc_member_ife",
    journeyId: "BS-JR-2026-0005",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    status: "applied",
    preferredTier: "essential",
    aboutYou: {
      name: "Ife O.",
      age: "27",
      gender: "Woman",
      city: "Port Harcourt",
      occupation: "Architect",
      education: "BArch",
      religion: "Christian",
      maritalStatus: "Never married",
      children: "Undecided"
    },
    relationshipGoals: {
      marriageTimeline: "Exploring within 2–3 years",
      dealBreakers: "Disrespect",
      partnerPreferences: "Patient, kind, South-South or Lagos",
      familyGoals: "Open conversation before children"
    },
    valuesLifestyle: {
      faithImportance: "Important",
      smoking: "No",
      drinking: "No",
      fitness: "Swimming",
      travel: "Local exploration",
      loveLanguage: "Acts of service",
      threeWords: "Creative, calm, curious"
    },
    story: {
      longFormStory: "New to Signal Concierge and seeking thoughtful guidance.",
      whatMakesYouUnique: "I design spaces that feel like home.",
      whatYouHopeToBuild: "A relationship that grows slowly and sincerely."
    },
    voiceVibe: { completed: true, duration: 19, url: "" },
    videoIntro: { completed: false },
    identity: { governmentIdNote: "", selfieVerified: false },
    photos: [],
    trustedMember: false,
    assignedConsultantId: "consultant_emeka",
    assignedConsultantName: "Emeka Nwosu",
    flags: [],
    privateNotes: [],
    timeline: [
      {
        id: "tl_13",
        memberId: "sc_member_ife",
        type: "application-received",
        label: "Application received",
        at: daysAgo(4)
      }
    ],
    introductions: [],
    followUpTasks: [
      {
        id: "task_4",
        memberId: "sc_member_ife",
        consultantId: "consultant_emeka",
        type: "consultation-reminder",
        title: "Consultation reminder",
        dueAt: daysAgo(-1),
        completed: false,
        note: "Schedule first consultation."
      }
    ]
  }
];

export const CONCIERGE_CONSULTANT_SEED: ConciergeMemberRecord[] = RAW_CONCIERGE_SEED.map(
  (member) => normalizeConciergeMember(member as unknown as ConciergeMemberRecord)
);
