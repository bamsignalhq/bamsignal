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
    status: "approved",
    createdAt: "2025-11-01T09:00:00.000Z",
    updatedAt: "2026-05-15T14:00:00.000Z",
    summary: "Member data handling, consultant obligations, and breach escalation.",
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
    slug: "consultation-scheduling-procedure",
    title: "Consultation Scheduling Procedure",
    categoryId: "procedures",
    version: "1.4",
    author: "Fatima Bello",
    owner: "Operations",
    status: "approved",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-06-01T11:00:00.000Z",
    summary: "Calendar slots, Paystack payment gate, and meeting link handoff.",
    versionHistory: [
      { version: "1.0", updatedAt: "2026-01-10T08:00:00.000Z", author: "Fatima Bello", note: "First SOP." },
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
    status: "approved",
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    summary: "30-day onboarding curriculum for new Signal Concierge consultants.",
    versionHistory: [
      { version: "1.0", updatedAt: "2026-02-15T10:00:00.000Z", author: "Amaka Nwosu", note: "Launch curriculum." },
      { version: "1.2", updatedAt: "2026-05-20T10:00:00.000Z", author: "Amaka Nwosu", note: "Regional teams module." }
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
    categoryId: "operations",
    version: "1.0",
    author: "Chidi Emeka",
    owner: "Operations",
    status: "draft",
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    summary: "Daily ops checklist — assignments, payments, notifications, escalations.",
    versionHistory: [
      { version: "1.0", updatedAt: "2026-06-20T09:00:00.000Z", author: "Chidi Emeka", note: "Initial draft." }
    ],
    approval: null
  },
  {
    id: "doc_006",
    slug: "relationship-index-methodology",
    title: "Relationship Index Methodology",
    categoryId: "research",
    version: "1.1",
    author: "Tunde Adebayo",
    owner: "Institute",
    status: "approved",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-04-15T00:00:00.000Z",
    summary: "Research framework for BamSignal Relationship Index™ reporting.",
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
    slug: "data-retention-legal-memo",
    title: "Data Retention Legal Memo",
    categoryId: "legal",
    version: "1.0",
    author: "Legal",
    owner: "Legal",
    status: "approved",
    createdAt: "2025-08-01T00:00:00.000Z",
    updatedAt: "2025-08-01T00:00:00.000Z",
    summary: "Retention periods for member data, payments, and audit logs.",
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
    id: "doc_008",
    slug: "introduction-email-template",
    title: "Introduction Email Template",
    categoryId: "templates",
    version: "2.0",
    author: "Fatima Bello",
    owner: "Signal Concierge",
    status: "approved",
    createdAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-06-05T00:00:00.000Z",
    summary: "Standard introduction presentation template for member consent flow.",
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
    slug: "first-consultation-framework",
    title: "First Consultation Meeting Framework",
    categoryId: "meeting-frameworks",
    version: "1.3",
    author: "Ada Okafor",
    owner: "Signal Concierge",
    status: "approved",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    summary: "60-minute first consultation structure — intake, values, next steps.",
    versionHistory: [
      { version: "1.3", updatedAt: "2026-05-01T00:00:00.000Z", author: "Ada Okafor", note: "Payment gate note added." }
    ],
    approval: {
      approvedBy: "Chidi Emeka",
      approvedAt: "2026-05-02T00:00:00.000Z",
      note: "Framework approved."
    }
  },
  {
    id: "doc_010",
    slug: "institutional-culture-principles",
    title: "Institutional Culture Principles",
    categoryId: "culture",
    version: "1.0",
    author: "Leadership",
    owner: "Leadership",
    status: "archived",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
    summary: "Superseded by Careers & Culture pages — retained for archive.",
    versionHistory: [
      { version: "1.0", updatedAt: "2024-06-01T00:00:00.000Z", author: "Leadership", note: "Original principles." }
    ],
    approval: {
      approvedBy: "Leadership",
      approvedAt: "2024-06-15T00:00:00.000Z",
      note: "Archived — see public culture pages."
    }
  }
];
