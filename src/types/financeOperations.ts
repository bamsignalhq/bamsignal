import type { FinanceAreaId, FinanceStatusId } from "../constants/financeOperations";

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
  records: FinanceRecord[];
  selectedRecord: FinanceRecord | null;
};
