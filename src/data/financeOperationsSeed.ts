import type { FinanceRecord } from "../types/financeOperations";

export const FINANCE_OPERATIONS_SEED: FinanceRecord[] = [
  {
    id: "finance_001",
    transactionRef: "FIN-2026-01041",
    areaId: "consultation-fees",
    status: "paid",
    amountNgn: 75000,
    memberRef: "sc_member_ngozi",
    consultantRef: "consultant_ada_okafor",
    journeyRef: "BS-JR-2026-0042",
    paystackReference: "pay_consult_88291",
    auditRef: "audit_002",
    description: "Consultation fee — Paystack verified.",
    createdAt: "2026-06-22T09:30:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-22T09:28:00.000Z",
        action: "payment-initiated",
        note: "Paystack checkout started.",
        auditRef: null
      },
      {
        id: "finance_tl_0002",
        actor: "chidi@bamsignal.com",
        timestamp: "2026-06-22T09:30:00.000Z",
        action: "payment-verified",
        note: "Webhook verified — consultation activated.",
        auditRef: "audit_002"
      }
    ]
  },
  {
    id: "finance_002",
    transactionRef: "FIN-2026-01042",
    areaId: "revenue",
    status: "settled",
    amountNgn: 150000,
    memberRef: "sc_member_tunde",
    consultantRef: null,
    journeyRef: "BS-JR-2026-0038",
    paystackReference: "pay_premium_44102",
    auditRef: "audit_002",
    description: "Premium subscription revenue — settled to BamSignal.",
    createdAt: "2026-06-21T14:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-21T13:55:00.000Z",
        action: "payment-received",
        note: "Paystack charge successful.",
        auditRef: null
      },
      {
        id: "finance_tl_0002",
        actor: "operations@bamsignal.com",
        timestamp: "2026-06-22T08:00:00.000Z",
        action: "settlement-recorded",
        note: "Settlement batch confirmed.",
        auditRef: "audit_002"
      }
    ]
  },
  {
    id: "finance_003",
    transactionRef: "FIN-2026-01043",
    areaId: "refunds",
    status: "refunded",
    amountNgn: 50000,
    memberRef: "sc_member_chidi",
    consultantRef: "consultant_fatima_bello",
    journeyRef: "BS-JR-2026-0035",
    paystackReference: "pay_consult_77102",
    auditRef: "audit_003",
    description: "Consultation refund — duplicate payment.",
    createdAt: "2026-06-20T11:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-20T11:00:00.000Z",
        action: "refund-initiated",
        note: "Refund approved by operations.",
        auditRef: "audit_003"
      },
      {
        id: "finance_tl_0002",
        actor: "system@paystack",
        timestamp: "2026-06-20T11:15:00.000Z",
        action: "refund-completed",
        note: "Paystack refund processed.",
        auditRef: "audit_003"
      }
    ]
  },
  {
    id: "finance_004",
    transactionRef: "FIN-2026-01044",
    areaId: "failed-payments",
    status: "failed",
    amountNgn: 75000,
    memberRef: "sc_member_amara",
    consultantRef: "consultant_chidi_emeka",
    journeyRef: "BS-JR-2026-0045",
    paystackReference: "pay_consult_99001",
    auditRef: null,
    description: "Consultation payment failed — insufficient funds.",
    createdAt: "2026-06-22T10:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-22T10:00:00.000Z",
        action: "payment-failed",
        note: "Paystack declined — insufficient funds.",
        auditRef: null
      }
    ]
  },
  {
    id: "finance_005",
    transactionRef: "FIN-2026-01045",
    areaId: "pending-settlements",
    status: "pending",
    amountNgn: 320000,
    memberRef: null,
    consultantRef: null,
    journeyRef: null,
    paystackReference: "settlement_batch_0622",
    auditRef: null,
    description: "Paystack settlement batch pending — consultation fees.",
    createdAt: "2026-06-22T06:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-22T06:00:00.000Z",
        action: "settlement-pending",
        note: "Awaiting Paystack T+1 settlement.",
        auditRef: null
      }
    ]
  },
  {
    id: "finance_006",
    transactionRef: "FIN-2026-01046",
    areaId: "operational-costs",
    status: "paid",
    amountNgn: 45000,
    memberRef: null,
    consultantRef: null,
    journeyRef: null,
    paystackReference: null,
    auditRef: "audit_004",
    description: "SendChamp SMS operational cost — June.",
    createdAt: "2026-06-19T16:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "operations@bamsignal.com",
        timestamp: "2026-06-19T16:00:00.000Z",
        action: "cost-recorded",
        note: "Monthly SMS cost logged.",
        auditRef: "audit_004"
      }
    ]
  },
  {
    id: "finance_007",
    transactionRef: "FIN-2026-01047",
    areaId: "consultant-payouts",
    status: "pending",
    amountNgn: 125000,
    memberRef: null,
    consultantRef: "consultant_ada_okafor",
    journeyRef: null,
    paystackReference: null,
    auditRef: "audit_001",
    description: "Consultant payout — June consultations.",
    createdAt: "2026-06-22T12:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-22T12:00:00.000Z",
        action: "payout-scheduled",
        note: "Payout queued for finance review.",
        auditRef: "audit_001"
      }
    ]
  },
  {
    id: "finance_008",
    transactionRef: "FIN-2026-01048",
    areaId: "consultant-payouts",
    status: "settled",
    amountNgn: 98000,
    memberRef: null,
    consultantRef: "consultant_fatima_bello",
    journeyRef: null,
    paystackReference: "transfer_fatima_may",
    auditRef: "audit_003",
    description: "Consultant payout — May consultations settled.",
    createdAt: "2026-06-01T10:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "operations@bamsignal.com",
        timestamp: "2026-06-01T10:00:00.000Z",
        action: "payout-approved",
        note: "May payout approved.",
        auditRef: "audit_003"
      },
      {
        id: "finance_tl_0002",
        actor: "operations@bamsignal.com",
        timestamp: "2026-06-02T14:00:00.000Z",
        action: "payout-settled",
        note: "Bank transfer completed.",
        auditRef: "audit_003"
      }
    ]
  },
  {
    id: "finance_009",
    transactionRef: "FIN-2026-01049",
    areaId: "consultation-fees",
    status: "cancelled",
    amountNgn: 75000,
    memberRef: "sc_member_fatima",
    consultantRef: "consultant_ngozi",
    journeyRef: "BS-JR-2026-0040",
    paystackReference: "pay_consult_cancel_01",
    auditRef: null,
    description: "Consultation payment cancelled before completion.",
    createdAt: "2026-06-18T15:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "member_fatima_bello",
        timestamp: "2026-06-18T14:55:00.000Z",
        action: "payment-initiated",
        note: "Checkout started.",
        auditRef: null
      },
      {
        id: "finance_tl_0002",
        actor: "system@bamsignal",
        timestamp: "2026-06-18T15:00:00.000Z",
        action: "payment-cancelled",
        note: "Member abandoned checkout.",
        auditRef: null
      }
    ]
  },
  {
    id: "finance_010",
    transactionRef: "FIN-2026-01050",
    areaId: "consultation-fees",
    status: "paid",
    amountNgn: 75000,
    memberRef: "sc_member_ngozi",
    consultantRef: "consultant_ada_okafor",
    journeyRef: "BS-JR-2026-0042",
    paystackReference: "pay_consult_88292",
    auditRef: "audit_002",
    description: "Follow-up consultation fee — paid today.",
    createdAt: "2026-06-22T14:00:00.000Z",
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-22T14:00:00.000Z",
        action: "payment-verified",
        note: "Paystack webhook verified.",
        auditRef: "audit_002"
      }
    ]
  }
];
