import { FINANCE_OPERATIONS_SEED } from "../data/financeOperationsSeed";
import type { FinanceFilterState, FinanceOperationsBundle } from "../types/financeOperations";
import {
  buildFinanceMetrics,
  emptyFinanceFilters,
  filterFinanceRecords,
  findRecordById,
  listFinanceRecords,
  sortRecordsByDate
} from "./financeOperationsLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.financeOperations.v1";

type FinanceOperationsState = {
  records: typeof FINANCE_OPERATIONS_SEED;
  updatedAt: string;
};

function defaultState(): FinanceOperationsState {
  return {
    records: [...FINANCE_OPERATIONS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): FinanceOperationsState {
  const stored = readJson<FinanceOperationsState>(STORAGE_KEY, defaultState());
  if (!stored?.records?.length) return defaultState();
  return stored;
}

export function listFinanceOperationsRecords() {
  return loadState().records;
}

export function buildFinanceOperationsBundle(
  filters: FinanceFilterState = emptyFinanceFilters(),
  selectedRecordId?: string | null
): FinanceOperationsBundle {
  const allRecords = listFinanceOperationsRecords();
  const records = sortRecordsByDate(filterFinanceRecords(allRecords, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildFinanceMetrics(allRecords),
    records,
    selectedRecord: findRecordById(records, selectedRecordId ?? null)
  };
}
