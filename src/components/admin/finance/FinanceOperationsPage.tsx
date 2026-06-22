import { useCallback, useMemo, useState } from "react";
import {
  FINANCE_AREAS,
  FINANCE_AREA_LABELS,
  FINANCE_OPERATIONS_FUTURE_KINDS,
  FINANCE_STATUSES,
  FINANCE_STATUS_LABELS
} from "../../../constants/financeOperations";
import {
  FINANCE_OPERATIONS_ADMIN_BRAND,
  FINANCE_OPERATIONS_ADMIN_PATH
} from "../../../constants/financeOperationsAdmin";
import type { FinanceAreaId, FinanceStatusId } from "../../../constants/financeOperations";
import { buildFinanceOperationsBundle } from "../../../utils/financeOperationsEngine";
import { emptyFinanceFilters } from "../../../utils/financeOperationsLogic";
import { ConsultantPayoutCard } from "./ConsultantPayoutCard";
import { FinanceOverviewCard, FinanceRecordSummary } from "./FinanceOverviewCard";
import { FinancialTimelineCard } from "./FinancialTimelineCard";
import { PaymentStatusCard } from "./PaymentStatusCard";
import { RefundCard } from "./RefundCard";
import { RevenueCard } from "./RevenueCard";

export function FinanceOperationsPage() {
  const [filters, setFilters] = useState(() => emptyFinanceFilters());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildFinanceOperationsBundle(filters, selectedRecordId);
  }, [filters, refreshKey, selectedRecordId]);

  const selectedRecord =
    bundle.records.find((record) => record.id === selectedRecordId) ?? bundle.selectedRecord;

  const handleReset = useCallback(() => {
    setFilters(emptyFinanceFilters());
    setSelectedRecordId(null);
  }, []);

  return (
    <div className="finance-operations-page">
      <header className="finance-operations-page__head">
        <div>
          <h2>{FINANCE_OPERATIONS_ADMIN_BRAND}</h2>
          <p>
            Financial operations layer for Paystack payments — revenue, consultation fees,
            refunds, settlements, operational costs, and consultant payouts with immutable records.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <FinanceOverviewCard metrics={bundle.metrics} recordCount={bundle.records.length} />

      <div className="finance-operations-page__filters">
        <label className="finance-search-field">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Ref, Paystack, journey, audit…"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="finance-search-field">
          <span>Area</span>
          <select
            value={filters.areaId}
            onChange={(event) =>
              setFilters({ ...filters, areaId: event.target.value as FinanceAreaId | "all" })
            }
          >
            <option value="all">All areas</option>
            {FINANCE_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {FINANCE_AREA_LABELS[area.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="finance-search-field">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value as FinanceStatusId | "all" })
            }
          >
            <option value="all">All statuses</option>
            {FINANCE_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {FINANCE_STATUS_LABELS[status.id]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="finance-operations-page__body">
        <div className="finance-operations-page__column">
          <RevenueCard records={bundle.records} />
          <PaymentStatusCard
            records={bundle.records}
            selectedRecordId={selectedRecordId}
            onSelectRecord={setSelectedRecordId}
          />
          <RefundCard records={bundle.records} />
          <ConsultantPayoutCard records={bundle.records} />
        </div>

        <div className="finance-operations-page__detail">
          {selectedRecord ? (
            <>
              <section className="finance-operations-page__selected">
                <h3>{selectedRecord.transactionRef}</h3>
                <p>{selectedRecord.description}</p>
                <FinanceRecordSummary record={selectedRecord} />
              </section>
              <FinancialTimelineCard
                timeline={selectedRecord.timeline}
                transactionRef={selectedRecord.transactionRef}
              />
            </>
          ) : (
            <p className="finance-operations-page__empty">
              Select a payment record to view financial timeline and audit links.
            </p>
          )}
        </div>
      </div>

      <footer className="finance-operations-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {FINANCE_OPERATIONS_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {FINANCE_OPERATIONS_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
