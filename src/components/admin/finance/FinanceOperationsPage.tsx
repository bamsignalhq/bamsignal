import { useMemo, useState } from "react";
import {
  FINANCE_INTEGRATIONS,
  FINANCE_OPERATIONS_FUTURE_KINDS
} from "../../../constants/financeOperations";
import {
  FINANCE_OPERATIONS_ADMIN_BRAND,
  FINANCE_OPERATIONS_ADMIN_PATH
} from "../../../constants/financeOperationsAdmin";
import { buildFinanceOperationsBundle } from "../../../utils/financeOperationsEngine";
import { ExpenseCard } from "./ExpenseCard";
import { FinancialHealthCard } from "./FinancialHealthCard";
import { ForecastCard } from "./ForecastCard";
import { PayoutCard } from "./PayoutCard";
import { ReconciliationCard } from "./ReconciliationCard";
import { RefundQueueCard } from "./RefundQueueCard";
import { RevenueCard } from "./RevenueCard";

export function FinanceOperationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildFinanceOperationsBundle();
  }, [refreshKey]);

  return (
    <div className="finance-operations-page">
      <header className="finance-operations-page__head">
        <div>
          <h2>{FINANCE_OPERATIONS_ADMIN_BRAND}</h2>
          <p>
            Institutional finance governance — revenue reporting, consultation revenue, refund
            workflow, chargeback tracking, expenses, consultant payouts, reconciliation, and
            reports. Paystack handles payment processing; this center governs institutional finance.
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

      <FinancialHealthCard metrics={bundle.financialHealth} />

      <div className="finance-operations-page__body">
        <div className="finance-operations-page__column">
          <RevenueCard metrics={bundle.metrics} reports={bundle.reports} />
          <ExpenseCard expenses={bundle.expenses} />
          <RefundQueueCard refunds={bundle.refundQueue} approvals={bundle.refundApprovals} />
          <ReconciliationCard reconciliations={bundle.reconciliations} />
        </div>
        <div className="finance-operations-page__column">
          <PayoutCard payouts={bundle.payouts} />
          <ForecastCard forecast={bundle.forecast} />
        </div>
      </div>

      <footer className="finance-operations-page__integrations">
        <h4>Integrations</h4>
        <p>{FINANCE_INTEGRATIONS.map((item) => item.label).join(" · ")}</p>
      </footer>

      <footer className="finance-operations-page__future">
        <h4>Future-ready (documented only)</h4>
        <p>{FINANCE_OPERATIONS_FUTURE_KINDS.map((item) => item.label).join(" · ")}</p>
        <span>Route: {FINANCE_OPERATIONS_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
