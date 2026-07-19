import { ArrowLeft, Check, EyeOff } from "lucide-react";
import { useMemo } from "react";
import {
  DISCREET_BENEFITS,
  DISCREET_PLAN,
  DISCREET_STILL_ALLOWED
} from "../constants/discreetMembership";
import { COMMERCIAL_DASHBOARD } from "../constants/commercialExperience";
import { MONETIZATION_COPY } from "../constants/copy";
import { CommercialTransactionList } from "../components/commercial/CommercialTransactionList";
import {
  formatDiscreetWhen,
  getDiscreetStatusSnapshot,
  listLocalDiscreetHistory,
  remainingDiscreetTimeLabel
} from "../utils/discreetMembership";
import {
  premiumRenewalMessage,
  resolvePremiumRenewalStage
} from "../utils/premiumRenewal";
import type { CommercialTransaction } from "../utils/commercialLedger";

type DiscreetCenterPageProps = {
  onBack: () => void;
  onPurchase: () => void;
  loading?: boolean;
};

export function DiscreetCenterPage({ onBack, onPurchase, loading }: DiscreetCenterPageProps) {
  const status = getDiscreetStatusSnapshot();
  const history = useMemo(() => listLocalDiscreetHistory(), [status.active, status.discreetUntil]);
  const historyRows = useMemo<CommercialTransaction[]>(
    () =>
      history.map((entry) => ({
        id: entry.id,
        kind: "discreet" as const,
        label: entry.label,
        detail: entry.endsAt
          ? `Until ${formatDiscreetWhen(entry.endsAt)}`
          : formatDiscreetWhen(entry.at),
        at: entry.at,
        status:
          entry.status === "Active" || entry.status === "Expired"
            ? entry.status
            : entry.status === "Refunded" || entry.status === "Revoked"
              ? "Expired"
              : "Event",
        expiresAt: entry.endsAt
      })),
    [history]
  );
  const renewalStage = resolvePremiumRenewalStage(status.discreetUntil);
  const renewalCopy = premiumRenewalMessage(renewalStage);

  return (
    <div className="page premium-page premium-page--fintech premium-center">
      <header className="premium-page__head premium-page__head--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="premium-page__title premium-page__title-row">
            Discreet Membership{" "}
            <EyeOff size={20} className="premium-page__star" aria-hidden />
          </h1>
          <p className="premium-page__subtitle">
            Full Discover power while you remain undiscoverable.
          </p>
        </div>
      </header>

      {status.active ? (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Discreet active</p>
          <p className="premium-center__remaining">
            {remainingDiscreetTimeLabel(status.discreetUntil)}
          </p>
          {status.discreetUntil ? (
            <p className="premium-center__muted">
              Expires {formatDiscreetWhen(status.discreetUntil)}
            </p>
          ) : null}
          {renewalCopy ? <p className="premium-center__renewal">{renewalCopy}</p> : null}
        </section>
      ) : (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Discreet Membership</p>
          <p className="premium-center__muted">
            Hidden from Discover, Search, Nearby, Suggestions, Recommendations, and People You May
            Like — while you keep browsing, searching, Signaling, and chatting.
          </p>
        </section>
      )}

      <section className="premium-center__section card" aria-labelledby="discreet-benefits-title">
        <h2 id="discreet-benefits-title" className="premium-center__section-title">
          Benefits
        </h2>
        <ul className="premium-center__benefits">
          {DISCREET_BENEFITS.map((feature) => (
            <li key={feature.id}>
              <Check size={16} aria-hidden />
              <div>
                <strong>{feature.label}</strong>
                <p className="premium-center__muted">{feature.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="premium-center__section card" aria-labelledby="discreet-allowed-title">
        <h2 id="discreet-allowed-title" className="premium-center__section-title">
          Still allowed
        </h2>
        <ul className="premium-center__benefits">
          {DISCREET_STILL_ALLOWED.map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden />
              <div>
                <strong>{item}</strong>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="premium-center__section card" aria-labelledby="discreet-renewal-title">
        <h2 id="discreet-renewal-title" className="premium-center__section-title">
          {status.active ? "Renewal" : "Purchase"}
        </h2>
        <p className="premium-center__muted">
          {DISCREET_PLAN.priceLabel} · {DISCREET_PLAN.days} days — Commerce activates Discreet after
          payment.
        </p>
        <div className="premium-plan-buttons">
          <button
            type="button"
            className="premium-plan-button"
            disabled={loading}
            onClick={onPurchase}
          >
            <span>
              <span className="premium-plan-button__name">
                {status.active ? "Renew Discreet" : "Get Discreet Membership"}
              </span>
              <span className="premium-plan-button__price">{DISCREET_PLAN.priceLabel}</span>
              <span className="premium-center__muted">{DISCREET_PLAN.days}-day membership</span>
            </span>
          </button>
        </div>
        {loading ? (
          <p className="premium-page__checkout-status" role="status">
            {MONETIZATION_COPY.checkoutLoading}
          </p>
        ) : null}
      </section>

      <section className="premium-center__section card" aria-labelledby="discreet-history-title">
        <h2 id="discreet-history-title" className="premium-center__section-title">
          History
        </h2>
        <CommercialTransactionList
          transactions={historyRows}
          emptyLabel={COMMERCIAL_DASHBOARD.emptyHistory}
        />
      </section>
    </div>
  );
}
