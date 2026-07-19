import { useCallback, useEffect, useState } from "react";
import { adminPostJson } from "../../../utils/adminApi";

type DiscoverCommerceResponse = {
  ok?: boolean;
  error?: string;
  conversationUnlocks?: Array<{
    id: string;
    buyer_user_key: string;
    target_profile_id: string;
    match_id?: string | null;
    source_payment_ref?: string | null;
    created_at: string;
  }>;
  boosts?: {
    boostPayments?: Array<{
      paystack_reference?: string;
      product_id?: string;
      status?: string;
      fulfilled_at?: string | null;
    }>;
    missingEntitlements?: Array<{ paystack_reference?: string }>;
  };
};

export function LaunchCommandDiscoverCommerceCard() {
  const [data, setData] = useState<DiscoverCommerceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminPostJson<DiscoverCommerceResponse>(
        "/api/admin/discover-commerce?action=dashboard",
        { limit: 40 }
      );
      if (!response.ok) {
        setError(response.error || "Unable to load Discover commerce.");
        setData(null);
        return;
      }
      setError(null);
      setData(response.data);
    } catch {
      setError("Discover commerce dashboard unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unlocks = data?.conversationUnlocks || [];
  const payments = data?.boosts?.boostPayments || [];
  const missing = data?.boosts?.missingEntitlements || [];

  return (
    <section className="launch-command-card launch-command-boost-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Discover commerce</h3>
        <p>Unlocks, boosts, and purchase status for Discover products.</p>
      </header>

      {loading ? <p className="launch-command-card__empty">Loading Discover commerce…</p> : null}
      {error ? <p className="launch-command-card__empty">{error}</p> : null}

      {data ? (
        <>
          <p className="launch-command-card__muted">
            Unlocks {unlocks.length} · Boost payments {payments.length} · Missing entitlements {missing.length}
          </p>

          <h4>Conversation unlocks ({unlocks.length})</h4>
          {unlocks.length ? (
            <ul className="launch-command-card__list">
              {unlocks.slice(0, 8).map((row) => (
                <li key={row.id}>
                  <strong>{row.target_profile_id}</strong>
                  <span>
                    {" "}
                    · {row.source_payment_ref || "no ref"} · {new Date(row.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No conversation unlocks yet.</p>
          )}

          <h4>Boost payments ({payments.length})</h4>
          {payments.length ? (
            <ul className="launch-command-card__list">
              {payments.slice(0, 8).map((row, index) => (
                <li key={`${row.paystack_reference || "boost"}-${index}`}>
                  <strong>{row.product_id || "boost"}</strong>
                  <span>
                    {" "}
                    · {row.status || "unknown"} · {row.paystack_reference || "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No recent boost payments.</p>
          )}

          <button type="button" className="btn-secondary btn-sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </>
      ) : null}
    </section>
  );
}
