import type {
  ConciergeConsultantActivity,
  ConciergeConsultantRecord,
  ConciergeScheduledMeeting
} from "../types/conciergeConsultantDirectory";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const CONCIERGE_DIRECTORY_SEED: ConciergeConsultantRecord[] = [
  {
    id: "consultant_ada",
    name: "Ada Okafor",
    email: "ada.okafor@bamsignal.com",
    phone: "+234 801 000 1001",
    status: "active",
    roles: ["relationship-consultant", "senior-matchmaker"],
    primaryRole: "senior-matchmaker",
    tierFocus: ["signature", "legacy", "global"],
    bio: "Leads Signature and Legacy introductions with calm, human guidance.",
    invitedAt: daysAgo(120),
    activatedAt: daysAgo(115),
    memberOwnershipPolicy: "bamsignal",
    createdAt: daysAgo(120),
    updatedAt: daysAgo(1)
  },
  {
    id: "consultant_emeka",
    name: "Emeka Nwosu",
    email: "emeka.nwosu@bamsignal.com",
    status: "active",
    roles: ["compatibility-specialist"],
    primaryRole: "compatibility-specialist",
    tierFocus: ["essential", "signature"],
    bio: "Reviews applications and compatibility signals before members enter active search.",
    invitedAt: daysAgo(90),
    activatedAt: daysAgo(88),
    memberOwnershipPolicy: "bamsignal",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3)
  },
  {
    id: "consultant_fatima",
    name: "Fatima Bello",
    email: "fatima.bello@bamsignal.com",
    status: "active",
    roles: ["family-values-advisor", "relationship-consultant"],
    primaryRole: "family-values-advisor",
    tierFocus: ["legacy"],
    bio: "Supports Legacy members with family alignment and values depth.",
    invitedAt: daysAgo(60),
    activatedAt: daysAgo(58),
    memberOwnershipPolicy: "bamsignal",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5)
  },
  {
    id: "consultant_james",
    name: "James Okonkwo",
    email: "james.okonkwo@bamsignal.com",
    status: "active",
    roles: ["diaspora-consultant", "senior-matchmaker"],
    primaryRole: "diaspora-consultant",
    tierFocus: ["global"],
    bio: "Guides Global members across UK, Canada, and Nigeria with relocation clarity.",
    invitedAt: daysAgo(45),
    activatedAt: daysAgo(44),
    memberOwnershipPolicy: "bamsignal",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2)
  },
  {
    id: "consultant_sola",
    name: "Sola Adeyemi",
    email: "sola.adeyemi@bamsignal.com",
    status: "invited",
    roles: ["relationship-consultant"],
    primaryRole: "relationship-consultant",
    tierFocus: ["essential", "signature"],
    invitedAt: daysAgo(2),
    memberOwnershipPolicy: "bamsignal",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  }
];

export const CONCIERGE_ACTIVITY_SEED: ConciergeConsultantActivity[] = [
  {
    id: "act_1",
    consultantId: "consultant_ada",
    consultantName: "Ada Okafor",
    memberId: "sc_member_amaka",
    memberName: "Amaka N.",
    type: "introduction-created",
    label: "Introduction created",
    detail: "Introduced to Chidi E.",
    actorId: "consultant_ada",
    actorName: "Ada Okafor",
    actorRole: "consultant",
    at: daysAgo(4)
  },
  {
    id: "act_2",
    consultantId: "consultant_ada",
    consultantName: "Ada Okafor",
    memberId: "sc_member_amaka",
    memberName: "Amaka N.",
    type: "note-added",
    label: "Note added",
    detail: "Strong communicator. Family-oriented.",
    actorId: "consultant_ada",
    actorName: "Ada Okafor",
    actorRole: "consultant",
    at: daysAgo(10)
  },
  {
    id: "act_3",
    consultantId: "consultant_emeka",
    consultantName: "Emeka Nwosu",
    memberId: "sc_member_tunde",
    memberName: "Tunde A.",
    type: "application-reviewed",
    label: "Application reviewed",
    detail: "Compatibility review completed.",
    actorId: "consultant_emeka",
    actorName: "Emeka Nwosu",
    actorRole: "consultant",
    at: daysAgo(8)
  },
  {
    id: "act_4",
    consultantId: "consultant_james",
    consultantName: "James Okonkwo",
    memberId: "sc_member_zara",
    memberName: "Zara M.",
    type: "relationship-update",
    label: "Relationship update",
    detail: "Moved to active search.",
    changes: "Status: under-review → active-search",
    actorId: "consultant_james",
    actorName: "James Okonkwo",
    actorRole: "consultant",
    at: daysAgo(5)
  },
  {
    id: "act_5",
    consultantId: "consultant_ada",
    consultantName: "Ada Okafor",
    memberId: "sc_member_chidi",
    memberName: "Chidi E.",
    type: "feedback-recorded",
    label: "Feedback recorded",
    detail: "Mutual interest confirmed.",
    actorId: "consultant_ada",
    actorName: "Ada Okafor",
    actorRole: "consultant",
    at: daysAgo(2)
  },
  {
    id: "act_6",
    consultantId: "consultant_james",
    consultantName: "James Okonkwo",
    memberId: "sc_member_zara",
    memberName: "Zara M.",
    type: "member-assigned",
    label: "Member assigned",
    detail: "Assigned to James Okonkwo for Global portfolio.",
    changes: "Consultant: Ada Okafor → James Okonkwo",
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin",
    at: daysAgo(20)
  },
  {
    id: "act_7",
    consultantId: "consultant_sola",
    consultantName: "Sola Adeyemi",
    type: "consultant-invited",
    label: "Consultant invited",
    detail: "Invitation sent to sola.adeyemi@bamsignal.com",
    actorId: "admin_ops",
    actorName: "BamSignal Admin",
    actorRole: "admin",
    at: daysAgo(2)
  }
];

export const CONCIERGE_MEETINGS_SEED: ConciergeScheduledMeeting[] = [
  {
    id: "meet_1",
    memberId: "sc_member_amaka",
    memberName: "Amaka N.",
    consultantId: "consultant_ada",
    channel: "zoom",
    scheduledAt: daysAgo(-3),
    notes: "Post-introduction check-in",
    loggedAt: daysAgo(1),
    loggedByConsultantId: "consultant_ada"
  },
  {
    id: "meet_2",
    memberId: "sc_member_zara",
    memberName: "Zara M.",
    consultantId: "consultant_james",
    channel: "microsoft-teams",
    scheduledAt: daysAgo(-5),
    notes: "Diaspora strategy session",
    loggedAt: daysAgo(2),
    loggedByConsultantId: "consultant_james"
  },
  {
    id: "meet_3",
    memberId: "sc_member_ife",
    memberName: "Ife O.",
    consultantId: "consultant_emeka",
    channel: "google-meet",
    scheduledAt: daysAgo(-2),
    notes: "First consultation",
    loggedAt: daysAgo(0),
    loggedByConsultantId: "consultant_emeka"
  }
];
