import { useCallback, useEffect, useState } from "react";
import { adminPostJson } from "../../../utils/adminApi";

type OpsCase = {
  memberId?: string;
  journeyId?: string | null;
  opsStatus?: string | null;
  consultantId?: string | null;
  assignedAt?: string | null;
};

type OpsDashboard = {
  ok?: boolean;
  error?: string;
  cases?: OpsCase[];
};

export function LaunchCommandConciergeOpsCard() {
  const [data, setData] = useState<OpsDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<{
    invoices?: Array<{ id: string; status: string; invoice_number?: string; total_kobo?: number }>;
    history?: Array<{ id: string; event_type: string; created_at: string }>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminPostJson<OpsDashboard>("/api/concierge-operations?action=list-cases", {
        limit: 40
      });
      if (!response.ok) {
        setError(response.error || "Unable to load Concierge operations.");
        setData(null);
        return;
      }
      setError(null);
      setData(response.data);
    } catch {
      setError("Concierge operations dashboard unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCase = useCallback(async (memberId: string) => {
    setSelectedMemberId(memberId);
    try {
      const response = await adminPostJson<{
        ok?: boolean;
        invoices?: Array<{ id: string; status: string; invoice_number?: string; total_kobo?: number }>;
        history?: Array<{ id: string; event_type: string; created_at: string }>;
      }>("/api/concierge-operations?action=get-case", { memberId });
      if (response.ok) {
        setCaseDetail({
          invoices: response.data?.invoices || [],
          history: response.data?.history || []
        });
      } else {
        setCaseDetail(null);
      }
    } catch {
      setCaseDetail(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cases = data?.cases || [];
  const assigned = cases.filter((row) => row.opsStatus === "assigned" || row.opsStatus === "in_progress").length;
  const applied = cases.filter((row) => row.opsStatus === "applied" || row.opsStatus === "under_review").length;

  return (
    <section className="launch-command-card launch-command-boost-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Signal Concierge Operations</h3>
        <p>Cases, consultants, invoices, payments, and events (Ops engine — invoices never grant membership).</p>
      </header>

      {loading ? <p className="launch-command-card__empty">Loading Concierge ops…</p> : null}
      {error ? <p className="launch-command-card__empty">{error}</p> : null}

      {data ? (
        <>
          <p className="launch-command-card__muted">
            Cases {cases.length} · In pipeline {applied} · Active stewardship {assigned}
          </p>

          <h4>Cases ({cases.length})</h4>
          {cases.length ? (
            <ul className="launch-command-card__list">
              {cases.slice(0, 8).map((row) => (
                <li key={row.memberId || row.journeyId || Math.random()}>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => row.memberId && void loadCase(row.memberId)}
                  >
                    {row.memberId}
                  </button>
                  <span>
                    {" "}
                    · {row.opsStatus || "—"} · {row.consultantId || "unassigned"} · {row.journeyId || "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="launch-command-card__empty">No Concierge cases yet.</p>
          )}

          {selectedMemberId && caseDetail ? (
            <>
              <h4>Case detail · {selectedMemberId}</h4>
              <p className="launch-command-card__muted">
                Invoices {(caseDetail.invoices || []).length} · Events {(caseDetail.history || []).length}
              </p>
              <ul className="launch-command-card__list">
                {(caseDetail.invoices || []).slice(0, 5).map((invoice) => (
                  <li key={invoice.id}>
                    <strong>{invoice.invoice_number || invoice.id}</strong>
                    <span>
                      {" "}
                      · {invoice.status} · ₦{Math.round(Number(invoice.total_kobo || 0) / 100).toLocaleString("en-NG")}
                    </span>
                  </li>
                ))}
                {(caseDetail.history || []).slice(-5).map((event) => (
                  <li key={event.id}>
                    <strong>{event.event_type}</strong>
                    <span> · {new Date(event.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <button type="button" className="btn-secondary btn-sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </>
      ) : null}
    </section>
  );
}
