import { useCallback, useEffect, useState } from "react";
import { adminPostJson } from "../../../utils/adminApi";

type DiscreetDashboard = {
  ok?: boolean;
  error?: string;
  events?: Array<{
    id: string;
    event_type: string;
    member_id?: string | null;
    source_payment_ref?: string | null;
    created_at: string;
  }>;
  activeMemberships?: Array<{
    id: string;
    member_id: string;
    ends_at?: string | null;
    source_payment_ref?: string | null;
    status: string;
  }>;
  product?: { priceNgn?: number; days?: number };
};

export function LaunchCommandDiscreetMembershipCard() {
  const [data, setData] = useState<DiscreetDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminPostJson<DiscreetDashboard>(
        "/api/admin/discreet-membership?action=dashboard",
        { limit: 40 }
      );
      if (!response.ok) {
        setError(response.error || "Unable to load Discreet membership.");
        setData(null);
        return;
      }
      setError(null);
      setData(response.data);
    } catch {
      setError("Discreet membership dashboard unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const events = data?.events || [];
  const active = data?.activeMemberships || [];
  const renewals = events.filter((row) => row.event_type === "MEMBERSHIP_RENEWED").length;
  const refunds = events.filter((row) => row.event_type === "REFUND_APPLIED").length;

  return (
    <section className="launch-command-card launch-command-boost-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Discreet Membership</h3>
        <p>Active members, renewals, refunds, and audit events (Commerce-owned).</p>
      </header>

      {loading ? <p className="launch-command-card__empty">Loading Discreet…</p> : null}
      {error ? <p className="launch-command-card__empty">{error}</p> : null}

      {data ? (
        <>
          <p className="launch-command-card__muted">
            Active {active.length} · Renewals {renewals} · Refunds {refunds} · ₦
            {data.product?.priceNgn?.toLocaleString("en-NG") || "9,999"} / {data.product?.days || 30}d
          </p>

          <h4>Active ({active.length})</h4>
          {active.length ? (
            <ul className="launch-command-card__list">
              {active.slice(0, 6).map((row) => (
                <li key={row.id}>
                  <strong>{row.member_id}</strong>
                  <span>
                    {" "}
                    · until {row.ends_at ? new Date(row.ends_at).toLocaleString() : "open"} ·{" "}
                    {row.source_payment_ref || "manual"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No active Discreet memberships.</p>
          )}

          <h4>Audit ({events.length})</h4>
          {events.length ? (
            <ul className="launch-command-card__list">
              {events.slice(0, 8).map((row) => (
                <li key={row.id}>
                  <strong>{row.event_type}</strong>
                  <span>
                    {" "}
                    · {row.source_payment_ref || "—"} · {new Date(row.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No Discreet commerce events yet.</p>
          )}

          <button type="button" className="btn-secondary btn-sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </>
      ) : null}
    </section>
  );
}
