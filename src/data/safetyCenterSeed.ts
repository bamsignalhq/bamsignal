import type { SafetyCaseRecord } from "../types/safetyCenter";

export const SAFETY_CASES_SEED: SafetyCaseRecord[] = [
  {
    id: "safety_001",
    caseRef: "CASE-2026-0041",
    caseTypeId: "harassment",
    severity: "high",
    status: "investigating",
    reportedAt: "2026-06-20T14:30:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_tunde_emeka",
    subjectLabel: "Tunde Emeka",
    investigator: "ada@bamsignal.com",
    summary: "Repeated unsolicited messages after block request in chat thread.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_ngozi_ade",
        timestamp: "2026-06-20T14:30:00.000Z",
        note: "Initial harassment report filed via member safety channel.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-20T15:00:00.000Z",
        note: "Chat transcript review started.",
        fromStatus: "reported",
        toStatus: "investigating"
      }
    ]
  },
  {
    id: "safety_002",
    caseRef: "CASE-2026-0042",
    caseTypeId: "fraud",
    severity: "critical",
    status: "action-required",
    reportedAt: "2026-06-21T09:00:00.000Z",
    reportedBy: "member_chidi_oka",
    subjectRef: "member_fake_profile_882",
    subjectLabel: "Unknown profile",
    investigator: "ngozi@bamsignal.com",
    summary: "Suspected romance scam requesting off-platform wire transfer.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_chidi_oka",
        timestamp: "2026-06-21T09:00:00.000Z",
        note: "Fraud report with screenshot evidence.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-21T09:30:00.000Z",
        note: "Payment pattern review initiated.",
        fromStatus: "reported",
        toStatus: "investigating"
      },
      {
        id: "safety_tl_0003",
        workflow: "require-action",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-21T10:00:00.000Z",
        note: "Critical fraud pattern — senior action required.",
        fromStatus: "investigating",
        toStatus: "action-required"
      }
    ]
  },
  {
    id: "safety_003",
    caseRef: "CASE-2026-0043",
    caseTypeId: "catfishing",
    severity: "medium",
    status: "resolved",
    reportedAt: "2026-06-18T11:00:00.000Z",
    reportedBy: "member_amara_di",
    subjectRef: "member_profile_441",
    subjectLabel: "Profile 441",
    investigator: "chidi@bamsignal.com",
    summary: "Profile photos inconsistent with verification selfie.",
    actionsTaken: ["suspension"],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_amara_di",
        timestamp: "2026-06-18T11:00:00.000Z",
        note: "Catfishing concern reported.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-18T12:00:00.000Z",
        note: "Photo comparison review.",
        fromStatus: "reported",
        toStatus: "investigating"
      },
      {
        id: "safety_tl_0003",
        workflow: "apply-action",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-19T15:00:00.000Z",
        note: "Profile suspended pending re-verification.",
        fromStatus: "investigating",
        toStatus: "investigating",
        actionId: "suspension"
      },
      {
        id: "safety_tl_0004",
        workflow: "resolve",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-19T16:00:00.000Z",
        note: "Case resolved after suspension applied.",
        fromStatus: "investigating",
        toStatus: "resolved"
      }
    ]
  },
  {
    id: "safety_004",
    caseRef: "CASE-2026-0044",
    caseTypeId: "identity-concerns",
    severity: "high",
    status: "investigating",
    reportedAt: "2026-06-22T08:00:00.000Z",
    reportedBy: "consultant_ada_okafor",
    subjectRef: "member_identity_229",
    subjectLabel: "Member 229",
    investigator: null,
    summary: "Duplicate account indicators across two usernames.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "consultant_ada_okafor",
        timestamp: "2026-06-22T08:00:00.000Z",
        note: "Consultant flagged identity concern during intake.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-22T08:30:00.000Z",
        note: "Cross-reference check started.",
        fromStatus: "reported",
        toStatus: "investigating"
      }
    ]
  },
  {
    id: "safety_005",
    caseRef: "CASE-2026-0045",
    caseTypeId: "abusive-behaviour",
    severity: "medium",
    status: "reported",
    reportedAt: "2026-06-22T10:15:00.000Z",
    reportedBy: "member_fatima_bello",
    subjectRef: "member_abusive_118",
    subjectLabel: "Member 118",
    investigator: null,
    summary: "Abusive language in introduction feedback thread.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_fatima_bello",
        timestamp: "2026-06-22T10:15:00.000Z",
        note: "Abusive behaviour report filed.",
        fromStatus: null,
        toStatus: "reported"
      }
    ]
  },
  {
    id: "safety_006",
    caseRef: "CASE-2026-0046",
    caseTypeId: "threats",
    severity: "critical",
    status: "action-required",
    reportedAt: "2026-06-22T06:00:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_threat_991",
    subjectLabel: "Member 991",
    investigator: "ngozi@bamsignal.com",
    summary: "Explicit threat of physical harm in chat.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_ngozi_ade",
        timestamp: "2026-06-22T06:00:00.000Z",
        note: "Threat report with urgent flag.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "require-action",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-22T06:10:00.000Z",
        note: "Immediate escalation — critical threat.",
        fromStatus: "reported",
        toStatus: "action-required"
      }
    ]
  },
  {
    id: "safety_007",
    caseRef: "CASE-2026-0047",
    caseTypeId: "blackmail",
    severity: "high",
    status: "investigating",
    reportedAt: "2026-06-21T16:00:00.000Z",
    reportedBy: "member_yemi_ade",
    subjectRef: "member_blackmail_55",
    subjectLabel: "Member 55",
    investigator: "fatima@bamsignal.com",
    summary: "Member threatened to share private photos unless payment sent.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_yemi_ade",
        timestamp: "2026-06-21T16:00:00.000Z",
        note: "Blackmail report with message screenshots.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-21T17:00:00.000Z",
        note: "Evidence review and subject account lock initiated.",
        fromStatus: "reported",
        toStatus: "investigating"
      }
    ]
  },
  {
    id: "safety_008",
    caseRef: "CASE-2026-0048",
    caseTypeId: "scam-reports",
    severity: "high",
    status: "investigating",
    reportedAt: "2026-06-19T13:00:00.000Z",
    reportedBy: "member_tunde_emeka",
    subjectRef: "member_scam_12",
    subjectLabel: "Member 12",
    investigator: "ada@bamsignal.com",
    summary: "Investment scam promoted through introduction thread.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_tunde_emeka",
        timestamp: "2026-06-19T13:00:00.000Z",
        note: "Scam report filed.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "investigate",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-19T15:00:00.000Z",
        note: "Scam pattern review started.",
        fromStatus: "reported",
        toStatus: "investigating"
      }
    ]
  },
  {
    id: "safety_009",
    caseRef: "CASE-2026-0049",
    caseTypeId: "emergency-escalation",
    severity: "critical",
    status: "action-required",
    reportedAt: "2026-06-22T11:30:00.000Z",
    reportedBy: "member_emergency_01",
    subjectRef: "member_emergency_subject",
    subjectLabel: "Emergency subject",
    investigator: "ngozi@bamsignal.com",
    summary: "Member reports immediate safety risk — requires urgent response.",
    actionsTaken: [],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_emergency_01",
        timestamp: "2026-06-22T11:30:00.000Z",
        note: "Emergency escalation report received.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "require-action",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-22T11:32:00.000Z",
        note: "Emergency protocol activated.",
        fromStatus: "reported",
        toStatus: "action-required"
      }
    ]
  },
  {
    id: "safety_010",
    caseRef: "CASE-2026-0038",
    caseTypeId: "harassment",
    severity: "low",
    status: "closed",
    reportedAt: "2026-06-10T09:00:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_tunde_emeka",
    subjectLabel: "Tunde Emeka",
    investigator: "ada@bamsignal.com",
    summary: "Prior harassment report — warning issued.",
    actionsTaken: ["warning"],
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_ngozi_ade",
        timestamp: "2026-06-10T09:00:00.000Z",
        note: "Initial report.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "apply-action",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-12T13:00:00.000Z",
        note: "Warning issued to subject.",
        fromStatus: "reported",
        toStatus: "investigating",
        actionId: "warning"
      },
      {
        id: "safety_tl_0003",
        workflow: "resolve",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-12T14:00:00.000Z",
        note: "Case resolved after warning.",
        fromStatus: "investigating",
        toStatus: "resolved"
      },
      {
        id: "safety_tl_0004",
        workflow: "close",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-14T10:00:00.000Z",
        note: "Case closed after follow-up.",
        fromStatus: "resolved",
        toStatus: "closed"
      }
    ]
  }
];

/** @deprecated Use SAFETY_CASES_SEED */
export const SAFETY_INCIDENTS_SEED = SAFETY_CASES_SEED;
