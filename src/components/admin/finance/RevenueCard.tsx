import type { FinanceRecord } from "../../../types/financeOperations";

type RevenueCardProps = {
  records: FinanceRecord[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function RevenueCard({ records }: RevenueCardProps) {
  const revenueRecords = records.filter(
    (record) =>
      (record.areaId === "revenue" || record.areaId === "consultation-fees") &&
      (record.status === "paid" || record.status === "settled")
  );
  const total = revenueRecords.reduce((sum, record) => sum + record.amountNgn, 0);

  return (
    <section className="revenue-card concierge-consultant-card--glass cc-reveal">
      <header className="revenue-card__head">
        <h3>Revenue</h3>
        <p>Total paid/settled: {formatNgn(total)}</p>
      </header>

      {revenueRecords.length ? (
        <ul className="revenue-card__list">
          {revenueRecords.map((record) => (
            <li key={record.id}>
              <strong>{record.transactionRef}</strong>
              <span>{formatNgn(record.amountNgn)}</span>
              <span>{record.journeyRef ?? "—"}</span>
              <p>{record.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="revenue-card__empty">No revenue records in current view.</p>
      )}
    </section>
  );
}
