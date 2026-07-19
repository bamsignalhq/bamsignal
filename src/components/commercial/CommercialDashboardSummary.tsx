import { useEffect, useMemo, useState } from "react";
import {
  COMMERCIAL_DASHBOARD,
  COMMERCIAL_PRODUCT_LABELS
} from "../../constants/commercialExperience";
import { navigateToPath } from "../../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES } from "../../constants/signalConciergeRoutes";
import { fetchConciergeMemberCase } from "../../utils/conciergeMemberApi";
import {
  buildCommercialTransactionLedger,
  listUpcomingCommercialExpiries
} from "../../utils/commercialLedger";
import {
  fetchServerPaymentHistory,
  mapServerPaymentsToTransactions
} from "../../utils/serverPaymentHistory";
import { formatEntitlementUntil } from "../../utils/memberEntitlements";
import { getDiscreetStatusSnapshot } from "../../utils/discreetMembership";
import { getSignalPassSnapshot } from "../../services/premiumStatus";
import { CommercialSkeleton } from "./CommercialOutcomeCard";
import { CommercialTransactionList } from "./CommercialTransactionList";

type CommercialDashboardSummaryProps = {
  isPremium: boolean;
  onOpenDiscreet?: () => void;
  showFullHistory?: boolean;
};

export function CommercialDashboardSummary({
  isPremium,
  onOpenDiscreet,
  showFullHistory = true
}: CommercialDashboardSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<
    import("../../utils/conciergeMemberApi").ConciergeMemberInvoice[]
  >([]);
  const [serverPayments, setServerPayments] = useState<
    ReturnType<typeof mapServerPaymentsToTransactions>
  >([]);
  const discover = getSignalPassSnapshot();
  const discreet = getDiscreetStatusSnapshot();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchConciergeMemberCase(), fetchServerPaymentHistory(40)]).then(
      ([casePayload, payments]) => {
        if (cancelled) return;
        setInvoices(casePayload.ok ? casePayload.invoices || [] : []);
        setServerPayments(mapServerPaymentsToTransactions(payments));
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [isPremium]);

  const transactions = useMemo(() => {
    const local = buildCommercialTransactionLedger({ invoices });
    const byId = new Map<string, (typeof local)[number]>();
    for (const row of [...serverPayments, ...local]) {
      if (!byId.has(row.id)) byId.set(row.id, row);
    }
    return Array.from(byId.values()).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }, [invoices, serverPayments, isPremium, discreet.active, discover.expiresAt]);
  const expiries = useMemo(() => listUpcomingCommercialExpiries(5), [transactions]);

  return (
    <section className="commercial-dashboard" aria-labelledby="commercial-dashboard-title">
      <header className="commercial-dashboard__head">
        <p className="commercial-eyebrow">{COMMERCIAL_DASHBOARD.title}</p>
        <h2 id="commercial-dashboard-title" className="premium-center__section-title">
          Overview
        </h2>
        <p className="commercial-muted">{COMMERCIAL_DASHBOARD.subtitle}</p>
      </header>

      <div className="commercial-dashboard__grid">
        <article className="commercial-tile card">
          <p className="commercial-eyebrow">{COMMERCIAL_PRODUCT_LABELS.discover}</p>
          <p className="commercial-tile__value">
            {isPremium && discover.expiresAt
              ? `Until ${formatEntitlementUntil(discover.expiresAt)}`
              : "Not active"}
          </p>
        </article>
        <article className="commercial-tile card">
          <p className="commercial-eyebrow">{COMMERCIAL_PRODUCT_LABELS.discreet}</p>
          <p className="commercial-tile__value">
            {discreet.active && discreet.discreetUntil
              ? `Until ${formatEntitlementUntil(discreet.discreetUntil)}`
              : "Not active"}
          </p>
          {onOpenDiscreet ? (
            <button type="button" className="btn-secondary btn-sm" onClick={onOpenDiscreet}>
              {COMMERCIAL_DASHBOARD.openDiscreet}
            </button>
          ) : null}
        </article>
        <article className="commercial-tile card">
          <p className="commercial-eyebrow">{COMMERCIAL_PRODUCT_LABELS.concierge_invoice}</p>
          <p className="commercial-tile__value">
            {loading
              ? "…"
              : `${invoices.filter((row) => row.status === "paid").length} paid · ${
                  invoices.filter((row) =>
                    ["sent", "partially_paid", "overdue"].includes(String(row.status || ""))
                  ).length
                } open`}
          </p>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.invoices)}
          >
            {COMMERCIAL_DASHBOARD.openInvoices}
          </button>
        </article>
      </div>

      <div className="premium-center__section card">
        <h3 className="premium-center__section-title">{COMMERCIAL_DASHBOARD.upcomingExpiries}</h3>
        {loading ? <CommercialSkeleton rows={2} /> : null}
        {!loading && !expiries.length ? (
          <p className="commercial-empty">No upcoming expiries.</p>
        ) : null}
        {!loading && expiries.length ? (
          <ul className="commercial-tx-list">
            {expiries.map((item) => (
              <li key={item.id} className="commercial-tx-list__item">
                <div>
                  <strong>{item.label}</strong>
                  <p className="commercial-muted">
                    Expires {formatEntitlementUntil(item.expiresAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showFullHistory ? (
        <div className="premium-center__section card">
          <h3 className="premium-center__section-title">{COMMERCIAL_DASHBOARD.history}</h3>
          {loading ? (
            <CommercialSkeleton rows={3} />
          ) : (
            <CommercialTransactionList
              transactions={transactions}
              emptyLabel={COMMERCIAL_DASHBOARD.emptyHistory}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
