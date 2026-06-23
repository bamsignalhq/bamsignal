import type { AuditEvent } from "../types/auditEngine";

export const INSTITUTIONAL_AUDIT_EVENTS_SEED: AuditEvent[] = [
  {
    id: "inst_audit_001",
    timestamp: "2026-06-22T07:55:00.000Z",
    actor: {
      id: "operator_chidi",
      name: "Chidi Admin",
      email: "chidi@bamsignal.com",
      role: "Admin"
    },
    action: "login",
    target: {
      id: "session_chidi_2206",
      kind: "session",
      label: "Command Center session",
      ref: "session_chidi_2206"
    },
    severity: "info",
    result: "success",
    summary: "Operator signed in to Command Center.",
    ipAddress: "197.210.xxx.xxx"
  },
  {
    id: "inst_audit_002",
    timestamp: "2026-06-22T08:10:00.000Z",
    actor: {
      id: "operator_ada",
      name: "Ada Operations",
      email: "ada@bamsignal.com",
      role: "Operations"
    },
    action: "consultant-assignment",
    target: {
      id: "consultant_ada_okafor",
      kind: "consultant",
      label: "Ada Okafor",
      ref: "consultant_ada_okafor"
    },
    severity: "medium",
    result: "success",
    summary: "Assigned Relationship Consultant to journey BS-JR-2026-0042.",
    journeyId: "BS-JR-2026-0042",
    consultantId: "consultant_ada_okafor",
    memberId: "sc_member_ngozi",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_003",
    timestamp: "2026-06-22T08:45:00.000Z",
    actor: {
      id: "operator_ada",
      name: "Ada Operations",
      email: "ada@bamsignal.com",
      role: "Operations"
    },
    action: "consultant-transfer",
    target: {
      id: "consultant_fatima_bello",
      kind: "consultant",
      label: "Fatima Bello",
      ref: "consultant_fatima_bello"
    },
    severity: "medium",
    result: "success",
    summary: "Transferred journey BS-JR-2026-0038 to Senior Matchmaker coverage.",
    journeyId: "BS-JR-2026-0038",
    consultantId: "consultant_fatima_bello",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_004",
    timestamp: "2026-06-22T09:00:00.000Z",
    actor: {
      id: "operator_fatima",
      name: "Fatima Consultant",
      email: "fatima@bamsignal.com",
      role: "Consultant"
    },
    action: "application-approval",
    target: {
      id: "app_tunde_emeka",
      kind: "application",
      label: "Tunde Emeka application",
      ref: "app_tunde_emeka"
    },
    severity: "medium",
    result: "success",
    summary: "Application approved after values assessment.",
    journeyId: "BS-JR-2026-0038",
    memberId: "sc_member_tunde",
    ipAddress: "41.203.xxx.xxx"
  },
  {
    id: "inst_audit_005",
    timestamp: "2026-06-22T09:30:00.000Z",
    actor: {
      id: "operator_chidi",
      name: "Chidi Admin",
      email: "chidi@bamsignal.com",
      role: "Admin"
    },
    action: "payment-change",
    target: {
      id: "pay_consult_88291",
      kind: "payment",
      label: "Consultation payment",
      ref: "pay_consult_88291"
    },
    severity: "high",
    result: "success",
    summary: "Consultation payment marked paid after Paystack verification.",
    journeyId: "BS-JR-2026-0042",
    memberId: "sc_member_ngozi",
    ipAddress: "197.210.xxx.xxx"
  },
  {
    id: "inst_audit_006",
    timestamp: "2026-06-22T09:45:00.000Z",
    actor: {
      id: "operator_chidi",
      name: "Chidi Admin",
      email: "chidi@bamsignal.com",
      role: "Admin"
    },
    action: "refund",
    target: {
      id: "pay_consult_77102",
      kind: "payment",
      label: "Consultation refund",
      ref: "pay_consult_77102"
    },
    severity: "high",
    result: "success",
    summary: "Partial refund issued after cancelled consultation.",
    journeyId: "BS-JR-2026-0031",
    memberId: "sc_member_amaka",
    ipAddress: "197.210.xxx.xxx"
  },
  {
    id: "inst_audit_007",
    timestamp: "2026-06-22T10:00:00.000Z",
    actor: {
      id: "operator_ngozi",
      name: "Ngozi Operations",
      email: "ngozi@bamsignal.com",
      role: "Operations"
    },
    action: "meeting-creation",
    target: {
      id: "meeting_44102",
      kind: "meeting",
      label: "Introductory consultation",
      ref: "meeting_44102"
    },
    severity: "low",
    result: "success",
    summary: "Google Meet link created for consultation session.",
    journeyId: "BS-JR-2026-0042",
    consultantId: "consultant_ada_okafor",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_008",
    timestamp: "2026-06-22T10:15:00.000Z",
    actor: {
      id: "operator_ngozi",
      name: "Ngozi Operations",
      email: "ngozi@bamsignal.com",
      role: "Operations"
    },
    action: "meeting-cancellation",
    target: {
      id: "meeting_43998",
      kind: "meeting",
      label: "Compatibility review",
      ref: "meeting_43998"
    },
    severity: "medium",
    result: "success",
    summary: "Meeting cancelled after member reschedule request.",
    journeyId: "BS-JR-2026-0031",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_009",
    timestamp: "2026-06-22T10:30:00.000Z",
    actor: {
      id: "operator_ada",
      name: "Ada Operations",
      email: "ada@bamsignal.com",
      role: "Operations"
    },
    action: "introduction-action",
    target: {
      id: "intro_44102",
      kind: "introduction",
      label: "Introduction BS-INT-44102",
      ref: "intro_44102"
    },
    severity: "medium",
    result: "success",
    summary: "Introduction advanced to awaiting-consent.",
    journeyId: "BS-JR-2026-0042",
    consultantId: "consultant_ada_okafor",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_010",
    timestamp: "2026-06-22T11:00:00.000Z",
    actor: {
      id: "operator_ibrahim",
      name: "Ibrahim Admin",
      email: "ibrahim@bamsignal.com",
      role: "Admin"
    },
    action: "archive-update",
    target: {
      id: "archive_journey_0038",
      kind: "archive",
      label: "Journey archive BS-JR-2026-0038",
      ref: "archive_journey_0038"
    },
    severity: "medium",
    result: "success",
    summary: "Journey archive sealed after successful introduction.",
    journeyId: "BS-JR-2026-0038",
    ipAddress: "41.203.xxx.xxx"
  },
  {
    id: "inst_audit_011",
    timestamp: "2026-06-22T11:20:00.000Z",
    actor: {
      id: "operator_ibrahim",
      name: "Ibrahim Admin",
      email: "ibrahim@bamsignal.com",
      role: "Admin"
    },
    action: "document-update",
    target: {
      id: "doc_consultant_handbook",
      kind: "document",
      label: "Consultant handbook v3.2",
      ref: "doc_consultant_handbook"
    },
    severity: "medium",
    result: "success",
    summary: "Published updated consultant handbook revision.",
    ipAddress: "41.203.xxx.xxx"
  },
  {
    id: "inst_audit_012",
    timestamp: "2026-06-22T11:40:00.000Z",
    actor: {
      id: "operator_support",
      name: "Support Desk",
      email: "support@bamsignal.com",
      role: "Support"
    },
    action: "support-escalation",
    target: {
      id: "ticket_8821",
      kind: "support-ticket",
      label: "Ticket #8821",
      ref: "ticket_8821"
    },
    severity: "high",
    result: "success",
    summary: "Escalated billing dispute to operations lead.",
    memberId: "sc_member_amaka",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_013",
    timestamp: "2026-06-22T12:00:00.000Z",
    actor: {
      id: "operator_safety",
      name: "Safety Desk",
      email: "safety@bamsignal.com",
      role: "Operations"
    },
    action: "safety-action",
    target: {
      id: "safety_case_441",
      kind: "safety-case",
      label: "Harassment report #441",
      ref: "safety_case_441"
    },
    severity: "critical",
    result: "success",
    summary: "Shadow ban applied after repeated harassment reports.",
    memberId: "sc_member_reported",
    ipAddress: "102.89.xxx.xxx"
  },
  {
    id: "inst_audit_014",
    timestamp: "2026-06-22T12:30:00.000Z",
    actor: {
      id: "operator_chidi",
      name: "Chidi Admin",
      email: "chidi@bamsignal.com",
      role: "Admin"
    },
    action: "permission-change",
    target: {
      id: "perm_operator_ngozi",
      kind: "permission",
      label: "Ngozi operator role",
      ref: "perm_operator_ngozi"
    },
    severity: "high",
    result: "success",
    summary: "Granted Operations role to ngozi@bamsignal.com.",
    ipAddress: "197.210.xxx.xxx"
  },
  {
    id: "inst_audit_015",
    timestamp: "2026-06-22T13:00:00.000Z",
    actor: {
      id: "operator_chidi",
      name: "Chidi Admin",
      email: "chidi@bamsignal.com",
      role: "Admin"
    },
    action: "logout",
    target: {
      id: "session_chidi_2206",
      kind: "session",
      label: "Command Center session",
      ref: "session_chidi_2206"
    },
    severity: "info",
    result: "success",
    summary: "Operator signed out of Command Center.",
    ipAddress: "197.210.xxx.xxx"
  },
  {
    id: "inst_audit_016",
    timestamp: "2026-06-22T13:15:00.000Z",
    actor: {
      id: "operator_system",
      name: "System",
      email: "system@bamsignal.com",
      role: "System"
    },
    action: "payment-change",
    target: {
      id: "pay_consult_99001",
      kind: "payment",
      label: "Webhook reconciliation",
      ref: "pay_consult_99001"
    },
    severity: "high",
    result: "failed",
    summary: "Paystack webhook signature mismatch during reconciliation.",
    detail: "Signature validation failed — event retained for manual review.",
    ipAddress: "—"
  }
];
