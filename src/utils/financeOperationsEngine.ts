import type { FinanceFilterState, FinanceOperationsBundle } from "../types/financeOperations";
import {
  buildFinanceForecast,
  buildFinanceMetrics,
  buildFinancialHealthMetrics,
  emptyFinanceFilters,
  filterFinanceRecords,
  findRecordById,
  mapRecordsToTransactions,
  sortRecordsByDate
} from "./financeOperationsLogic";
import {
  listConsultantPayouts,
  listFinanceOperationsRecords,
  listFinancialReports,
  listOperatingExpenses,
  listReconciliationLogs,
  listRefundApprovals,
  listRefundRequests
} from "./financeOperationsStore";

export { emptyFinanceFilters, listFinanceOperationsRecords };

export function buildFinanceOperationsBundle(
  filters: FinanceFilterState = emptyFinanceFilters(),
  selectedRecordId?: string | null
): FinanceOperationsBundle {
  const allRecords = listFinanceOperationsRecords();
  const records = sortRecordsByDate(filterFinanceRecords(allRecords, filters));
  const refundQueue = listRefundRequests();
  const reconciliations = listReconciliationLogs();

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildFinanceMetrics(allRecords),
    financialHealth: buildFinancialHealthMetrics(
      allRecords,
      refundQueue.filter((item) => item.status === "pending").length,
      reconciliations.filter((item) => item.status === "variance").length
    ),
    records,
    transactions: mapRecordsToTransactions(allRecords),
    refundQueue,
    refundApprovals: listRefundApprovals(),
    expenses: listOperatingExpenses(),
    payouts: listConsultantPayouts(),
    reconciliations,
    reports: listFinancialReports(),
    forecast: buildFinanceForecast(allRecords),
    chargebackCount: allRecords.filter((r) => r.areaId === "chargebacks" || r.chargebackFlag).length,
    selectedRecord: findRecordById(records, selectedRecordId ?? null)
  };
}
