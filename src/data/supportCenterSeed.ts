import type { KnowledgeBaseArticle, SupportTicketRecord } from "../types/supportCenter";

export const SUPPORT_TICKETS_SEED: SupportTicketRecord[] = [
  {
    id: "ticket_001",
    ticketNumber: "BS-SUP-2026-0042",
    subject: "Consultation payment not reflecting",
    categoryId: "payments",
    status: "in-progress",
    priority: "high",
    memberUsername: "ada_w",
    description: "Paid consultation fee via Paystack but status still shows pending.",
    createdAt: "2026-06-20T09:15:00.000Z",
    updatedAt: "2026-06-20T11:30:00.000Z",
    firstResponseAt: "2026-06-20T10:00:00.000Z",
    resolvedAt: null,
    assignedTo: "Support — Chidi",
    note: "Payment reference shared. Verifying with Paystack webhook logs."
  },
  {
    id: "ticket_002",
    ticketNumber: "BS-SUP-2026-0038",
    subject: "Cannot reset PIN after device change",
    categoryId: "account",
    status: "awaiting-response",
    priority: "medium",
    memberUsername: "tunde_k",
    description: "New phone — PIN reset email not arriving.",
    createdAt: "2026-06-19T14:00:00.000Z",
    updatedAt: "2026-06-20T08:00:00.000Z",
    firstResponseAt: "2026-06-19T16:20:00.000Z",
    resolvedAt: null,
    assignedTo: "Support — Amaka",
    note: "Asked member to confirm account email on file."
  },
  {
    id: "ticket_003",
    ticketNumber: "BS-SUP-2026-0031",
    subject: "Introduction consent deadline passed",
    categoryId: "introductions",
    status: "escalated",
    priority: "critical",
    memberUsername: "ngozi_m",
    description: "Concierge introduction awaiting response — member needs extension.",
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    firstResponseAt: "2026-06-18T11:00:00.000Z",
    resolvedAt: null,
    assignedTo: "Ops — Senior",
    note: "Escalated to operations for consultant review."
  },
  {
    id: "ticket_004",
    ticketNumber: "BS-SUP-2026-0025",
    subject: "Meeting link not opening on Android",
    categoryId: "technical-issues",
    status: "open",
    priority: "medium",
    memberUsername: "fatima_b",
    description: "Google Meet link from consultation opens browser but not app.",
    createdAt: "2026-06-21T07:45:00.000Z",
    updatedAt: "2026-06-21T07:45:00.000Z",
    firstResponseAt: null,
    resolvedAt: null,
    assignedTo: "Unassigned",
    note: "New ticket — awaiting first response."
  },
  {
    id: "ticket_005",
    ticketNumber: "BS-SUP-2026-0019",
    subject: "Reported profile still visible in Discover",
    categoryId: "safety-concerns",
    status: "resolved",
    priority: "high",
    memberUsername: "ibrahim_s",
    description: "Submitted safety report — wanted confirmation action was taken.",
    createdAt: "2026-06-15T12:00:00.000Z",
    updatedAt: "2026-06-17T15:00:00.000Z",
    firstResponseAt: "2026-06-15T13:30:00.000Z",
    resolvedAt: "2026-06-17T15:00:00.000Z",
    assignedTo: "Trust — Ngozi",
    note: "Shadow ban confirmed. Member notified without exposing reporter."
  },
  {
    id: "ticket_006",
    ticketNumber: "BS-SUP-2026-0012",
    subject: "Reschedule consultation slot",
    categoryId: "scheduling",
    status: "closed",
    priority: "low",
    memberUsername: "chidi_e",
    description: "Requested move from Friday to Monday slot.",
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-11T10:00:00.000Z",
    firstResponseAt: "2026-06-10T09:00:00.000Z",
    resolvedAt: "2026-06-11T10:00:00.000Z",
    assignedTo: "Concierge Ops",
    note: "Rescheduled and confirmed via email."
  }
];

export const KNOWLEDGE_BASE_SEED: KnowledgeBaseArticle[] = [
  {
    id: "kb_account_pin",
    slug: "reset-pin",
    title: "Reset your PIN",
    summary: "Username + PIN login — how to recover access on a new device.",
    categoryId: "account",
    href: "/help/reset-pin"
  },
  {
    id: "kb_payments",
    slug: "consultation-payments",
    title: "Consultation payments",
    summary: "Paystack flow, pending states, and when fees activate.",
    categoryId: "payments"
  },
  {
    id: "kb_scheduling",
    slug: "book-consultation",
    title: "Book a consultation",
    summary: "Scheduling slots, time zones, and meeting links.",
    categoryId: "scheduling"
  },
  {
    id: "kb_introductions",
    slug: "introduction-consent",
    title: "Introduction consent",
    summary: "How introductions work and response windows.",
    categoryId: "introductions"
  },
  {
    id: "kb_safety",
    slug: "report-member",
    title: "Report a member",
    summary: "In-app reporting, safety review, and what we can share.",
    categoryId: "safety-concerns",
    href: "/safety"
  },
  {
    id: "kb_technical",
    slug: "photo-upload",
    title: "Photo upload issues",
    summary: "Upload-first flow, formats, and verification delays.",
    categoryId: "technical-issues",
    href: "/help/photos"
  },
  {
    id: "kb_profile",
    slug: "create-profile",
    title: "Create your profile",
    summary: "Photos, prompts, and preferences for discovery.",
    categoryId: "account",
    href: "/help/create-profile"
  },
  {
    id: "kb_consultation",
    slug: "signal-concierge",
    title: "Signal Concierge overview",
    summary: "Tiers, confidentiality, and what to expect.",
    categoryId: "consultation",
    href: "/signal-concierge"
  }
];
