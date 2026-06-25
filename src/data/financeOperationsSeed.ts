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
  },
  {
    id: "finance_011",
    transactionRef: "FIN-2026-01051",
    areaId: "chargebacks",
    status: "pending",
    amountNgn: 150000,
    memberRef: "sc_member_dispute",
    consultantRef: null,
    journeyRef: "BS-JR-2026-0030",
    paystackReference: "pay_premium_dispute_01",
    auditRef: "audit_005",
    description: "Chargeback initiated — member dispute on premium subscription.",
    createdAt: "2026-06-23T09:00:00.000Z",
    chargebackFlag: true,
    timeline: [
      {
        id: "finance_tl_0001",
        actor: "system@paystack",
        timestamp: "2026-06-23T09:00:00.000Z",
        action: "chargeback-opened",
        note: "Paystack chargeback notification received.",
        auditRef: "audit_005"
      }
    ]
  }
];

const NOW = "2026-06-24T10:00:00.000Z";

export const REFUND_REQUEST_SEED = [
  {
    id: "fr100000-0000-4000-8000-000000000001",
    refundRef: "REF-2026-0044",
    transactionId: "finance_003",
    requestedByEmail: "support@bamsignal.com",
    amountNgn: 50000,
    reason: "Duplicate consultation payment",
    status: "processed" as const,
    memberRef: "sc_member_chidi",
    journeyRef: "BS-JR-2026-0035",
    paystackReference: "pay_consult_77102",
    createdAt: "2026-06-20T10:30:00.000Z",
    updatedAt: "2026-06-20T11:15:00.000Z"
  },
  {
    id: "fr100000-0000-4000-8000-000000000002",
    refundRef: "REF-2026-0051",
    transactionId: "finance_001",
    requestedByEmail: "ops@bamsignal.com",
    amountNgn: 75000,
    reason: "Consultation cancelled within grace period",
    status: "pending" as const,
    memberRef: "sc_member_ngozi",
    journeyRef: "BS-JR-2026-0042",
    paystackReference: "pay_consult_88291",
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const REFUND_APPROVAL_SEED = [
  {
    id: "fa100000-0000-4000-8000-000000000001",
    refundRequestId: "fr100000-0000-4000-8000-000000000001",
    approverEmail: "finance@bamsignal.com",
    decision: "approved" as const,
    note: "Duplicate verified — approved for Paystack refund.",
    decidedAt: "2026-06-20T11:00:00.000Z"
  }
];

export const CONSULTANT_PAYOUT_SEED = [
  {
    id: "cp100000-0000-4000-8000-000000000001",
    payoutRef: "PAY-2026-06-ADA",
    consultantRef: "consultant_ada_okafor",
    amountNgn: 125000,
    status: "pending" as const,
    periodLabel: "June 2026",
    consultationsCount: 8,
    scheduledAt: "2026-06-28T10:00:00.000Z",
    auditRef: "audit_001"
  },
  {
    id: "cp100000-0000-4000-8000-000000000002",
    payoutRef: "PAY-2026-05-FAT",
    consultantRef: "consultant_fatima_bello",
    amountNgn: 98000,
    status: "settled" as const,
    periodLabel: "May 2026",
    consultationsCount: 6,
    paidAt: "2026-06-02T14:00:00.000Z",
    auditRef: "audit_003"
  }
];

export const OPERATING_EXPENSE_SEED = [
  {
    id: "ex100000-0000-4000-8000-000000000001",
    expenseRef: "EXP-2026-0619-SMS",
    category: "messaging",
    amountNgn: 45000,
    vendor: "Sendchamp",
    status: "recorded",
    incurredAt: "2026-06-19T16:00:00.000Z",
    description: "SMS operational cost — June",
    auditRef: "audit_004"
  },
  {
    id: "ex100000-0000-4000-8000-000000000002",
    expenseRef: "EXP-2026-0620-INFRA",
    category: "infrastructure",
    amountNgn: 180000,
    vendor: "Coolify / hosting",
    status: "recorded",
    incurredAt: "2026-06-20T08:00:00.000Z",
    description: "Server and database hosting — June",
    auditRef: "audit_004"
  }
];

export const FINANCIAL_REPORT_SEED = [
  {
    id: "rp100000-0000-4000-8000-000000000001",
    reportRef: "RPT-DAILY-20260624",
    periodType: "daily" as const,
    periodStart: "2026-06-24T00:00:00.000Z",
    periodEnd: "2026-06-24T23:59:59.000Z",
    totalRevenueNgn: 150000,
    totalExpensesNgn: 0,
    totalRefundsNgn: 0,
    netPositionNgn: 150000,
    generatedAt: NOW,
    exportFormats: ["csv", "pdf"]
  },
  {
    id: "rp100000-0000-4000-8000-000000000002",
    reportRef: "RPT-MONTHLY-202606",
    periodType: "monthly" as const,
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-30T23:59:59.000Z",
    totalRevenueNgn: 975000,
    totalExpensesNgn: 225000,
    totalRefundsNgn: 50000,
    netPositionNgn: 700000,
    generatedAt: NOW,
    exportFormats: ["csv", "pdf"]
  },
  {
    id: "rp100000-0000-4000-8000-000000000003",
    reportRef: "RPT-QUARTERLY-2026Q2",
    periodType: "quarterly" as const,
    periodStart: "2026-04-01T00:00:00.000Z",
    periodEnd: "2026-06-30T23:59:59.000Z",
    totalRevenueNgn: 2850000,
    totalExpensesNgn: 640000,
    totalRefundsNgn: 120000,
    netPositionNgn: 2090000,
    generatedAt: NOW,
    exportFormats: ["csv", "pdf"]
  },
  {
    id: "rp100000-0000-4000-8000-000000000004",
    reportRef: "RPT-YEARLY-2026",
    periodType: "yearly" as const,
    periodStart: "2026-01-01T00:00:00.000Z",
    periodEnd: "2026-12-31T23:59:59.000Z",
    totalRevenueNgn: 5200000,
    totalExpensesNgn: 1100000,
    totalRefundsNgn: 180000,
    netPositionNgn: 3920000,
    generatedAt: NOW,
    exportFormats: ["csv", "pdf"]
  },
  {
    id: "rp100000-0000-4000-8000-000000000005",
    reportRef: "RPT-LIFETIME",
    periodType: "lifetime" as const,
    periodStart: "2024-01-01T00:00:00.000Z",
    periodEnd: NOW,
    totalRevenueNgn: 12400000,
    totalExpensesNgn: 2800000,
    totalRefundsNgn: 420000,
    netPositionNgn: 9180000,
    generatedAt: NOW,
    exportFormats: ["csv", "pdf"]
  }
];

export const RECONCILIATION_LOG_SEED = [
  {
    id: "rc100000-0000-4000-8000-000000000001",
    reconciliationRef: "REC-DAILY-20260624",
    reconciliationType: "daily" as const,
    status: "balanced" as const,
    paystackTotalNgn: 225000,
    internalTotalNgn: 225000,
    varianceNgn: 0,
    reconciledAt: "2026-06-24T06:30:00.000Z",
    notes: "Daily Paystack vs internal ledger — matched.",
    auditRef: "audit_002"
  },
  {
    id: "rc100000-0000-4000-8000-000000000002",
    reconciliationRef: "REC-MONTHLY-202605",
    reconciliationType: "monthly" as const,
    status: "variance" as const,
    paystackTotalNgn: 810000,
    internalTotalNgn: 805000,
    varianceNgn: 5000,
    reconciledAt: "2026-06-01T08:00:00.000Z",
    notes: "Minor settlement timing variance — documented.",
    auditRef: "audit_003"
  },
  {
    id: "rc100000-0000-4000-8000-000000000003",
    reconciliationRef: "REC-QUARTERLY-2026Q1",
    reconciliationType: "quarterly" as const,
    status: "balanced" as const,
    paystackTotalNgn: 2100000,
    internalTotalNgn: 2100000,
    varianceNgn: 0,
    reconciledAt: "2026-04-02T10:00:00.000Z",
    auditRef: "audit_004"
  },
  {
    id: "rc100000-0000-4000-8000-000000000004",
    reconciliationRef: "REC-ANNUAL-2025",
    reconciliationType: "annual" as const,
    status: "balanced" as const,
    paystackTotalNgn: 4800000,
    internalTotalNgn: 4800000,
    varianceNgn: 0,
    reconciledAt: "2026-01-05T09:00:00.000Z",
    auditRef: "audit_004"
  }
];
