import type { CommercialTransaction } from "../../utils/commercialLedger";
import { formatEntitlementUntil } from "../../utils/memberEntitlements";
import { navigateToPath } from "../../constants/routes";

type CommercialTransactionListProps = {
  transactions: CommercialTransaction[];
  emptyLabel: string;
  limit?: number;
};

export function CommercialTransactionList({
  transactions,
  emptyLabel,
  limit = 12
}: CommercialTransactionListProps) {
  const rows = transactions.slice(0, limit);
  if (!rows.length) {
    return <p className="commercial-empty">{emptyLabel}</p>;
  }

  return (
    <ul className="commercial-tx-list">
      {rows.map((entry) => (
        <li key={entry.id} className="commercial-tx-list__item">
          <div className="commercial-tx-list__main">
            <strong>{entry.label}</strong>
            <p className="commercial-muted">
              {entry.detail}
              {entry.amountLabel ? ` · ${entry.amountLabel}` : ""}
            </p>
            <p className="commercial-muted commercial-muted--sm">
              {formatEntitlementUntil(entry.at)}
            </p>
          </div>
          <div className="commercial-tx-list__aside">
            <span
              className={`commercial-status commercial-status--${String(entry.status).toLowerCase()}`}
            >
              {entry.status}
            </span>
            {entry.href ? (
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => navigateToPath(entry.href!)}
              >
                View
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
