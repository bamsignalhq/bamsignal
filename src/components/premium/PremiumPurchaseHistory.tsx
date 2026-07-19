import { formatPremiumPurchaseWhen, type PremiumPurchaseRecord } from "../../utils/premiumPurchaseHistory";

type PremiumPurchaseHistoryProps = {
  purchases: PremiumPurchaseRecord[];
};

export function PremiumPurchaseHistory({ purchases }: PremiumPurchaseHistoryProps) {
  if (!purchases.length) {
    return (
      <p className="premium-center__empty">Purchase history appears here after your first Discover Membership payment.</p>
    );
  }

  return (
    <ul className="premium-center__history-list">
      {purchases.map((entry) => (
        <li key={entry.id} className="premium-center__history-item">
          <div>
            <strong>{entry.planLabel}</strong>
            <p className="premium-center__muted">
              {formatPremiumPurchaseWhen(entry.purchasedAt)}
              {entry.expiresAt ? ` · until ${formatPremiumPurchaseWhen(entry.expiresAt)}` : ""}
            </p>
          </div>
          <span
            className={`premium-center__status premium-center__status--${entry.status.toLowerCase()}`}
          >
            {entry.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
