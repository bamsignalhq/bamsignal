import type { DocumentRecord } from "../types/documentCenter";

export const DOCUMENT_CENTER_SEED: DocumentRecord[] = [
  {
    id: "doc_001",
    slug: "signal-concierge-confidentiality-policy",
    title: "Signal Concierge Confidentiality Policy",
    categoryId: "policies",
    version: "2.1",
    author: "Ada Okafor",
    owner: "Operations",
    status: "published",
    createdAt: "2025-11-01T09:00:00.000Z",
    updatedAt: "2026-05-15T14:00:00.000Z",
    summary: "Member data handling, consultant obligations, and breach escalation.",
    body: "This policy governs how Signal Concierge consultants handle member information, including intake notes, introduction details, and payment records. All consultants must complete annual confidentiality training.",
    viewCount: 428,
    permissions: ["view", "edit", "approve", "archive"],
    versionHistory: [
      { version: "1.0", updatedAt: "2025-11-01T09:00:00.000Z", author: "Ada Okafor", note: "Initial policy." },
      { version: "2.0", updatedAt: "2026-03-01T10:00:00.000Z", author: "Chidi Emeka", note: "Diaspora corridor addendum." },
      { version: "2.1", updatedAt: "2026-05-15T14:00:00.000Z", author: "Ada Okafor", note: "Archive access clarification." }
    ],
    approval: {
      approvedBy: "Ngozi Adeyemi",
      approvedAt: "2026-05-16T09:00:00.000Z",
      note: "Approved for institution-wide use."
    }
  },
  {
    id: "doc_002",
    slug: "consultation-scheduling-manual",
    title: "Consultation Scheduling Manual",
    categoryId: "operating-procedures",
    version: "1.4",
    author: "Fatima Bello",
    owner: "Operations",
    status: "published",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-06-01T11:00:00.000Z",
    summary: "Calendar slots, Paystack payment gate, and meeting link handoff.",
    body: "Step-by-step operations manual for scheduling consultations: slot selection, payment verification, calendar sync, and meeting link delivery to members.",
    viewCount: 312,
    permissions: ["view", "edit", "approve"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-01-10T08:00:00.000Z", author: "Fatima Bello", note: "First manual." },
      { version: "1.4", updatedAt: "2026-06-01T11:00:00.000Z", author: "Fatima Bello", note: "Google Meet fallback added." }
    ],
    approval: {
      approvedBy: "Chidi Emeka",
      approvedAt: "2026-06-02T08:00:00.000Z",
      note: "Operations sign-off."
    }
  },
  {
    id: "doc_003",
    slug: "relationship-consultant-guide",
    title: "Relationship Consultant Guide",
    categoryId: "consultant-guides",
    version: "3.0",
    author: "Ada Okafor",
    owner: "Signal Concierge",
    status: "review",
    createdAt: "2025-09-01T00:00:00.000Z",
    updatedAt: "2026-06-18T16:00:00.000Z",
    summary: "Consultant journey stages, introduction ethics, and follow-up cadence.",
    body: "Comprehensive guide for relationship consultants covering intake, values assessment, introduction presentation, consent windows, and follow-up protocols.",
    viewCount: 186,
    permissions: ["view", "edit", "approve"],
    versionHistory: [
      { version: "2.5", updatedAt: "2026-04-01T00:00:00.000Z", author: "Ada Okafor", note: "Legacy index section." },
      { version: "3.0", updatedAt: "2026-06-18T16:00:00.000Z", author: "Ada Okafor", note: "Introduction Engine™ updates." }
    ],
    approval: null
  },
  {
    id: "doc_004",
    slug: "consultant-onboarding-training",
    title: "Consultant Onboarding Training",
    categoryId: "training",
    version: "1.2",
    author: "Amaka Nwosu",
    owner: "Talent",
    status: "published",
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
    summary: "30-day onboarding curriculum for new Signal Concierge consultants.",
    body: "Training curriculum covering BamSignal values, consultant ethics, platform tools, introduction process, and quality review expectations.",
    viewCount: 264,
    permissions: ["view", "edit"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-02-15T10:00:00.000Z", author: "Amaka Nwosu", note: "Launch curriculum." },
      { version: "1.2", updatedAt: "2026-06-20T10:00:00.000Z", author: "Amaka Nwosu", note: "Regional teams module." }
    ],
    approval: {
      approvedBy: "Tunde Adebayo",
      approvedAt: "2026-05-21T09:00:00.000Z",
      note: "Training approved."
    }
  },
  {
    id: "doc_005",
    slug: "operations-center-runbook",
    title: "Operations Center Runbook",
    categoryId: "operating-procedures",
    version: "1.0",
    author: "Chidi Emeka",
    owner: "Operations",
    status: "draft",
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    summary: "Daily ops checklist — assignments, payments, notifications, escalations.",
    body: "Draft runbook for daily operations center workflows including member assignments, payment reconciliation, notification monitoring, and escalation routing.",
    viewCount: 42,
    permissions: ["view", "edit"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-06-20T09:00:00.000Z", author: "Chidi Emeka", note: "Initial draft." }
    ],
    approval: null
  },
  {
    id: "doc_006",
    slug: "relationship-index-methodology",
    title: "Relationship Index Methodology",
    categoryId: "research-manuals",
    version: "1.1",
    author: "Tunde Adebayo",
    owner: "Institute",
    status: "published",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-04-15T00:00:00.000Z",
    summary: "Research framework for BamSignal Relationship Index™ reporting.",
    body: "Methodology document describing data sources, weighting, corridor analysis, and publication standards for quarterly Relationship Index reports.",
    viewCount: 98,
    permissions: ["view", "approve", "archive"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-03-01T00:00:00.000Z", author: "Tunde Adebayo", note: "Methodology v1." },
      { version: "1.1", updatedAt: "2026-04-15T00:00:00.000Z", author: "Tunde Adebayo", note: "Diaspora weighting." }
    ],
    approval: {
      approvedBy: "Ngozi Adeyemi",
      approvedAt: "2026-04-16T00:00:00.000Z",
      note: "Research council approval."
    }
  },
  {
    id: "doc_007",
    slug: "consultant-services-contract-template",
    title: "Consultant Services Contract Template",
    categoryId: "legal",
    version: "2.0",
    author: "Legal",
    owner: "Legal",
    status: "published",
    createdAt: "2025-08-01T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
    summary: "Standard consultant engagement contract for Signal Concierge network.",
    body: "Template contract covering scope of services, confidentiality, payment terms, termination, and institutional compliance obligations.",
    viewCount: 156,
    permissions: ["view", "edit", "approve", "archive"],
    versionHistory: [
      { version: "1.0", updatedAt: "2025-08-01T00:00:00.000Z", author: "Legal", note: "Initial template." },
      { version: "2.0", updatedAt: "2026-03-10T00:00:00.000Z", author: "Legal", note: "Payment terms update." }
    ],
    approval: {
      approvedBy: "Legal",
      approvedAt: "2026-03-11T00:00:00.000Z",
      note: "Approved for consultant onboarding."
    }
  },
  {
    id: "doc_008",
    slug: "introduction-email-template",
    title: "Introduction Email Template",
    categoryId: "meeting-templates",
    version: "2.0",
    author: "Fatima Bello",
    owner: "Signal Concierge",
    status: "published",
    createdAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-06-05T00:00:00.000Z",
    summary: "Standard introduction presentation template for member consent flow.",
    body: "Reusable email template for presenting introductions to members, including consent language, response window, and confidentiality reminders.",
    viewCount: 512,
    permissions: ["view", "edit"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-01-20T00:00:00.000Z", author: "Fatima Bello", note: "First template." },
      { version: "2.0", updatedAt: "2026-06-05T00:00:00.000Z", author: "Fatima Bello", note: "Consent language update." }
    ],
    approval: {
      approvedBy: "Ada Okafor",
      approvedAt: "2026-06-06T00:00:00.000Z",
      note: "Approved for consultant use."
    }
  },
  {
    id: "doc_009",
    slug: "data-retention-compliance-memo",
    title: "Data Retention Compliance Memo",
    categoryId: "legal",
    version: "1.0",
    author: "Legal",
    owner: "Compliance",
    status: "published",
    createdAt: "2025-08-01T00:00:00.000Z",
    updatedAt: "2025-08-01T00:00:00.000Z",
    summary: "Retention periods for member data, payments, and audit logs.",
    body: "Compliance memo defining retention schedules, deletion procedures, and audit log preservation requirements for institutional data.",
    viewCount: 88,
    permissions: ["view", "approve", "archive"],
    versionHistory: [
      { version: "1.0", updatedAt: "2025-08-01T00:00:00.000Z", author: "Legal", note: "Initial memo." }
    ],
    approval: {
      approvedBy: "Legal",
      approvedAt: "2025-08-02T00:00:00.000Z",
      note: "Binding guidance."
    }
  },
  {
    id: "doc_010",
    slug: "crisis-safety-response-procedure",
    title: "Crisis & Safety Response Procedure",
    categoryId: "incident-response",
    version: "1.2",
    author: "Ngozi Adeyemi",
    owner: "Trust & Safety",
    status: "published",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-06-12T00:00:00.000Z",
    summary: "Institutional procedure for harassment, threats, and emergency escalation.",
    body: "Safety procedure covering case intake, investigator assignment, action matrix, law enforcement referral criteria, and member notification protocols.",
    viewCount: 224,
    permissions: ["view", "edit", "approve", "archive"],
    versionHistory: [
      { version: "1.0", updatedAt: "2026-01-15T00:00:00.000Z", author: "Ngozi Adeyemi", note: "Initial procedure." },
      { version: "1.2", updatedAt: "2026-06-12T00:00:00.000Z", author: "Ngozi Adeyemi", note: "Emergency escalation protocol." }
    ],
    approval: {
      approvedBy: "Leadership",
      approvedAt: "2026-06-13T00:00:00.000Z",
      note: "Approved for Crisis & Safety Center."
    }
  },
  {
    id: "doc_011",
    slug: "first-consultation-framework",
    title: "First Consultation Meeting Framework",
    categoryId: "consultant-guides",
    version: "1.3",
    author: "Ada Okafor",
    owner: "Signal Concierge",
    status: "review",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
    summary: "60-minute first consultation structure — intake, values, next steps.",
    body: "Meeting framework for first consultations: opening, values exploration, expectations setting, and next-step recommendations.",
    viewCount: 145,
    permissions: ["view", "edit", "approve"],
    versionHistory: [
      { version: "1.3", updatedAt: "2026-06-19T00:00:00.000Z", author: "Ada Okafor", note: "Payment gate note added." }
    ],
    approval: null
  }
];

const NOW = "2026-06-24T12:00:00.000Z";

export const KNOWLEDGE_ARTICLE_SEED = [
  {
    id: "kb_001",
    slug: "reset-member-pin",
    title: "How to guide a member through PIN reset",
    categoryId: "support-guides" as const,
    status: "published" as const,
    currentVersion: "1.2",
    bodyMarkdown:
      "## PIN reset support\n\n1. Confirm member identity via username.\n2. Direct to **Forgot PIN** on login.\n3. Verify email or phone OTP.\n4. Never collect PIN over chat.\n\n> Escalate to operations if OTP fails twice.",
    attachments: [
      {
        id: "att_001",
        filename: "pin-reset-checklist.pdf",
        mimeType: "application/pdf",
        url: "/docs/attachments/pin-reset-checklist.pdf"
      }
    ],
    tags: ["support", "authentication", "pin"],
    publishedAt: "2026-05-01T00:00:00.000Z",
    updatedAt: NOW,
    versionHistory: [
      { version: "1.0", updatedAt: "2026-03-01T00:00:00.000Z", author: "Support", note: "Initial article." },
      { version: "1.2", updatedAt: NOW, author: "Support", note: "OTP escalation note." }
    ]
  },
  {
    id: "kb_002",
    slug: "paystack-payment-troubleshooting",
    title: "Paystack payment troubleshooting",
    categoryId: "finance-manuals" as const,
    status: "published" as const,
    currentVersion: "1.0",
    bodyMarkdown:
      "## Common payment failures\n\n- **Insufficient funds** — ask member to retry with another card.\n- **Abandoned checkout** — preserve `paymentReturnPath`.\n- **Webhook delay** — check Finance Operations Center reconciliation.",
    attachments: [],
    tags: ["paystack", "payments", "finance"],
    publishedAt: "2026-04-10T00:00:00.000Z",
    updatedAt: NOW,
    versionHistory: [
      { version: "1.0", updatedAt: "2026-04-10T00:00:00.000Z", author: "Finance", note: "Published." }
    ]
  },
  {
    id: "kb_003",
    slug: "introduction-consent-window",
    title: "Introduction consent window FAQ",
    categoryId: "consultant-guides" as const,
    status: "review" as const,
    currentVersion: "2.0",
    bodyMarkdown:
      "Members have **72 hours** to respond to introductions unless extended by consultant with ops approval.",
    attachments: [],
    tags: ["introductions", "consent", "concierge"],
    updatedAt: NOW,
    versionHistory: [
      { version: "2.0", updatedAt: NOW, author: "Ada Okafor", note: "Draft update." }
    ]
  }
];

export const POLICY_VERSION_SEED = [
  {
    id: "pv_001",
    policySlug: "signal-concierge-confidentiality-policy",
    version: "2.1",
    title: "Signal Concierge Confidentiality Policy",
    body: "This policy governs how Signal Concierge consultants handle member information.",
    approvedBy: "Ngozi Adeyemi",
    approvedAt: "2026-05-16T09:00:00.000Z",
    publishedAt: "2026-05-16T10:00:00.000Z"
  },
  {
    id: "pv_002",
    policySlug: "signal-concierge-confidentiality-policy",
    version: "2.0",
    title: "Signal Concierge Confidentiality Policy",
    body: "Prior version with diaspora corridor addendum.",
    approvedBy: "Chidi Emeka",
    approvedAt: "2026-03-02T00:00:00.000Z",
    publishedAt: "2026-03-02T00:00:00.000Z"
  }
];

export const DOCUMENT_ACKNOWLEDGEMENT_SEED = [
  {
    id: "ack_001",
    documentId: "doc_001",
    employeeEmail: "ada@bamsignal.com",
    version: "2.1",
    readAt: "2026-05-17T09:00:00.000Z",
    acknowledgedAt: "2026-05-17T09:05:00.000Z"
  },
  {
    id: "ack_002",
    documentId: "doc_001",
    employeeEmail: "chidi@bamsignal.com",
    version: "2.1",
    readAt: "2026-05-18T10:00:00.000Z",
    acknowledgedAt: "2026-05-18T10:02:00.000Z"
  },
  {
    id: "ack_003",
    documentId: "doc_010",
    employeeEmail: "fatima@bamsignal.com",
    version: "1.2",
    readAt: "2026-06-14T08:00:00.000Z"
  }
];
