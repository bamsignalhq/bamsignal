import type {
  FinanceAreaId,
  FinanceStatusId,
  RefundRequestStatusId,
  ReportPeriodId,
  ReconciliationTypeId
} from "../constants/financeOperations";

export type FinanceTimelineEntry = {
  id: string;
  actor: string;
  timestamp: string;
  action: string;
  note: string;
  auditRef: string | null;
};

export type FinanceRecord = {
  id: string;
  transactionRef: string;
  areaId: FinanceAreaId;
  status: FinanceStatusId;
  amountNgn: number;
  memberRef: string | null;
  consultantRef: string | null;
  journeyRef: string | null;
  paystackReference: string | null;
  auditRef: string | null;
  description: string;
  createdAt: string;
  timeline: FinanceTimelineEntry[];
  chargebackFlag?: boolean;
};

export type FinancialTransactionRecord = {
  id: string;
  transactionRef: string;
  category: FinanceAreaId;
  status: FinanceStatusId;
  amountNgn: number;
  currency: string;
  memberRef?: string;
  consultantRef?: string;
  journeyRef?: string;
  paystackReference?: string;
  chargebackFlag: boolean;
  auditRef?: string;
  description: string;
  recordedAt: string;
  createdAt: string;
};

export type RefundRequestRecord = {
  id: string;
  refundRef: string;
  transactionId?: string;
  requestedByEmail: string;
  amountNgn: number;
  reason: string;
  status: RefundRequestStatusId;
  memberRef?: string;
  journeyRef?: string;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type RefundApprovalRecord = {
  id: string;
  refundRequestId: string;
  approverEmail: string;
  decision: "approved" | "rejected";
  note?: string;
  decidedAt: string;
};

export type ConsultantPayoutRecord = {
  id: string;
  payoutRef: string;
  consultantRef: string;
  amountNgn: number;
  status: FinanceStatusId;
  periodLabel: string;
  consultationsCount: number;
  scheduledAt?: string;
  paidAt?: string;
  auditRef?: string;
};

export type OperatingExpenseRecord = {
  id: string;
  expenseRef: string;
  category: string;
  amountNgn: number;
  vendor?: string;
  status: string;
  incurredAt: string;
  description: string;
  auditRef?: string;
};

export type FinancialReportRecord = {
  id: string;
  reportRef: string;
  periodType: ReportPeriodId;
  periodStart: string;
  periodEnd: string;
  totalRevenueNgn: number;
  totalExpensesNgn: number;
  totalRefundsNgn: number;
  netPositionNgn: number;
  generatedAt: string;
  exportFormats: string[];
};

export type ReconciliationLogRecord = {
  id: string;
  reconciliationRef: string;
  reconciliationType: ReconciliationTypeId;
  status: "pending" | "balanced" | "variance";
  paystackTotalNgn?: number;
  internalTotalNgn?: number;
  varianceNgn?: number;
  reconciledAt?: string;
  notes?: string;
  auditRef?: string;
};

export type FinanceForecastItem = {
  id: string;
  label: string;
  projectedNgn: number;
  confidence: "high" | "medium" | "low";
  horizon: string;
};

export type FinancialHealthMetric = {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "warning" | "critical";
  hint?: string;
};

export type FinanceFilterState = {
  query: string;
  areaId: FinanceAreaId | "all";
  status: FinanceStatusId | "all";
};

export type FinanceMetric = {
  id: import("../constants/financeOperations").FinanceMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type FinanceOperationsBundle = {
  generatedAt: string;
  metrics: FinanceMetric[];
  financialHealth: FinancialHealthMetric[];
  records: FinanceRecord[];
  transactions: FinancialTransactionRecord[];
  refundQueue: RefundRequestRecord[];
  refundApprovals: RefundApprovalRecord[];
  expenses: OperatingExpenseRecord[];
  payouts: ConsultantPayoutRecord[];
  reconciliations: ReconciliationLogRecord[];
  reports: FinancialReportRecord[];
  forecast: FinanceForecastItem[];
  chargebackCount: number;
  selectedRecord: FinanceRecord | null;
};
