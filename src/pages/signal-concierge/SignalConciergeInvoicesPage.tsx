import { useCallback, useEffect, useState } from "react";
import { CommercialReceiptCard } from "../../components/commercial/CommercialOutcomeCard";
import { COMMERCIAL_PRODUCT_LABELS, COMMERCIAL_RECEIPT } from "../../constants/commercialExperience";
import { SIGNAL_CONCIERGE_ROUTES } from "../../constants/signalConciergeRoutes";
import { startConciergeInvoicePayment } from "../../services/payments";
import type { UserProfile } from "../../types";
import {
  conciergeInvoiceOutstandingKobo,
  fetchConciergeMemberCase,
  formatConciergeInvoiceAmount,
  isConciergeInvoicePayable,
  type ConciergeMemberCaseEvent,
  type ConciergeMemberCasePayload,
  type ConciergeMemberInvoice
} from "../../utils/conciergeMemberApi";
import { SignalConciergePageShell, type SignalConciergePageShellProps } from "./SignalConciergePageShell";

type SignalConciergeInvoicesPageProps = Omit<
  SignalConciergePageShellProps,
  "children" | "showStatusLink" | "showDashboardLink"
> & {
  user: UserProfile | null;
};

const EVENT_LABELS: Record<string, string> = {
  APPLICATION_SUBMITTED: "Application received",
  REVIEW_STARTED: "Review started",
  APPLICATION_ACCEPTED: "Application accepted",
  APPLICATION_REJECTED: "Application not accepted",
  CONSULTANT_ASSIGNED: "Consultant assigned",
  CONSULTANT_TRANSFERRED: "Consultant transferred",
  INVOICE_CREATED: "Invoice prepared",
  INVOICE_SENT: "Invoice issued",
  INVOICE_PAID: "Invoice paid",
  INVOICE_CANCELLED: "Invoice cancelled",
  PROGRESS_RECORDED: "Progress update",
  CASE_COMPLETED: "Case completed",
  CASE_CLOSED: "Case closed",
  CASE_REOPENED: "Case reopened",
  STATUS_CHANGED: "Status updated",
  NOTE_ADDED: "Note added"
};

function statusLabel(status: string): string {
  const value = String(status || "").replace(/_/g, " ");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
}

export function SignalConciergeInvoicesPage({ user, ...shellProps }: SignalConciergeInvoicesPageProps) {
  const [payload, setPayload] = useState<ConciergeMemberCasePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const next = await fetchConciergeMemberCase();
    if (!next.ok && next.error === "case_not_found") {
      setPayload({ ok: true, case: null, invoices: [], history: [], payments: { outstandingKobo: 0, paidCount: 0, openCount: 0 } });
      setError(null);
    } else if (!next.ok) {
      setError(next.error || "Unable to load your Concierge case.");
      setPayload(null);
    } else {
      setError(null);
      setPayload(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onPay = async (invoice: ConciergeMemberInvoice) => {
    if (!user) {
      setError("Sign in to pay your invoice.");
      return;
    }
    setPayingId(invoice.id);
    setError(null);
    const result = await startConciergeInvoicePayment(invoice.id, user, undefined, {
      returnPath: SIGNAL_CONCIERGE_ROUTES.invoices,
      sourcePage: SIGNAL_CONCIERGE_ROUTES.invoices
    });
    setPayingId(null);
    if (!result.ok && !result.redirected) {
      setError(result.error || "Unable to start invoice payment.");
    }
  };

  const invoices = payload?.invoices || [];
  const history = payload?.history || [];
  const caseRow = payload?.case || null;
  const payments = payload?.payments;

  return (
    <SignalConciergePageShell {...shellProps} showDashboardLink showStatusLink>
      <section className="member-journey-dashboard sc-reveal">
        <header className="member-journey-dashboard__head signal-concierge-glass">
          <p className="member-journey-dashboard__eyebrow">Signal Concierge™</p>
          <h2>Case, invoices & payments</h2>
          <p>View your consultant, case progress, invoices, and receipts. Paying an invoice never changes membership.</p>
          {caseRow ? (
            <p className="member-journey-dashboard__journey-id">
              Status: <strong>{statusLabel(caseRow.opsStatus || "")}</strong>
              {caseRow.journeyId ? (
                <>
                  {" "}
                  · Journey <strong>{caseRow.journeyId}</strong>
                </>
              ) : null}
              {caseRow.consultantId ? (
                <>
                  {" "}
                  · Consultant <strong>{caseRow.consultantId}</strong>
                </>
              ) : null}
            </p>
          ) : null}
        </header>

        {loading ? <p className="signal-concierge-glass" style={{ padding: "1rem" }}>Loading…</p> : null}
        {error ? (
          <p className="signal-concierge-glass" style={{ padding: "1rem", color: "var(--bs-danger, #b42318)" }}>
            {error}
          </p>
        ) : null}

        {!loading && !caseRow ? (
          <div className="signal-concierge-glass" style={{ padding: "1.25rem" }}>
            <p>No Concierge case yet. Submit an application to begin.</p>
          </div>
        ) : null}

        {payments ? (
          <section className="member-dashboard-card signal-concierge-glass sc-reveal">
            <header className="member-dashboard-card__head">
              <h3>Payment summary</h3>
              <p>Outstanding balances and paid invoices.</p>
            </header>
            <p>
              Outstanding <strong>{formatConciergeInvoiceAmount(payments.outstandingKobo)}</strong>
              {" · "}
              Open {payments.openCount}
              {" · "}
              Paid {payments.paidCount}
            </p>
          </section>
        ) : null}

        <section className="member-dashboard-card signal-concierge-glass sc-reveal">
          <header className="member-dashboard-card__head">
            <h3>Invoices</h3>
            <p>Issued by your consultant. Pay securely — Commerce records payment; Operations advances your case.</p>
          </header>
          {invoices.length === 0 ? (
            <p>No invoices yet.</p>
          ) : (
            <ul className="sc-how-list">
              {invoices.map((invoice) => {
                const outstanding = conciergeInvoiceOutstandingKobo(invoice);
                const payable = isConciergeInvoicePayable(invoice);
                return (
                  <li key={invoice.id} className="sc-how-list__item">
                    <div>
                      <p className="sc-how-list__title">
                        {invoice.invoice_number || invoice.id} · {statusLabel(invoice.status)}
                      </p>
                      <p className="sc-how-list__detail">
                        Total {formatConciergeInvoiceAmount(invoice.total_kobo || 0)}
                        {outstanding > 0 ? ` · Due ${formatConciergeInvoiceAmount(outstanding)}` : ""}
                        {invoice.payment_ref ? ` · Receipt ${invoice.payment_ref}` : ""}
                        {invoice.paid_at ? ` · Paid ${new Date(invoice.paid_at).toLocaleString()}` : ""}
                      </p>
                      {payable && user ? (
                        <button
                          type="button"
                          className="signal-concierge-btn signal-concierge-btn--primary"
                          style={{ marginTop: "0.75rem" }}
                          disabled={payingId === invoice.id}
                          onClick={() => void onPay(invoice)}
                        >
                          {payingId === invoice.id ? "Opening checkout…" : "Pay invoice"}
                        </button>
                      ) : null}
                      {invoice.status === "paid" ? (
                        <div style={{ marginTop: "0.75rem" }}>
                          <CommercialReceiptCard
                            productLabel={`${COMMERCIAL_PRODUCT_LABELS.concierge_invoice} ${
                              invoice.invoice_number || ""
                            }`.trim()}
                            amountLabel={formatConciergeInvoiceAmount(invoice.total_kobo || 0)}
                            reference={invoice.payment_ref}
                            statusLabel={COMMERCIAL_RECEIPT.paid}
                            paidAt={invoice.paid_at}
                          />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={() => void load()}>
            Refresh
          </button>
        </section>

        <section className="member-dashboard-card signal-concierge-glass sc-reveal">
          <header className="member-dashboard-card__head">
            <h3>Case timeline</h3>
            <p>Milestones, status updates, and invoice events.</p>
          </header>
          {history.length === 0 ? (
            <p>No timeline events yet.</p>
          ) : (
            <ul className="sc-how-list">
              {history
                .slice()
                .reverse()
                .map((event: ConciergeMemberCaseEvent) => (
                  <li key={event.id} className="sc-how-list__item">
                    <div>
                      <p className="sc-how-list__title">
                        {EVENT_LABELS[event.eventType] || event.eventType}
                      </p>
                      <p className="sc-how-list__detail">
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
                        {event.toStatus ? ` · ${statusLabel(event.toStatus)}` : ""}
                        {event.notes ? ` · ${event.notes}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </section>
    </SignalConciergePageShell>
  );
}
