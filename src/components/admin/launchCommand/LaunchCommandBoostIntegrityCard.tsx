import { useCallback, useEffect, useState } from "react";
import { adminPostJson } from "../../../utils/adminApi";

type BoostIntegrityDashboard = {
  boostPayments: Array<{
    paystack_reference: string;
    product_id: string;
    status: string;
    fulfilled_at?: string | null;
    entitlement_id?: string | null;
  }>;
  pendingFulfillments: Array<{
    paystack_reference: string;
    product_id: string;
    status: string;
    updated_at?: string;
  }>;
  missingEntitlements: Array<{
    paystack_reference: string;
    product_id: string;
    fulfilled_at?: string | null;
  }>;
  failedActivations: Array<{
    paystack_reference: string;
    product_id: string;
    status: string;
    updated_at?: string;
  }>;
  repairQueue: Array<{
    paystackReference: string;
    productId: string;
    fulfilledAt?: string | null;
  }>;
  recentRepairs: Array<{
    paystack_reference: string;
    product_id: string;
    entitlement_id?: string | null;
    dry_run: boolean;
    source: string;
    created_at: string;
  }>;
};

type DashboardResponse = {
  ok?: boolean;
  dashboard?: BoostIntegrityDashboard;
  error?: string;
};

export function LaunchCommandBoostIntegrityCard() {
  const [dashboard, setDashboard] = useState<BoostIntegrityDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminPostJson<DashboardResponse>(
        "/api/admin/boost-integrity?action=dashboard",
        { limit: 15 }
      );
      if (!response.ok) {
        setError(response.error || "Unable to load boost integrity dashboard.");
        setDashboard(null);
        return;
      }
      if (!response.data.dashboard) {
        setError("Unable to load boost integrity dashboard.");
        setDashboard(null);
        return;
      }
      setError(null);
      setDashboard(response.data.dashboard);
    } catch {
      setError("Boost integrity dashboard unavailable.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="launch-command-card launch-command-boost-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Boost activation integrity</h3>
        <p>Evidence-driven boost payments, entitlements, and repair queue.</p>
      </header>

      {loading ? <p className="launch-command-card__empty">Loading boost integrity…</p> : null}
      {error ? <p className="launch-command-card__empty">{error}</p> : null}

      {dashboard ? (
        <>
          <h4>Missing entitlements ({dashboard.missingEntitlements.length})</h4>
          {dashboard.missingEntitlements.length ? (
            <ul className="launch-command-card__list">
              {dashboard.missingEntitlements.slice(0, 8).map((row) => (
                <li key={row.paystack_reference}>
                  <div className="launch-command-card__row">
                    <strong>{row.product_id}</strong>
                    <span className="launch-command-section-card__status launch-command-section-card__status--critical">
                      missing
                    </span>
                  </div>
                  <div className="launch-command-card__meta">
                    <span>{row.paystack_reference}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No fulfilled boost payments missing entitlements.</p>
          )}

          <h4>Pending fulfillments ({dashboard.pendingFulfillments.length})</h4>
          {dashboard.pendingFulfillments.length ? (
            <ul className="launch-command-card__list">
              {dashboard.pendingFulfillments.slice(0, 5).map((row) => (
                <li key={row.paystack_reference}>
                  <div className="launch-command-card__row">
                    <strong>{row.product_id}</strong>
                    <span>{row.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No pending boost fulfillments.</p>
          )}

          <h4>Recent repairs</h4>
          {dashboard.recentRepairs.length ? (
            <ul className="launch-command-card__list">
              {dashboard.recentRepairs.slice(0, 5).map((row) => (
                <li key={`${row.paystack_reference}-${row.created_at}`}>
                  <div className="launch-command-card__row">
                    <strong>{row.product_id}</strong>
                    <span>{row.dry_run ? "dry-run" : "applied"}</span>
                  </div>
                  <div className="launch-command-card__meta">
                    <span>{row.paystack_reference}</span>
                    <span>{new Date(row.created_at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No repair actions logged yet.</p>
          )}
        </>
      ) : null}

      <button type="button" className="concierge-consultant-btn" onClick={() => void load()}>
        Refresh boost integrity
      </button>
    </section>
  );
}
