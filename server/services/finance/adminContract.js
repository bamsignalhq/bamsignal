import { getFinancialObservabilityMetrics } from "./observability.js";
import { getLatestReconciliationRun } from "./reconciliation.js";
import { listRefundRecords } from "./refunds.js";
import { searchLedgerEntries } from "./ledger.js";
import { isDatabaseReady, query } from "../../db.js";

export async function buildAdminFinancialOperationsContract() {
  const metrics = getFinancialObservabilityMetrics();
  const reconciliation = await getLatestReconciliationRun();
  const pendingRefunds = await listRefundRecords({ status: "pending", limit: 20 });

  let gatewayHealth = { status: "unknown", fulfillmentBacklog: 0 };
  if (isDatabaseReady()) {
    try {
      const backlog = await query(
        `select count(*)::int as count from payment_fulfillments where status in ('pending', 'processing')`
      );
      gatewayHealth = {
        status: "operational",
        fulfillmentBacklog: Number(backlog.rows[0]?.count) || 0
      };
    } catch {
      gatewayHealth = { status: "degraded", fulfillmentBacklog: null };
    }
  }

  const recentTransactions = await searchLedgerEntries({ limit: 20 });

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    gatewayHealth,
    reconciliation: reconciliation
      ? {
          runId: reconciliation.run_id,
          status: reconciliation.status,
          summary: reconciliation.summary,
          discrepancyCount: Array.isArray(reconciliation.discrepancies)
            ? reconciliation.discrepancies.length
            : 0,
          completedAt: reconciliation.completed_at
        }
      : null,
    refundQueue: {
      pendingCount: pendingRefunds.length,
      items: pendingRefunds
    },
    recentTransactions
  };
}
