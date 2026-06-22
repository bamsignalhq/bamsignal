import type { SafetyIncidentRecord } from "../types/safetyCenter";

export const SAFETY_INCIDENTS_SEED: SafetyIncidentRecord[] = [
  {
    id: "safety_001",
    incidentRef: "INC-2026-0041",
    categoryId: "harassment",
    severity: "high",
    status: "under-review",
    reportedAt: "2026-06-20T14:30:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_tunde_emeka",
    subjectLabel: "Tunde Emeka",
    investigator: "ada@bamsignal.com",
    summary: "Repeated unsolicited messages after block request in chat thread.",
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
        workflow: "review",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-20T15:00:00.000Z",
        note: "Chat transcript review started.",
        fromStatus: "reported",
        toStatus: "under-review"
      },
      {
        id: "safety_tl_0003",
        workflow: "assign-investigator",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-20T15:05:00.000Z",
        note: "Assigned to Ada Okafor for member safety review.",
        fromStatus: "under-review",
        toStatus: "under-review"
      }
    ]
  },
  {
    id: "safety_002",
    incidentRef: "INC-2026-0042",
    categoryId: "fraud",
    severity: "critical",
    status: "escalated",
    reportedAt: "2026-06-21T09:00:00.000Z",
    reportedBy: "member_chidi_oka",
    subjectRef: "member_fake_profile_882",
    subjectLabel: "Unknown profile",
    investigator: "ngozi@bamsignal.com",
    summary: "Suspected romance scam requesting off-platform wire transfer.",
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
        workflow: "review",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-21T09:30:00.000Z",
        note: "Payment pattern review initiated.",
        fromStatus: "reported",
        toStatus: "under-review"
      },
      {
        id: "safety_tl_0003",
        workflow: "escalate",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-21T10:00:00.000Z",
        note: "Escalated to operations lead — critical fraud pattern.",
        fromStatus: "under-review",
        toStatus: "escalated"
      }
    ]
  },
  {
    id: "safety_003",
    incidentRef: "INC-2026-0043",
    categoryId: "catfishing",
    severity: "medium",
    status: "resolved",
    reportedAt: "2026-06-18T11:00:00.000Z",
    reportedBy: "member_amara_di",
    subjectRef: "member_profile_441",
    subjectLabel: "Profile 441",
    investigator: "chidi@bamsignal.com",
    summary: "Profile photos inconsistent with verification selfie.",
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
        workflow: "review",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-18T12:00:00.000Z",
        note: "Photo comparison review.",
        fromStatus: "reported",
        toStatus: "under-review"
      },
      {
        id: "safety_tl_0003",
        workflow: "resolve",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-19T16:00:00.000Z",
        note: "Profile suspended pending re-verification.",
        fromStatus: "under-review",
        toStatus: "resolved"
      }
    ]
  },
  {
    id: "safety_004",
    incidentRef: "INC-2026-0044",
    categoryId: "identity-concerns",
    severity: "high",
    status: "under-review",
    reportedAt: "2026-06-22T08:00:00.000Z",
    reportedBy: "consultant_ada_okafor",
    subjectRef: "member_identity_229",
    subjectLabel: "Member 229",
    investigator: null,
    summary: "Duplicate account indicators across two usernames.",
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
        workflow: "review",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-22T08:30:00.000Z",
        note: "Cross-reference check started.",
        fromStatus: "reported",
        toStatus: "under-review"
      }
    ]
  },
  {
    id: "safety_005",
    incidentRef: "INC-2026-0045",
    categoryId: "abusive-conduct",
    severity: "medium",
    status: "reported",
    reportedAt: "2026-06-22T10:15:00.000Z",
    reportedBy: "member_fatima_bello",
    subjectRef: "member_abusive_118",
    subjectLabel: "Member 118",
    investigator: null,
    summary: "Abusive language in introduction feedback thread.",
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_fatima_bello",
        timestamp: "2026-06-22T10:15:00.000Z",
        note: "Abusive conduct report filed.",
        fromStatus: null,
        toStatus: "reported"
      }
    ]
  },
  {
    id: "safety_006",
    incidentRef: "INC-2026-0046",
    categoryId: "threats",
    severity: "critical",
    status: "escalated",
    reportedAt: "2026-06-22T06:00:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_threat_991",
    subjectLabel: "Member 991",
    investigator: "ngozi@bamsignal.com",
    summary: "Explicit threat of physical harm in chat.",
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
        workflow: "escalate",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-22T06:10:00.000Z",
        note: "Immediate escalation — critical threat.",
        fromStatus: "reported",
        toStatus: "escalated"
      }
    ]
  },
  {
    id: "safety_007",
    incidentRef: "INC-2026-0047",
    categoryId: "payment-abuse",
    severity: "high",
    status: "under-review",
    reportedAt: "2026-06-21T16:00:00.000Z",
    reportedBy: "operations@bamsignal.com",
    subjectRef: "member_pay_abuse_55",
    subjectLabel: "Member 55",
    investigator: "fatima@bamsignal.com",
    summary: "Chargeback abuse pattern on consultation payments.",
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "operations@bamsignal.com",
        timestamp: "2026-06-21T16:00:00.000Z",
        note: "Payment abuse flagged by Paystack reconciliation.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "review",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-21T17:00:00.000Z",
        note: "Payment history audit underway.",
        fromStatus: "reported",
        toStatus: "under-review"
      }
    ]
  },
  {
    id: "safety_008",
    incidentRef: "INC-2026-0048",
    categoryId: "consultant-misconduct",
    severity: "high",
    status: "under-review",
    reportedAt: "2026-06-19T13:00:00.000Z",
    reportedBy: "member_tunde_emeka",
    subjectRef: "consultant_misconduct_12",
    subjectLabel: "Consultant 12",
    investigator: "ada@bamsignal.com",
    summary: "Consultant shared member details outside approved channels.",
    timeline: [
      {
        id: "safety_tl_0001",
        workflow: "report",
        actor: "member_tunde_emeka",
        timestamp: "2026-06-19T13:00:00.000Z",
        note: "Consultant misconduct report.",
        fromStatus: null,
        toStatus: "reported"
      },
      {
        id: "safety_tl_0002",
        workflow: "assign-investigator",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-19T14:00:00.000Z",
        note: "Assigned to Ada Okafor.",
        fromStatus: "reported",
        toStatus: "reported"
      },
      {
        id: "safety_tl_0003",
        workflow: "review",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-19T15:00:00.000Z",
        note: "Consultant conduct review started.",
        fromStatus: "reported",
        toStatus: "under-review"
      }
    ]
  },
  {
    id: "safety_009",
    incidentRef: "INC-2026-0049",
    categoryId: "emergency-escalation",
    severity: "critical",
    status: "escalated",
    reportedAt: "2026-06-22T11:30:00.000Z",
    reportedBy: "member_emergency_01",
    subjectRef: "member_emergency_subject",
    subjectLabel: "Emergency subject",
    investigator: "ngozi@bamsignal.com",
    summary: "Member reports immediate safety risk — requires urgent response.",
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
        workflow: "escalate",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-22T11:32:00.000Z",
        note: "Emergency protocol activated.",
        fromStatus: "reported",
        toStatus: "escalated"
      }
    ]
  },
  {
    id: "safety_010",
    incidentRef: "INC-2026-0038",
    categoryId: "harassment",
    severity: "low",
    status: "closed",
    reportedAt: "2026-06-10T09:00:00.000Z",
    reportedBy: "member_ngozi_ade",
    subjectRef: "member_tunde_emeka",
    subjectLabel: "Tunde Emeka",
    investigator: "ada@bamsignal.com",
    summary: "Prior harassment report — warning issued.",
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
        workflow: "resolve",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-12T14:00:00.000Z",
        note: "Warning issued to subject.",
        fromStatus: "reported",
        toStatus: "resolved"
      },
      {
        id: "safety_tl_0003",
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
