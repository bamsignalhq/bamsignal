import type { KnowledgeBaseArticle, SupportTicketRecord } from "../types/supportCenter";

export const SUPPORT_TICKETS_SEED: SupportTicketRecord[] = [
  {
    id: "ticket_001",
    ticketNumber: "BS-SUP-2026-0042",
    subject: "Consultation payment not reflecting",
    typeId: "billing",
    status: "in-progress",
    priority: "high",
    escalated: false,
    memberUsername: "ada_w",
    description: "Paid consultation fee via Paystack but status still shows pending.",
    createdAt: "2026-06-20T09:15:00.000Z",
    updatedAt: "2026-06-20T11:30:00.000Z",
    firstResponseAt: "2026-06-20T10:00:00.000Z",
    resolvedAt: null,
    assignedTo: "Support — Chidi",
    note: "Payment reference shared. Verifying with Paystack webhook logs.",
    satisfactionScore: null,
    timeline: [
      {
        id: "tl_001_a",
        at: "2026-06-20T09:15:00.000Z",
        label: "Ticket opened",
        detail: "Member reported consultation payment not reflecting.",
        actor: "ada_w"
      },
      {
        id: "tl_001_b",
        at: "2026-06-20T10:00:00.000Z",
        label: "First response",
        detail: "Requested Paystack reference and screenshot.",
        actor: "Support — Chidi"
      },
      {
        id: "tl_001_c",
        at: "2026-06-20T11:30:00.000Z",
        label: "In progress",
        detail: "Verifying with Paystack webhook logs.",
        actor: "Support — Chidi"
      }
    ]
  },
  {
    id: "ticket_002",
    ticketNumber: "BS-SUP-2026-0038",
    subject: "Cannot reset PIN after device change",
    typeId: "account-recovery",
    status: "waiting-for-member",
    priority: "medium",
    escalated: false,
    memberUsername: "tunde_k",
    description: "New phone — PIN reset email not arriving.",
    createdAt: "2026-06-19T14:00:00.000Z",
    updatedAt: "2026-06-20T08:00:00.000Z",
    firstResponseAt: "2026-06-19T16:20:00.000Z",
    resolvedAt: null,
    assignedTo: "Support — Amaka",
    note: "Asked member to confirm account email on file.",
    satisfactionScore: null,
    timeline: [
      {
        id: "tl_002_a",
        at: "2026-06-19T14:00:00.000Z",
        label: "Ticket opened",
        detail: "PIN reset not working on new device.",
        actor: "tunde_k"
      },
      {
        id: "tl_002_b",
        at: "2026-06-19T16:20:00.000Z",
        label: "First response",
        detail: "Confirmed username and asked for email on file.",
        actor: "Support — Amaka"
      },
      {
        id: "tl_002_c",
        at: "2026-06-20T08:00:00.000Z",
        label: "Waiting for member",
        detail: "Awaiting member confirmation of account email.",
        actor: "Support — Amaka"
      }
    ]
  },
  {
    id: "ticket_003",
    ticketNumber: "BS-SUP-2026-0031",
    subject: "Introduction consent deadline passed",
    typeId: "consultation-issues",
    status: "in-progress",
    priority: "critical",
    escalated: true,
    memberUsername: "ngozi_m",
    description: "Concierge introduction awaiting response — member needs extension.",
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    firstResponseAt: "2026-06-18T11:00:00.000Z",
    resolvedAt: null,
    assignedTo: "Ops — Senior",
    note: "Escalated to operations for consultant review.",
    satisfactionScore: null,
    timeline: [
      {
        id: "tl_003_a",
        at: "2026-06-18T10:00:00.000Z",
        label: "Ticket opened",
        detail: "Introduction consent window expired.",
        actor: "ngozi_m"
      },
      {
        id: "tl_003_b",
        at: "2026-06-18T11:00:00.000Z",
        label: "First response",
        detail: "Reviewing introduction timeline with concierge.",
        actor: "Support — Chidi"
      },
      {
        id: "tl_003_c",
        at: "2026-06-20T09:00:00.000Z",
        label: "Escalated",
        detail: "Routed to senior operations for consultant review.",
        actor: "Ops — Senior"
      }
    ]
  },
  {
    id: "ticket_004",
    ticketNumber: "BS-SUP-2026-0025",
    subject: "Meeting link not opening on Android",
    typeId: "technical-support",
    status: "open",
    priority: "medium",
    escalated: false,
    memberUsername: "fatima_b",
    description: "Google Meet link from consultation opens browser but not app.",
    createdAt: "2026-06-21T07:45:00.000Z",
    updatedAt: "2026-06-21T07:45:00.000Z",
    firstResponseAt: null,
    resolvedAt: null,
    assignedTo: "Unassigned",
    note: "New ticket — awaiting first response.",
    satisfactionScore: null,
    timeline: [
      {
        id: "tl_004_a",
        at: "2026-06-21T07:45:00.000Z",
        label: "Ticket opened",
        detail: "Android meeting link issue reported.",
        actor: "fatima_b"
      }
    ]
  },
  {
    id: "ticket_005",
    ticketNumber: "BS-SUP-2026-0019",
    subject: "Reported profile still visible in Discover",
    typeId: "safety-reports",
    status: "resolved",
    priority: "high",
    escalated: false,
    memberUsername: "ibrahim_s",
    description: "Submitted safety report — wanted confirmation action was taken.",
    createdAt: "2026-06-15T12:00:00.000Z",
    updatedAt: "2026-06-17T15:00:00.000Z",
    firstResponseAt: "2026-06-15T13:30:00.000Z",
    resolvedAt: "2026-06-17T15:00:00.000Z",
    assignedTo: "Trust — Ngozi",
    note: "Shadow ban confirmed. Member notified without exposing reporter.",
    satisfactionScore: 5,
    timeline: [
      {
        id: "tl_005_a",
        at: "2026-06-15T12:00:00.000Z",
        label: "Ticket opened",
        detail: "Safety report follow-up requested.",
        actor: "ibrahim_s"
      },
      {
        id: "tl_005_b",
        at: "2026-06-15T13:30:00.000Z",
        label: "First response",
        detail: "Trust team reviewing report.",
        actor: "Trust — Ngozi"
      },
      {
        id: "tl_005_c",
        at: "2026-06-17T15:00:00.000Z",
        label: "Resolved",
        detail: "Action confirmed. Member notified.",
        actor: "Trust — Ngozi"
      }
    ]
  },
  {
    id: "ticket_006",
    ticketNumber: "BS-SUP-2026-0012",
    subject: "Reschedule consultation slot",
    typeId: "consultation-issues",
    status: "closed",
    priority: "low",
    escalated: false,
    memberUsername: "chidi_e",
    description: "Requested move from Friday to Monday slot.",
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-11T10:00:00.000Z",
    firstResponseAt: "2026-06-10T09:00:00.000Z",
    resolvedAt: "2026-06-11T10:00:00.000Z",
    assignedTo: "Concierge Ops",
    note: "Rescheduled and confirmed via email.",
    satisfactionScore: 4,
    timeline: [
      {
        id: "tl_006_a",
        at: "2026-06-10T08:00:00.000Z",
        label: "Ticket opened",
        detail: "Consultation reschedule requested.",
        actor: "chidi_e"
      },
      {
        id: "tl_006_b",
        at: "2026-06-10T09:00:00.000Z",
        label: "First response",
        detail: "Checking consultant availability.",
        actor: "Concierge Ops"
      },
      {
        id: "tl_006_c",
        at: "2026-06-11T10:00:00.000Z",
        label: "Closed",
        detail: "New slot confirmed and emailed.",
        actor: "Concierge Ops"
      }
    ]
  },
  {
    id: "ticket_007",
    ticketNumber: "BS-SUP-2026-0048",
    subject: "Profile photo stuck in verification",
    typeId: "profile-issues",
    status: "pending",
    priority: "medium",
    escalated: false,
    memberUsername: "yemi_a",
    description: "Uploaded new photo 3 days ago — still showing pending.",
    createdAt: "2026-06-21T10:00:00.000Z",
    updatedAt: "2026-06-21T10:30:00.000Z",
    firstResponseAt: null,
    resolvedAt: null,
    assignedTo: "Support — Amaka",
    note: "Queued for photo review team.",
    satisfactionScore: null,
    timeline: [
      {
        id: "tl_007_a",
        at: "2026-06-21T10:00:00.000Z",
        label: "Ticket opened",
        detail: "Photo verification delay reported.",
        actor: "yemi_a"
      },
      {
        id: "tl_007_b",
        at: "2026-06-21T10:30:00.000Z",
        label: "Pending",
        detail: "Queued for photo review team.",
        actor: "Support — Amaka"
      }
    ]
  },
  {
    id: "ticket_008",
    ticketNumber: "BS-SUP-2026-0051",
    subject: "Love the concierge experience",
    typeId: "feedback",
    status: "resolved",
    priority: "low",
    escalated: false,
    memberUsername: "blessing_o",
    description: "Wanted to share positive feedback about consultant session.",
    createdAt: "2026-06-20T16:00:00.000Z",
    updatedAt: "2026-06-20T17:00:00.000Z",
    firstResponseAt: "2026-06-20T16:30:00.000Z",
    resolvedAt: "2026-06-20T17:00:00.000Z",
    assignedTo: "Support — Chidi",
    note: "Forwarded to consultant quality team.",
    satisfactionScore: 5,
    timeline: [
      {
        id: "tl_008_a",
        at: "2026-06-20T16:00:00.000Z",
        label: "Ticket opened",
        detail: "Positive concierge feedback submitted.",
        actor: "blessing_o"
      },
      {
        id: "tl_008_b",
        at: "2026-06-20T17:00:00.000Z",
        label: "Resolved",
        detail: "Forwarded to consultant quality team.",
        actor: "Support — Chidi"
      }
    ]
  }
];

export const KNOWLEDGE_BASE_SEED: KnowledgeBaseArticle[] = [
  {
    id: "kb_account_pin",
    slug: "reset-pin",
    title: "Reset your PIN",
    summary: "Username + PIN login — how to recover access on a new device.",
    typeId: "account-recovery",
    href: "/help/reset-pin"
  },
  {
    id: "kb_payments",
    slug: "consultation-payments",
    title: "Consultation payments",
    summary: "Paystack flow, pending states, and when fees activate.",
    typeId: "billing"
  },
  {
    id: "kb_scheduling",
    slug: "book-consultation",
    title: "Book a consultation",
    summary: "Scheduling slots, time zones, and meeting links.",
    typeId: "consultation-issues"
  },
  {
    id: "kb_introductions",
    slug: "introduction-consent",
    title: "Introduction consent",
    summary: "How introductions work and response windows.",
    typeId: "consultation-issues"
  },
  {
    id: "kb_safety",
    slug: "report-member",
    title: "Report a member",
    summary: "In-app reporting, safety review, and what we can share.",
    typeId: "safety-reports",
    href: "/safety"
  },
  {
    id: "kb_technical",
    slug: "photo-upload",
    title: "Photo upload issues",
    summary: "Upload-first flow, formats, and verification delays.",
    typeId: "technical-support",
    href: "/help/photos"
  },
  {
    id: "kb_profile",
    slug: "create-profile",
    title: "Create your profile",
    summary: "Photos, prompts, and preferences for discovery.",
    typeId: "profile-issues",
    href: "/help/create-profile"
  },
  {
    id: "kb_consultation",
    slug: "signal-concierge",
    title: "Signal Concierge overview",
    summary: "Tiers, confidentiality, and what to expect.",
    typeId: "consultation-issues",
    href: "/signal-concierge"
  },
  {
    id: "kb_general",
    slug: "getting-started",
    title: "Getting started with BamSignal",
    summary: "Account setup, discovery, and first steps.",
    typeId: "general-questions"
  }
];
