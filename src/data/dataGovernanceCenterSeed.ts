import type {
  AuditExportRecord,
  ConsentRecord,
  DataInventoryItem,
  GovernanceAuditRecord,
  LegalHoldRecord,
  PolicyVersionRecord,
  PrivacyRequestRecord,
  RegionalPolicyRecord,
  RetentionPolicyRecord,
  SensitiveDataRegister
} from "../types/dataGovernanceCenter";
import { RETENTION_CATEGORIES } from "../constants/dataGovernanceCenter";

const NOW = "2026-06-25T12:00:00.000Z";

export const DATA_INVENTORY_SEED: DataInventoryItem[] = [
  {
    id: "inv_001",
    inventoryRef: "INV-JOURNEY-001",
    name: "Concierge journey records",
    areaId: "inventory",
    dataClass: "highly-confidential",
    system: "concierge_members",
    ownerEmail: "privacy@bamsignal.com",
    recordCount: 2840,
    containsPii: true,
    containsSensitive: true,
    lastReviewedAt: NOW
  },
  {
    id: "inv_002",
    inventoryRef: "INV-MSG-001",
    name: "Member messages",
    areaId: "inventory",
    dataClass: "confidential",
    system: "member_introductions",
    ownerEmail: "privacy@bamsignal.com",
    recordCount: 12400,
    containsPii: true,
    containsSensitive: false,
    lastReviewedAt: NOW
  },
  {
    id: "inv_003",
    inventoryRef: "INV-PAY-001",
    name: "Payment fulfillments",
    areaId: "inventory",
    dataClass: "restricted",
    system: "payment_fulfillments",
    ownerEmail: "finance@bamsignal.com",
    recordCount: 5620,
    containsPii: true,
    containsSensitive: true,
    lastReviewedAt: NOW
  },
  {
    id: "inv_004",
    inventoryRef: "INV-AUDIT-001",
    name: "Audit logs",
    areaId: "inventory",
    dataClass: "internal",
    system: "audit_logs",
    ownerEmail: "ops@bamsignal.com",
    recordCount: 89000,
    containsPii: false,
    containsSensitive: false,
    lastReviewedAt: NOW
  },
  {
    id: "inv_005",
    inventoryRef: "INV-DOC-001",
    name: "Institutional documents",
    areaId: "inventory",
    dataClass: "confidential",
    system: "documents",
    ownerEmail: "governance@bamsignal.com",
    recordCount: 340,
    containsPii: false,
    containsSensitive: false,
    lastReviewedAt: NOW
  }
];

export const RETENTION_POLICY_SEED: RetentionPolicyRecord[] = RETENTION_CATEGORIES.map(
  (category, index) => ({
    id: `ret_${index + 1}`,
    policyRef: `RET-${category.id.toUpperCase().replace(/-/g, "_")}`,
    categoryId: category.id,
    label: category.label,
    retentionDays: [2555, 1095, 1825, 365, 2555, 730, 2555, 2555, 3650][index] ?? 365,
    archiveAfterDays: index < 8 ? 365 : undefined,
    deleteAfterDays: index === 8 ? undefined : [2555, 1095, 1825, 365, 2555, 730, 2555, 2555, 3650][index],
    legalHoldExempt: category.id === "audit-logs" || category.id === "financial-records",
    active: true,
    updatedAt: NOW
  })
);

export const PRIVACY_REQUEST_SEED: PrivacyRequestRecord[] = [
  {
    id: "pr_001",
    requestRef: "PRV-2026-0041",
    requestType: "download",
    status: "processing",
    memberRef: "member_***42",
    submittedAt: "2026-06-24T09:00:00.000Z",
    assignedTo: "privacy@bamsignal.com"
  },
  {
    id: "pr_002",
    requestRef: "PRV-2026-0038",
    requestType: "delete",
    status: "in-review",
    memberRef: "member_***18",
    submittedAt: "2026-06-23T14:30:00.000Z",
    assignedTo: "privacy@bamsignal.com",
    notes: "Identity verification pending"
  },
  {
    id: "pr_003",
    requestRef: "PRV-2026-0035",
    requestType: "correct",
    status: "completed",
    memberRef: "member_***91",
    submittedAt: "2026-06-20T11:00:00.000Z",
    completedAt: "2026-06-21T16:00:00.000Z",
    assignedTo: "support@bamsignal.com"
  },
  {
    id: "pr_004",
    requestRef: "PRV-2026-0032",
    requestType: "consent-withdrawal",
    status: "pending",
    memberRef: "member_***07",
    submittedAt: "2026-06-25T08:15:00.000Z"
  },
  {
    id: "pr_005",
    requestRef: "PRV-2026-0029",
    requestType: "processing-restriction",
    status: "in-review",
    memberRef: "member_***55",
    submittedAt: "2026-06-22T10:00:00.000Z",
    assignedTo: "privacy@bamsignal.com"
  }
];

export const CONSENT_RECORD_SEED: ConsentRecord[] = [
  {
    id: "con_001",
    consentRef: "CON-2026-1204",
    memberRef: "member_***42",
    version: 3,
    purpose: "Signal Concierge matchmaking and introductions",
    scope: "Profile, preferences, consultation notes, messaging",
    status: "active",
    grantedAt: "2026-03-15T10:00:00.000Z",
    auditTrail: [
      { at: "2026-03-15T10:00:00.000Z", actor: "member", action: "consent granted v3" },
      { at: "2026-03-15T10:00:00.000Z", actor: "system", action: "versioned consent stored" }
    ]
  },
  {
    id: "con_002",
    consentRef: "CON-2026-1188",
    memberRef: "member_***18",
    version: 2,
    purpose: "Marketing communications",
    scope: "Email and WhatsApp product updates",
    status: "withdrawn",
    grantedAt: "2025-11-01T08:00:00.000Z",
    withdrawnAt: "2026-06-10T12:00:00.000Z",
    auditTrail: [
      { at: "2025-11-01T08:00:00.000Z", actor: "member", action: "consent granted v2" },
      { at: "2026-06-10T12:00:00.000Z", actor: "member", action: "consent withdrawn" }
    ]
  },
  {
    id: "con_003",
    consentRef: "CON-2026-1156",
    memberRef: "member_***91",
    version: 1,
    purpose: "Platform terms and privacy policy",
    scope: "Core BamSignal membership",
    status: "active",
    grantedAt: "2026-01-20T14:00:00.000Z",
    auditTrail: [
      { at: "2026-01-20T14:00:00.000Z", actor: "member", action: "consent granted v1" }
    ]
  }
];

export const REGIONAL_POLICY_SEED: RegionalPolicyRecord[] = [
  {
    id: "reg_001",
    policyRef: "REG-NG-001",
    region: "Nigeria",
    framework: "NDPR",
    description: "Nigeria Data Protection Regulation baseline — consent, lawful basis, breach notification.",
    active: true,
    updatedAt: NOW
  },
  {
    id: "reg_002",
    policyRef: "REG-EU-001",
    region: "European Union",
    framework: "GDPR",
    description: "GDPR data subject rights — export, erasure, restriction, documented lawful basis.",
    active: true,
    updatedAt: NOW
  },
  {
    id: "reg_003",
    policyRef: "REG-US-CA-001",
    region: "California, USA",
    framework: "CCPA",
    description: "California Consumer Privacy Act — disclosure, opt-out, non-discrimination.",
    active: true,
    updatedAt: NOW
  }
];

export const SENSITIVE_DATA_REGISTER_SEED: SensitiveDataRegister[] = [
  {
    id: "sen_001",
    registerRef: "SEN-PII-001",
    dataType: "Member identity (username, PIN hash, phone, email)",
    dataClass: "highly-confidential",
    systems: ["app_users", "app_member_profiles"],
    encryptionRequired: true,
    accessRestricted: true,
    lastAuditAt: NOW
  },
  {
    id: "sen_002",
    registerRef: "SEN-CONSULT-001",
    dataType: "Consultation notes and compatibility assessments",
    dataClass: "highly-confidential",
    systems: ["concierge_members", "concierge_archives"],
    encryptionRequired: true,
    accessRestricted: true,
    lastAuditAt: NOW
  },
  {
    id: "sen_003",
    registerRef: "SEN-FIN-001",
    dataType: "Payment references and transaction metadata",
    dataClass: "restricted",
    systems: ["payment_events", "payment_fulfillments"],
    encryptionRequired: true,
    accessRestricted: true,
    lastAuditAt: NOW
  },
  {
    id: "sen_004",
    registerRef: "SEN-PHOTO-001",
    dataType: "Member profile photos",
    dataClass: "confidential",
    systems: ["photo storage", "app_member_profiles"],
    encryptionRequired: true,
    accessRestricted: false,
    lastAuditAt: NOW
  }
];

export const LEGAL_HOLD_SEED: LegalHoldRecord[] = [
  {
    id: "lh_001",
    holdRef: "LH-2026-0012",
    memberRef: "member_***18",
    reason: "Pending regulatory inquiry — preserve consultation records",
    placedBy: "legal@bamsignal.com",
    placedAt: "2026-06-20T09:00:00.000Z",
    expiresAt: null,
    active: true
  },
  {
    id: "lh_002",
    holdRef: "LH-2026-0008",
    memberRef: "member_***55",
    reason: "Litigation hold — messaging and payment metadata",
    placedBy: "governance@bamsignal.com",
    placedAt: "2026-05-15T14:00:00.000Z",
    expiresAt: "2026-12-31T23:59:59.000Z",
    active: true
  },
  {
    id: "lh_003",
    holdRef: "LH-2026-0003",
    memberRef: "member_***22",
    reason: "Resolved dispute — hold released",
    placedBy: "legal@bamsignal.com",
    placedAt: "2026-03-01T10:00:00.000Z",
    expiresAt: "2026-06-01T10:00:00.000Z",
    active: false
  }
];

export const POLICY_VERSION_SEED: PolicyVersionRecord[] = [
  {
    id: "pv_001",
    policyRef: "POL-PRIV-003",
    name: "BamSignal Privacy Policy",
    version: 3,
    publishedAt: "2026-04-01T08:00:00.000Z",
    publishedBy: "privacy@bamsignal.com",
    active: true
  },
  {
    id: "pv_002",
    policyRef: "POL-TERMS-002",
    name: "Terms of Service",
    version: 2,
    publishedAt: "2026-01-15T08:00:00.000Z",
    publishedBy: "governance@bamsignal.com",
    active: true
  },
  {
    id: "pv_003",
    policyRef: "POL-PRIV-002",
    name: "BamSignal Privacy Policy",
    version: 2,
    publishedAt: "2025-09-01T08:00:00.000Z",
    publishedBy: "privacy@bamsignal.com",
    active: false
  }
];

export const GOVERNANCE_AUDIT_SEED: GovernanceAuditRecord[] = [
  {
    id: "ga_001",
    action: "accessed",
    actor: "privacy@bamsignal.com",
    target: "member_***42",
    at: "2026-06-25T11:30:00.000Z",
    detail: "Reviewed member profile for export request PRV-2026-0041"
  },
  {
    id: "ga_002",
    action: "exported",
    actor: "privacy@bamsignal.com",
    target: "member_***91",
    at: "2026-06-21T16:05:00.000Z",
    detail: "Data package generated for correction request PRV-2026-0035"
  },
  {
    id: "ga_003",
    action: "approved",
    actor: "governance@bamsignal.com",
    target: "POL-PRIV-003",
    at: "2026-04-01T08:00:00.000Z",
    detail: "Privacy policy v3 published"
  },
  {
    id: "ga_004",
    action: "deleted",
    actor: "privacy@bamsignal.com",
    target: "member_***33",
    at: "2026-06-10T15:00:00.000Z",
    detail: "Verified deletion completed per PRV-2026-0019"
  }
];

export const AUDIT_EXPORT_SEED: AuditExportRecord[] = [
  {
    id: "ae_001",
    exportRef: "AEX-2026-0018",
    scope: "Governance audit log — Q2 2026",
    requestedBy: "governance@bamsignal.com",
    generatedAt: "2026-06-24T17:00:00.000Z",
    recordCount: 1240,
    format: "CSV"
  },
  {
    id: "ae_002",
    exportRef: "AEX-2026-0015",
    scope: "Consent records — active members",
    requestedBy: "privacy@bamsignal.com",
    generatedAt: "2026-06-22T10:30:00.000Z",
    recordCount: 2840,
    format: "JSON"
  },
  {
    id: "ae_003",
    exportRef: "AEX-2026-0012",
    scope: "Privacy requests — deletion queue",
    requestedBy: "privacy@bamsignal.com",
    generatedAt: "2026-06-18T14:00:00.000Z",
    recordCount: 18,
    format: "CSV"
  }
];
