import { formatEntitlementUntil } from "../../utils/memberEntitlements";

export type FastConnectionPurchaseRecord = {
  id: string;
  productLabel: string;
  activatedAt: string;
  expiresAt: string | null;
  status: "Active" | "Expired";
};

type FastConnectionPurchaseHistoryProps = {
  purchases: FastConnectionPurchaseRecord[];
  loading?: boolean;
};

export function FastConnectionPurchaseHistory({ purchases, loading }: FastConnectionPurchaseHistoryProps) {
  if (loading) {
    return <p className="settings-help-hours">Loading purchase history…</p>;
  }

  if (!purchases.length) {
    return null;
  }

  return (
    <div className="fast-connection-purchase-history">
      <h3 className="fast-connection-purchase-history__title">Purchase history</h3>
      <ul className="fast-connection-purchase-history__list">
        {purchases.map((entry) => (
          <li key={entry.id} className="fast-connection-purchase-history__item">
            <strong>{entry.productLabel}</strong>
            <p>
              Activated: {formatEntitlementUntil(entry.activatedAt)}
              {entry.expiresAt ? (
                <>
                  <br />
                  Expires: {formatEntitlementUntil(entry.expiresAt)}
                </>
              ) : null}
            </p>
            <span
              className={`fast-connection-purchase-history__status fast-connection-purchase-history__status--${entry.status.toLowerCase()}`}
            >
              {entry.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
